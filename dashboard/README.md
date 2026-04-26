# 🛣️ Priority-Based Road Damage Assessment — Streamlit GUI

RDD2020 Dataset (India Subset)

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the app
```bash
streamlit run app.py
```

The app opens in your browser at **http://localhost:8501**

---

## 🔌 Integrating Your Trained Models

After training in your Colab notebook, save your models:

```python
# At the end of Phase 6 in your notebook:
final_model.save('/content/models/final_model.h5')        # best overall model
resnet_model.save('/content/models/resnet_best.h5')       # ResNet50
effnet_model.save('/content/models/effnet_best.h5')       # EfficientNetB0
```

Then in the **sidebar** of the Streamlit app:
1. Select the model type (Custom CNN / ResNet50 / EfficientNetB0)
2. Click **Browse** and upload the corresponding `.h5` file
3. The app will load the model and use it for all predictions

---

## 🖥️ App Features

### 🔍 Single Image Analysis
- Upload any road image (JPG/PNG)
- Real-time damage type classification (D00/D10/D20/D40)
- Confidence scores for all 4 classes
- Automatic bounding box estimation via edge detection
- Repair priority assignment (Very High / High / Medium / Low)
- Downloadable JSON + CSV reports

### 📦 Batch Analysis
- Upload up to 20 images at once
- Auto-sorted results table by priority urgency
- Distribution charts (damage types + priority levels)
- Thumbnail grid with annotations
- Batch CSV export

### 📊 Project Overview
- Full pipeline description (7 phases)
- Dataset details (RDD2020)
- Priority threshold reference table
- Preprocessing steps summary

### 📖 How It Works
- Step-by-step pipeline explanation
- Model architecture details
- Priority assignment logic

---

## ⚙️ Configuration (Sidebar)

| Setting | Options |
|---|---|
| Model | Demo / Custom CNN / ResNet50 / EfficientNetB0 |
| Priority Method | Rule-Based (thresholds) / Cluster-Based (KMeans) |
| Show BBox | Toggle bounding box overlay |
| Show CLAHE view | Toggle enhanced image display |
| Confidence threshold | Flag low-confidence predictions for review |

---

## 📐 Priority Rules (Rule-Based)

| Priority | Condition | Action |
|---|---|---|
| 🔴 Very High | > 10% of image area | Immediate repair |
| 🟠 High | 5–10% | Repair within 1 week |
| 🟡 Medium | 1–5% | Schedule within 1 month |
| 🟢 Low | < 1% | Routine maintenance |

---

## 🗂️ Project Structure

```
├── app.py               ← Main Streamlit application
├── requirements.txt     ← Python dependencies
└── README.md            ← This file
```

---

## 📚 References

[1] D. Arya et al., "RDD2020: An annotated image dataset for automatic road damage
detection using deep learning," Data in Brief, vol. 36, p. 107133, 2021.

[2] T. Zhang et al., "Transformer–CNN Hybrid Framework for Pavement Pothole
Segmentation," Sensors, vol. 23, no. 21, 2023.
