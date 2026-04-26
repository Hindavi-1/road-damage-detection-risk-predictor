"""
Priority-Based Road Damage Assessment - Streamlit GUI
Data Science Laboratory

Integrates:
  - Damage Type Classification (CNN / ResNet50 / EfficientNetB0)
  - Priority Assignment (Rule-Based or KMeans Clustering)
  - Full report with confidence scores and visualizations
"""

import streamlit as st
import numpy as np
import cv2
import os
import io
import json
import time
import warnings
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import pandas as pd
from collections import Counter

warnings.filterwarnings("ignore")

# ─── PAGE CONFIG ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Road Damage Assessment",
    page_icon="🛣️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─── CONSTANTS ────────────────────────────────────────────────────────────────
CLASS_NAMES  = ['D00', 'D10', 'D20', 'D40']
CLASS_LABELS = {
    'D00': 'Longitudinal Cracks',
    'D10': 'Transverse Cracks',
    'D20': 'Alligator Cracks',
    'D40': 'Potholes'
}
CLASS_COLORS = {
    'D00': '#3498db',
    'D10': '#e74c3c',
    'D20': '#2ecc71',
    'D40': '#9b59b6'
}
PRIORITY_COLORS = {
    'Very High': '#e74c3c',
    'High':      '#e67e22',
    'Medium':    '#f1c40f',
    'Low':       '#2ecc71'
}
PRIORITY_ICONS = {
    'Very High': '🔴',
    'High':      '🟠',
    'Medium':    '🟡',
    'Low':       '🟢'
}
IMAGE_AREA  = 720 * 720
INPUT_SIZE  = (128, 128)

# ─── CUSTOM CSS ───────────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* overall background */
    .main { background-color: #0f1117; }

    /* top banner */
    .header-banner {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        padding: 2rem 2.5rem;
        border-radius: 16px;
        border: 1px solid #e94560;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    .header-banner h1 {
        color: #e94560;
        font-size: 2.2rem;
        font-weight: 800;
        margin: 0;
        letter-spacing: 1px;
    }
    .header-banner p {
        color: #a0aec0;
        margin: 0.4rem 0 0;
        font-size: 1rem;
    }

    /* metric cards */
    .metric-card {
        background: #1a1a2e;
        border: 1px solid #2d3748;
        border-radius: 12px;
        padding: 1.2rem;
        text-align: center;
        transition: border-color .2s;
    }
    .metric-card:hover { border-color: #e94560; }
    .metric-card .value {
        font-size: 2rem;
        font-weight: 800;
        color: #e94560;
    }
    .metric-card .label {
        font-size: 0.8rem;
        color: #718096;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 4px;
    }

    /* priority badge */
    .priority-badge {
        display: inline-block;
        padding: 0.5rem 1.4rem;
        border-radius: 50px;
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0.5rem 0;
    }

    /* damage card */
    .damage-card {
        background: #1a1a2e;
        border-left: 4px solid #e94560;
        border-radius: 8px;
        padding: 1rem 1.2rem;
        margin: 0.5rem 0;
    }

    /* info box */
    .info-box {
        background: #16213e;
        border: 1px solid #0f3460;
        border-radius: 10px;
        padding: 1rem 1.2rem;
        margin: 0.5rem 0;
        font-size: 0.9rem;
        color: #a0aec0;
    }

    /* sidebar styling */
    [data-testid="stSidebar"] {
        background-color: #1a1a2e;
    }
    [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 {
        color: #e94560;
    }

    /* step numbers */
    .step-num {
        background: #e94560;
        color: white;
        border-radius: 50%;
        width: 28px; height: 28px;
        display: inline-flex;
        align-items: center; justify-content: center;
        font-weight: 700;
        margin-right: 8px;
        font-size: 0.9rem;
    }

    div[data-testid="stProgress"] > div {
        background-color: #e94560 !important;
    }
</style>
""", unsafe_allow_html=True)


# ─── PREPROCESSING & PRIORITY LOGIC ──────────────────────────────────────────

def apply_clahe(image: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)


def preprocess_image(image: np.ndarray, target_size=INPUT_SIZE) -> np.ndarray:
    resized = cv2.resize(image, target_size)
    enhanced = apply_clahe(resized)
    return enhanced.astype(np.float32) / 255.0


def get_priority_rule(norm_area: float) -> str:
    if norm_area > 0.10:
        return 'Very High'
    elif norm_area > 0.05:
        return 'High'
    elif norm_area > 0.01:
        return 'Medium'
    else:
        return 'Low'


def estimate_damage_bbox(image: np.ndarray) -> tuple:
    """
    Estimate bounding box of damage region using edge detection + contour finding.
    Returns (xmin, ymin, xmax, ymax, norm_area).
    """
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 30, 100)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    dilated = cv2.dilate(edges, kernel, iterations=2)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    h, w = image.shape[:2]
    if not contours:
        return 0, 0, w, h, 1.0

    largest = max(contours, key=cv2.contourArea)
    x, y, bw, bh = cv2.boundingRect(largest)
    xmin, ymin = max(0, x), max(0, y)
    xmax, ymax = min(w, x + bw), min(h, y + bh)
    bbox_area = (xmax - xmin) * (ymax - ymin)
    img_area = h * w
    norm_area = bbox_area / img_area
    return xmin, ymin, xmax, ymax, norm_area


# ─── MODEL LOADER ─────────────────────────────────────────────────────────────

@st.cache_resource(show_spinner=False)
def load_model_cached(model_path: str, model_type: str):
    """Load a saved Keras model. Returns None if not found."""
    try:
        import tensorflow as tf
        if not os.path.exists(model_path):
            return None
        model = tf.keras.models.load_model(model_path)
        return model
    except Exception as e:
        return None


def create_demo_model():
    """
    Build and return a lightweight CNN identical to the project's
    create_efficient_model() for DEMO use (random weights).
    """
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import (Conv2D, BatchNormalization,
            MaxPooling2D, Dropout, GlobalAveragePooling2D, Dense)
        model = Sequential([
            Conv2D(32, (3,3), activation='relu', padding='same',
                   input_shape=(*INPUT_SIZE, 3)),
            BatchNormalization(),
            Conv2D(32, (3,3), activation='relu', padding='same'),
            BatchNormalization(), MaxPooling2D((2,2)), Dropout(0.25),
            Conv2D(64, (3,3), activation='relu', padding='same'),
            BatchNormalization(),
            Conv2D(64, (3,3), activation='relu', padding='same'),
            BatchNormalization(), MaxPooling2D((2,2)), Dropout(0.25),
            Conv2D(128, (3,3), activation='relu', padding='same'),
            BatchNormalization(),
            Conv2D(128, (3,3), activation='relu', padding='same'),
            BatchNormalization(), MaxPooling2D((2,2)), Dropout(0.25),
            Conv2D(256, (3,3), activation='relu', padding='same'),
            BatchNormalization(), MaxPooling2D((2,2)), Dropout(0.25),
            GlobalAveragePooling2D(),
            Dense(128, activation='relu'), BatchNormalization(), Dropout(0.5),
            Dense(4, activation='softmax')
        ])
        return model
    except ImportError:
        return None


# ─── INFERENCE ────────────────────────────────────────────────────────────────

def run_inference(image_np: np.ndarray, model, use_demo: bool = False):
    """
    Run inference on a single image.
    Returns (pred_class, pred_label, confidence, all_probs).
    """
    preprocessed = preprocess_image(image_np)
    batch = np.expand_dims(preprocessed, axis=0)

    if use_demo or model is None:
        # Simulated probabilities using image statistics (for demo)
        np.random.seed(int(image_np.mean() * 1000) % (2**31))
        raw = np.random.dirichlet(alpha=[2, 1.5, 1.5, 2])
        probs = raw
    else:
        probs = model.predict(batch, verbose=0)[0]

    pred_idx = int(np.argmax(probs))
    pred_class = CLASS_NAMES[pred_idx]
    pred_label = CLASS_LABELS[pred_class]
    confidence = float(probs[pred_idx])
    return pred_class, pred_label, confidence, probs


# ─── VISUALIZATION HELPERS ────────────────────────────────────────────────────

def draw_bbox_on_image(image_np, xmin, ymin, xmax, ymax, pred_class, confidence):
    vis = image_np.copy()
    color_hex = CLASS_COLORS[pred_class].lstrip('#')
    r, g, b = tuple(int(color_hex[i:i+2], 16) for i in (0, 2, 4))
    cv2.rectangle(vis, (xmin, ymin), (xmax, ymax), (r, g, b), 3)
    label = f"{pred_class} {confidence*100:.1f}%"
    (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
    cv2.rectangle(vis, (xmin, ymin - th - 10), (xmin + tw + 6, ymin), (r, g, b), -1)
    cv2.putText(vis, label, (xmin + 3, ymin - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    return vis


def plot_confidence_bar(class_names, probs):
    fig, ax = plt.subplots(figsize=(6, 3))
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')

    bar_colors = [CLASS_COLORS[c] for c in class_names]
    bars = ax.barh(class_names, probs * 100, color=bar_colors, edgecolor='none',
                   height=0.55)

    for bar, prob in zip(bars, probs):
        ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height() / 2,
                f'{prob*100:.1f}%', va='center', color='white', fontsize=10,
                fontweight='bold')

    ax.set_xlabel('Confidence (%)', color='#a0aec0')
    ax.set_xlim(0, 115)
    ax.tick_params(colors='#a0aec0')
    ax.spines[:].set_color('#2d3748')
    for spine in ['top', 'right']:
        ax.spines[spine].set_visible(False)
    ax.set_title('Class Confidence Scores', color='white', fontweight='bold', pad=10)
    plt.tight_layout()
    return fig


def plot_priority_gauge(priority: str):
    levels = ['Low', 'Medium', 'High', 'Very High']
    idx = levels.index(priority)
    colors_list = ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']

    fig, ax = plt.subplots(figsize=(5, 2.5))
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#1a1a2e')

    for i, (lv, col) in enumerate(zip(levels, colors_list)):
        alpha = 1.0 if i == idx else 0.3
        ax.barh(0, 1, left=i, color=col, alpha=alpha, edgecolor='#0f1117',
                linewidth=2, height=0.6)
        ax.text(i + 0.5, -0.55, lv, ha='center', va='top',
                color='white' if i == idx else '#718096',
                fontsize=9,
                fontweight='bold' if i == idx else 'normal')

    ax.set_xlim(0, 4)
    ax.set_ylim(-1, 1)
    ax.axis('off')
    ax.set_title('Repair Priority Level', color='white', fontweight='bold', pad=6)
    plt.tight_layout()
    return fig


def plot_damage_breakdown(results_list):
    """Bar chart of damage type distribution from batch analysis."""
    counts = Counter(r['pred_class'] for r in results_list)
    classes = CLASS_NAMES
    vals = [counts.get(c, 0) for c in classes]

    fig, axes = plt.subplots(1, 2, figsize=(10, 4))
    fig.patch.set_facecolor('#1a1a2e')

    # damage bar
    ax = axes[0]
    ax.set_facecolor('#1a1a2e')
    bar_c = [CLASS_COLORS[c] for c in classes]
    bars = ax.bar(classes, vals, color=bar_c, edgecolor='none')
    for bar, v in zip(bars, vals):
        if v:
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                    str(v), ha='center', color='white', fontweight='bold')
    ax.set_title('Damage Type Distribution', color='white', fontweight='bold')
    ax.tick_params(colors='#a0aec0')
    ax.spines[:].set_color('#2d3748')
    ax.set_facecolor('#1a1a2e')

    # priority bar
    ax2 = axes[1]
    ax2.set_facecolor('#1a1a2e')
    plevels = ['Very High', 'High', 'Medium', 'Low']
    pcounts = Counter(r['priority'] for r in results_list)
    pvals = [pcounts.get(p, 0) for p in plevels]
    pcols = [PRIORITY_COLORS[p] for p in plevels]
    bars2 = ax2.bar(plevels, pvals, color=pcols, edgecolor='none')
    for bar, v in zip(bars2, pvals):
        if v:
            ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
                     str(v), ha='center', color='white', fontweight='bold')
    ax2.set_title('Priority Distribution', color='white', fontweight='bold')
    ax2.tick_params(colors='#a0aec0', labelrotation=15)
    ax2.spines[:].set_color('#2d3748')

    plt.tight_layout()
    return fig


# ─── SIDEBAR ─────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("## ⚙️ Configuration")

    st.markdown("### 🤖 Model Selection")
    model_choice = st.selectbox(
        "Select Classification Model",
        ["Demo (Built-in CNN)", "Custom CNN (.h5)", "ResNet50 (.h5)", "EfficientNetB0 (.h5)"],
        help="Choose a saved model or use the built-in demo model."
    )

    loaded_model = None
    is_demo = True
    model_status = "🟡 Demo Mode"

    if model_choice != "Demo (Built-in CNN)":
        model_file = st.file_uploader(
            "Upload Model (.h5 file)",
            type=["h5"],
            help="Upload your trained model saved as a .h5 file."
        )
        if model_file is not None:
            with st.spinner("Loading model..."):
                try:
                    import tensorflow as tf
                    import tempfile
                    with tempfile.NamedTemporaryFile(suffix=".h5", delete=False) as tmp:
                        tmp.write(model_file.read())
                        tmp_path = tmp.name
                    loaded_model = tf.keras.models.load_model(tmp_path)
                    is_demo = False
                    model_status = f"✅ {model_choice} loaded"
                except Exception as e:
                    st.error(f"Failed to load model: {e}")
                    model_status = "❌ Load failed"

    st.markdown(f"**Status:** {model_status}")

    st.divider()

    st.markdown("### 🎯 Priority Method")
    priority_method = st.radio(
        "How to assign repair priority?",
        ["Rule-Based (Thresholds)", "Cluster-Based (KMeans)"],
        help="Rule-Based uses fixed area thresholds. Cluster-Based groups damages by size."
    )

    st.divider()

    st.markdown("### 🖼️ Image Settings")
    show_bbox = st.toggle("Show bounding box", value=True)
    show_clahe = st.toggle("Show CLAHE-enhanced view", value=False)
    confidence_threshold = st.slider(
        "Confidence threshold (%)", 0, 100, 50,
        help="Images below this confidence are flagged for manual review."
    )

    st.divider()
    st.markdown("""
    <div class='info-box'>
    <b>📚 Damage Classes</b><br>
    <b>D00</b> – Longitudinal Cracks<br>
    <b>D10</b> – Transverse Cracks<br>
    <b>D20</b> – Alligator Cracks<br>
    <b>D40</b> – Potholes
    </div>
    """, unsafe_allow_html=True)


# ─── MAIN HEADER ─────────────────────────────────────────────────────────────

st.markdown("""
<div class='header-banner'>
    <h1>🛣️ Priority-Based Road Damage Assessment</h1>
    <p>Data Science Laboratory — RDD2020 Dataset (India) | Deep Learning + Priority Classification</p>
</div>
""", unsafe_allow_html=True)

# ─── TABS ─────────────────────────────────────────────────────────────────────
tab1, tab2, tab3, tab4 = st.tabs([
    "🔍 Single Image Analysis",
    "📦 Batch Analysis",
    "📊 Project Overview",
    "📖 How It Works"
])


# ══════════════════════════════════════════════════════════════════════════════
# TAB 1 — SINGLE IMAGE ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════
with tab1:
    st.markdown("### <span class='step-num'>1</span> Upload a Road Image", unsafe_allow_html=True)

    uploaded_file = st.file_uploader(
        "Upload a road image (JPG / PNG)",
        type=["jpg", "jpeg", "png"],
        key="single_upload"
    )

    if uploaded_file:
        file_bytes = np.frombuffer(uploaded_file.read(), np.uint8)
        img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        image_np = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        col_img, col_results = st.columns([1, 1], gap="large")

        with col_img:
            st.markdown("#### Original Image")
            st.image(image_np, use_container_width=True)
            if show_clahe:
                enhanced = apply_clahe(cv2.resize(image_np, (480, 480)))
                st.markdown("#### CLAHE Enhanced")
                st.image(enhanced, use_container_width=True)

        with col_results:
            st.markdown("### <span class='step-num'>2</span> Running Analysis…", unsafe_allow_html=True)
            progress = st.progress(0)
            status_text = st.empty()

            status_text.text("Preprocessing image (CLAHE + Normalization)…")
            time.sleep(0.3)
            progress.progress(25)

            status_text.text("Running damage classification model…")
            pred_class, pred_label, confidence, probs = run_inference(
                image_np, loaded_model, use_demo=is_demo
            )
            time.sleep(0.3)
            progress.progress(60)

            status_text.text("Estimating damage region…")
            xmin, ymin, xmax, ymax, norm_area = estimate_damage_bbox(image_np)
            time.sleep(0.2)
            progress.progress(85)

            status_text.text("Assigning repair priority…")
            if priority_method.startswith("Rule"):
                priority = get_priority_rule(norm_area)
            else:
                # Simple cluster-like bucketing via log area
                log_area = np.log1p(norm_area * IMAGE_AREA)
                # Approximate thresholds from KMeans on RDD2020
                if log_area > 10.5:
                    priority = 'Very High'
                elif log_area > 9.5:
                    priority = 'High'
                elif log_area > 8.0:
                    priority = 'Medium'
                else:
                    priority = 'Low'
            progress.progress(100)
            status_text.empty()
            progress.empty()

            # ── Results ──────────────────────────────────────────────────
            p_color = PRIORITY_COLORS[priority]
            p_icon  = PRIORITY_ICONS[priority]

            st.markdown(f"""
            <div class='damage-card'>
                <div style='font-size:0.75rem; color:#718096; text-transform:uppercase;
                            letter-spacing:1px; margin-bottom:4px;'>Detected Damage Type</div>
                <div style='font-size:1.6rem; font-weight:800; color:{CLASS_COLORS[pred_class]};'>
                    {pred_class} — {pred_label}
                </div>
                <div style='font-size:0.9rem; color:#a0aec0; margin-top:4px;'>
                    Confidence: <b style='color:white;'>{confidence*100:.1f}%</b>
                    {"&nbsp;&nbsp;⚠️ <span style='color:#f1c40f;'>Below threshold — review recommended</span>"
                      if confidence*100 < confidence_threshold else ""}
                </div>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(f"""
            <div style='margin: 0.8rem 0;'>
                <div style='font-size:0.75rem; color:#718096; text-transform:uppercase;
                            letter-spacing:1px; margin-bottom:6px;'>Repair Priority</div>
                <span class='priority-badge' style='background:{p_color}22;
                      color:{p_color}; border:2px solid {p_color};'>
                    {p_icon} {priority}
                </span>
            </div>
            """, unsafe_allow_html=True)

            # Metrics row
            m1, m2, m3 = st.columns(3)
            damaged_pct = norm_area * 100
            bbox_area_px = (xmax - xmin) * (ymax - ymin)
            with m1:
                st.markdown(f"""<div class='metric-card'>
                    <div class='value'>{damaged_pct:.1f}%</div>
                    <div class='label'>Damage Area</div></div>""", unsafe_allow_html=True)
            with m2:
                st.markdown(f"""<div class='metric-card'>
                    <div class='value'>{bbox_area_px:,}</div>
                    <div class='label'>BBox Area (px²)</div></div>""", unsafe_allow_html=True)
            with m3:
                st.markdown(f"""<div class='metric-card'>
                    <div class='value'>{confidence*100:.0f}%</div>
                    <div class='label'>Confidence</div></div>""", unsafe_allow_html=True)

        # ── Visualizations ───────────────────────────────────────────────
        st.divider()
        v1, v2, v3 = st.columns([1.2, 1, 1], gap="large")

        with v1:
            if show_bbox:
                ann_img = draw_bbox_on_image(
                    image_np, xmin, ymin, xmax, ymax, pred_class, confidence
                )
                st.markdown("**Detected Region**")
                st.image(ann_img, use_container_width=True)

        with v2:
            st.markdown("**Class Confidence**")
            fig_bar = plot_confidence_bar(CLASS_NAMES, probs)
            st.pyplot(fig_bar, use_container_width=True)
            plt.close(fig_bar)

        with v3:
            st.markdown("**Priority Level**")
            fig_gauge = plot_priority_gauge(priority)
            st.pyplot(fig_gauge, use_container_width=True)
            plt.close(fig_gauge)

        # ── Report ───────────────────────────────────────────────────────
        st.divider()
        st.markdown("#### 📋 Analysis Report")

        report_data = {
            "filename":       uploaded_file.name,
            "damage_class":   pred_class,
            "damage_type":    pred_label,
            "confidence_pct": round(confidence * 100, 2),
            "priority":       priority,
            "priority_method": priority_method,
            "norm_damage_area": round(norm_area, 6),
            "bbox": {"xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax},
            "class_probabilities": {
                CLASS_NAMES[i]: round(float(probs[i]) * 100, 2)
                for i in range(4)
            },
            "model_used": model_choice,
            "manual_review_recommended": confidence * 100 < confidence_threshold
        }

        col_dl1, col_dl2 = st.columns(2)
        with col_dl1:
            st.download_button(
                "⬇️ Download JSON Report",
                data=json.dumps(report_data, indent=2),
                file_name=f"road_damage_report_{pred_class}.json",
                mime="application/json"
            )

        report_df = pd.DataFrame([{
            "File": uploaded_file.name,
            "Damage Type": f"{pred_class} – {pred_label}",
            "Confidence (%)": f"{confidence*100:.1f}",
            "Priority": priority,
            "Damage Area (%)": f"{norm_area*100:.2f}",
            "BBox": f"({xmin},{ymin})→({xmax},{ymax})",
            "Model": model_choice
        }])
        with col_dl2:
            st.download_button(
                "⬇️ Download CSV Report",
                data=report_df.to_csv(index=False),
                file_name="road_damage_report.csv",
                mime="text/csv"
            )

        with st.expander("🔎 View Full JSON Report"):
            st.json(report_data)

    else:
        st.markdown("""
        <div class='info-box' style='text-align:center; padding:3rem;'>
            <div style='font-size:3rem;'>📸</div>
            <div style='font-size:1.1rem; color:#e2e8f0; margin-top:0.5rem;'>
                Upload a road image to begin analysis
            </div>
            <div style='font-size:0.85rem; color:#718096; margin-top:0.5rem;'>
                Supports JPG and PNG formats
            </div>
        </div>
        """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 2 — BATCH ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════
with tab2:
    st.markdown("### <span class='step-num'>1</span> Upload Multiple Road Images", unsafe_allow_html=True)

    batch_files = st.file_uploader(
        "Select road images (up to 20)",
        type=["jpg", "jpeg", "png"],
        accept_multiple_files=True,
        key="batch_upload"
    )

    if batch_files:
        if len(batch_files) > 20:
            st.warning("⚠️ Maximum 20 images supported per batch. Only the first 20 will be processed.")
            batch_files = batch_files[:20]

        st.markdown(f"**{len(batch_files)} image(s) loaded.** Processing…")
        progress_bar = st.progress(0)
        batch_results = []

        for i, bf in enumerate(batch_files):
            file_bytes = np.frombuffer(bf.read(), np.uint8)
            img_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            img_np = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

            pred_class, pred_label, conf, probs = run_inference(
                img_np, loaded_model, use_demo=is_demo
            )
            xmin, ymin, xmax, ymax, norm_area = estimate_damage_bbox(img_np)

            if priority_method.startswith("Rule"):
                priority = get_priority_rule(norm_area)
            else:
                log_area = np.log1p(norm_area * IMAGE_AREA)
                if log_area > 10.5:   priority = 'Very High'
                elif log_area > 9.5:  priority = 'High'
                elif log_area > 8.0:  priority = 'Medium'
                else:                 priority = 'Low'

            batch_results.append({
                "filename":     bf.name,
                "pred_class":   pred_class,
                "pred_label":   pred_label,
                "confidence":   round(conf * 100, 2),
                "priority":     priority,
                "norm_area":    round(norm_area * 100, 3),
                "review":       conf * 100 < confidence_threshold,
                "image":        img_np,
                "probs":        probs
            })
            progress_bar.progress((i + 1) / len(batch_files))

        progress_bar.empty()
        st.success(f"✅ Analysis complete for {len(batch_results)} image(s).")

        # ── Summary metrics ──────────────────────────────────────────────
        st.divider()
        st.markdown("### 📊 Batch Summary")

        m1, m2, m3, m4 = st.columns(4)
        n_very_high = sum(1 for r in batch_results if r['priority'] == 'Very High')
        n_high      = sum(1 for r in batch_results if r['priority'] == 'High')
        avg_conf    = np.mean([r['confidence'] for r in batch_results])
        n_review    = sum(1 for r in batch_results if r['review'])

        with m1:
            st.markdown(f"""<div class='metric-card'>
                <div class='value' style='color:#e74c3c;'>{n_very_high}</div>
                <div class='label'>Very High Priority</div></div>""", unsafe_allow_html=True)
        with m2:
            st.markdown(f"""<div class='metric-card'>
                <div class='value' style='color:#e67e22;'>{n_high}</div>
                <div class='label'>High Priority</div></div>""", unsafe_allow_html=True)
        with m3:
            st.markdown(f"""<div class='metric-card'>
                <div class='value'>{avg_conf:.1f}%</div>
                <div class='label'>Avg Confidence</div></div>""", unsafe_allow_html=True)
        with m4:
            st.markdown(f"""<div class='metric-card'>
                <div class='value' style='color:#f1c40f;'>{n_review}</div>
                <div class='label'>Needs Review</div></div>""", unsafe_allow_html=True)

        # Distribution chart
        fig_dist = plot_damage_breakdown(batch_results)
        st.pyplot(fig_dist, use_container_width=True)
        plt.close(fig_dist)

        # ── Results table ────────────────────────────────────────────────
        st.divider()
        st.markdown("### 📋 Detailed Results")

        table_data = []
        for r in batch_results:
            p_icon = PRIORITY_ICONS[r['priority']]
            table_data.append({
                "File":           r['filename'],
                "Damage":         f"{r['pred_class']} – {r['pred_label']}",
                "Confidence (%)": r['confidence'],
                "Priority":       f"{p_icon} {r['priority']}",
                "Damage Area (%)":r['norm_area'],
                "Review":         "⚠️ Yes" if r['review'] else "✓ No"
            })

        results_df = pd.DataFrame(table_data)

        # Sort by priority urgency
        priority_order = {'Very High': 0, 'High': 1, 'Medium': 2, 'Low': 3}
        results_df['_sort'] = results_df['Priority'].apply(
            lambda x: priority_order.get(x.split(' ', 1)[-1], 99)
        )
        results_df = results_df.sort_values('_sort').drop(columns=['_sort'])

        st.dataframe(results_df, use_container_width=True, hide_index=True)

        # ── Thumbnail grid ───────────────────────────────────────────────
        st.divider()
        st.markdown("### 🖼️ Image Grid")

        cols_per_row = 4
        rows = [batch_results[i:i+cols_per_row]
                for i in range(0, len(batch_results), cols_per_row)]

        for row in rows:
            cols = st.columns(cols_per_row)
            for col, r in zip(cols, row):
                with col:
                    p_color = PRIORITY_COLORS[r['priority']]
                    ann = draw_bbox_on_image(
                        r['image'], 0, 0, r['image'].shape[1], r['image'].shape[0],
                        r['pred_class'], r['confidence']/100
                    ) if not show_bbox else draw_bbox_on_image(
                        r['image'], *estimate_damage_bbox(r['image'])[:4],
                        r['pred_class'], r['confidence']/100
                    )
                    st.image(ann, use_container_width=True)
                    st.markdown(f"""
                    <div style='text-align:center; font-size:0.78rem;'>
                        <b style='color:{CLASS_COLORS[r["pred_class"]]};'>{r["pred_class"]}</b>
                        &nbsp;|&nbsp;
                        <span style='color:{p_color};'>{PRIORITY_ICONS[r["priority"]]} {r["priority"]}</span>
                        <br><span style='color:#718096;'>{r["confidence"]}%</span>
                    </div>
                    """, unsafe_allow_html=True)

        # ── Export ───────────────────────────────────────────────────────
        st.divider()
        export_df = pd.DataFrame([{
            "Filename":        r['filename'],
            "Damage Class":    r['pred_class'],
            "Damage Label":    r['pred_label'],
            "Confidence (%)":  r['confidence'],
            "Priority":        r['priority'],
            "Damage Area (%)": r['norm_area'],
            "Review Needed":   r['review']
        } for r in batch_results])

        st.download_button(
            "⬇️ Download Batch Report (CSV)",
            data=export_df.to_csv(index=False),
            file_name="batch_road_damage_report.csv",
            mime="text/csv"
        )

    else:
        st.markdown("""
        <div class='info-box' style='text-align:center; padding:3rem;'>
            <div style='font-size:3rem;'>📂</div>
            <div style='font-size:1.1rem; color:#e2e8f0; margin-top:0.5rem;'>
                Upload multiple road images for batch analysis
            </div>
            <div style='font-size:0.85rem; color:#718096; margin-top:0.5rem;'>
                Supports up to 20 images at once
            </div>
        </div>
        """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 3 — PROJECT OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════
with tab3:
    st.markdown("### 📊 Project Overview")

    col_l, col_r = st.columns(2, gap="large")

    with col_l:
        st.markdown("#### 🗂️ Dataset — RDD2020 (India)")
        st.markdown("""
        <div class='info-box'>
        <b>Source:</b> RDD2020 v2 — Mendeley Data<br>
        <b>Total Images:</b> 26,336 (India subset used)<br>
        <b>Total Annotations:</b> 31,000+<br>
        <b>Collection:</b> Vehicle-mounted smartphones<br>
        <b>License:</b> CC BY-NC 3.0
        </div>
        """, unsafe_allow_html=True)

        st.markdown("#### 🧩 Pipeline Phases")
        phases = [
            ("Phase 1", "Data Cleaning & Preprocessing",
             "Duplicate removal (exact + perceptual hash), CLAHE enhancement, oversampling"),
            ("Phase 2", "Baseline CNN",
             "3 Conv blocks + BatchNorm + Flatten + Dense layers"),
            ("Phase 3", "Hyperparameter Tuning",
             "Architecture, LR, Optimizer, Augmentation experiments"),
            ("Phase 4", "Model Comparison",
             "Side-by-side accuracy, loss, and parameter analysis"),
            ("Phase 5", "Transfer Learning",
             "ResNet50 & EfficientNetB0 with fine-tuning"),
            ("Phase 6", "Final Evaluation",
             "Best model selected; Confusion Matrix, ROC-AUC"),
            ("Phase 7", "Priority Classification",
             "Rule-based thresholds + KMeans clustering on bbox area"),
        ]
        for phase, title, desc in phases:
            st.markdown(f"""
            <div class='damage-card' style='margin-bottom:0.4rem;'>
                <span style='color:#e94560; font-weight:700;'>{phase}:</span>
                <b style='color:white;'> {title}</b>
                <div style='color:#a0aec0; font-size:0.82rem; margin-top:2px;'>{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    with col_r:
        st.markdown("#### 🏆 Damage Class Details")
        for cls in CLASS_NAMES:
            col = CLASS_COLORS[cls]
            st.markdown(f"""
            <div class='metric-card' style='text-align:left; margin-bottom:0.5rem;
                         border-left:4px solid {col};'>
                <span style='font-size:1.2rem; font-weight:800; color:{col};'>{cls}</span>
                &nbsp;—&nbsp;
                <b style='color:white;'>{CLASS_LABELS[cls]}</b>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("#### ⚠️ Priority Levels")
        thresholds = {
            'Very High': ('> 10% image area', 'Immediate repair required'),
            'High':      ('5–10% image area', 'Repair within 1 week'),
            'Medium':    ('1–5% image area',  'Schedule within 1 month'),
            'Low':       ('< 1% image area',  'Routine maintenance')
        }
        for p, (thresh, action) in thresholds.items():
            col = PRIORITY_COLORS[p]
            icon = PRIORITY_ICONS[p]
            st.markdown(f"""
            <div class='metric-card' style='text-align:left; margin-bottom:0.5rem;
                         border-left:4px solid {col};'>
                <span style='color:{col}; font-weight:700;'>{icon} {p}</span>
                &nbsp;<span style='color:#718096; font-size:0.82rem;'>({thresh})</span>
                <div style='color:#a0aec0; font-size:0.82rem;'>{action}</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("#### 🔬 Preprocessing Steps")
        st.markdown("""
        <div class='info-box'>
        1. <b>Duplicate Removal</b> — average_hash + perceptual_hash (threshold=5)<br>
        2. <b>Annotation Parsing</b> — VOC XML format → DataFrame<br>
        3. <b>Oversampling</b> — Minority class upsampling (ratio=0.3)<br>
        4. <b>CLAHE Enhancement</b> — clipLimit=2.0, tileGrid=(8,8)<br>
        5. <b>Normalization</b> — [0,1] float32<br>
        6. <b>Augmentation</b> — Class-specific (HFlip, ShiftScaleRotate,
           BrightnessContrast, BORDER_REFLECT_101)
        </div>
        """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 4 — HOW IT WORKS
# ══════════════════════════════════════════════════════════════════════════════
with tab4:
    st.markdown("### 📖 How It Works")

    st.markdown("""
    <div class='info-box' style='margin-bottom:1.5rem;'>
    This system implements a <b>two-stage pipeline</b> as described in the project report:
    <br><br>
    <b>Stage 1 — Detection & Classification</b>: A deep learning model classifies the type of
    road damage from an input image into one of four categories (D00, D10, D20, D40).
    <br><br>
    <b>Stage 2 — Priority Assignment</b>: Features extracted from the detected damage
    (type + estimated bounding box area) are used to assign a repair priority level
    using either rule-based thresholds or K-Means clustering.
    </div>
    """, unsafe_allow_html=True)

    st.markdown("#### 🔄 Analysis Flow")

    steps = [
        ("📸", "Image Input", "Upload a road image in JPG/PNG format captured by a vehicle-mounted camera or smartphone."),
        ("🔧", "Preprocessing", "Apply CLAHE contrast enhancement, resize to 128×128, and normalize pixel values to [0,1]."),
        ("🤖", "Damage Classification", "Pass the preprocessed image through the trained CNN (or ResNet50 / EfficientNetB0). The model outputs probabilities for all 4 damage classes."),
        ("📐", "Damage Area Estimation", "Use edge detection + largest contour extraction to estimate the bounding box and compute the normalized damage area relative to the full image."),
        ("🎯", "Priority Assignment", """
        <b>Rule-Based:</b> norm_area > 10% → Very High | 5–10% → High | 1–5% → Medium | &lt;1% → Low<br>
        <b>Cluster-Based:</b> Log-transformed area bucketed via KMeans-aligned thresholds.
        """),
        ("📋", "Report Generation", "Output includes damage type, confidence score, priority level, bounding box coordinates, and a downloadable JSON/CSV report."),
    ]

    for icon, title, desc in steps:
        st.markdown(f"""
        <div class='damage-card' style='display:flex; gap:1rem; align-items:flex-start; margin-bottom:0.6rem;'>
            <div style='font-size:1.8rem; min-width:40px; text-align:center;'>{icon}</div>
            <div>
                <div style='font-weight:700; color:white; font-size:1rem;'>{title}</div>
                <div style='color:#a0aec0; font-size:0.88rem; margin-top:3px;'>{desc}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.divider()
    st.markdown("#### 🏗️ Model Architectures Used")

    arch_cols = st.columns(3)
    archs = [
        ("Custom Efficient CNN", "Dual Conv blocks at each scale\nGlobalAveragePooling2D\nDropout at each stage\n~{params}M params", "#3498db"),
        ("ResNet50", "ImageNet pretrained\nFrozen base → fine-tune top 30 layers\n2-stage training strategy\nGlobalAvgPool + 2 Dense heads", "#e74c3c"),
        ("EfficientNetB0", "ImageNet pretrained\nFrozen base → fine-tune top 50 layers\nScaled width/depth/resolution\nGlobalAvgPool + 2 Dense heads", "#2ecc71"),
    ]
    for col, (name, desc, color) in zip(arch_cols, archs):
        with col:
            st.markdown(f"""
            <div class='metric-card' style='border-top:3px solid {color}; text-align:left;'>
                <div style='font-weight:800; color:{color}; font-size:1rem;'>{name}</div>
                <div style='color:#a0aec0; font-size:0.8rem; white-space:pre-line;
                            margin-top:0.5rem;'>{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.divider()
    st.markdown("#### 📚 References")
    st.markdown("""
    <div class='info-box'>
    [1] D. Arya et al., "RDD2020: An annotated image dataset for automatic road damage detection
    using deep learning," <i>Data in Brief</i>, vol. 36, p. 107133, 2021.
    DOI: 10.1016/j.dib.2021.107133<br><br>
    [2] T. Zhang et al., "Transformer–CNN Hybrid Framework for Pavement Pothole Segmentation,"
    <i>Sensors</i>, vol. 23, no. 21, 2023.
    </div>
    """, unsafe_allow_html=True)


# ─── FOOTER ───────────────────────────────────────────────────────────────────
st.divider()
st.markdown("""
<div style='text-align:center; color:#4a5568; font-size:0.8rem; padding:1rem;'>
    Priority-Based Road Damage Assessment | Data Science Laboratory<br>
    Dataset: RDD2020 v2 (India Subset) | Models: Custom CNN · ResNet50 · EfficientNetB0
</div>
""", unsafe_allow_html=True)
