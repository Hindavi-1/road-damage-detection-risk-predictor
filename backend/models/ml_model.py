import tensorflow as tf
import numpy as np
import cv2
import os

# ==============================
# 📌 CONFIGURATION
# ==============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FINETUNED_MODEL_PATH = os.path.join(BASE_DIR, "transfer_VGG16_finetuned.h5")
FROZEN_MODEL_PATH = os.path.join(BASE_DIR, "transfer_VGG16_frozen.h5")

IMG_SIZE = 128

# Class labels (IMPORTANT: match your training order)
CLASS_NAMES = ["D00", "D10", "D20", "D40"]

CLASS_MAP = {
    "D00": "Longitudinal Cracks",
    "D10": "Transverse Cracks",
    "D20": "Alligator Cracks",
    "D40": "Potholes"
}

# ==============================
# 📌 LOAD MODELS (ONLY ONCE)
# ==============================

try:
    print("🔄 Loading Fine-tuned VGG16 model...")
    finetuned_model = tf.keras.models.load_model(FINETUNED_MODEL_PATH)

    print("🔄 Loading Frozen VGG16 model...")
    frozen_model = tf.keras.models.load_model(FROZEN_MODEL_PATH)

    print("✅ Models loaded successfully!")

except Exception as e:
    print("❌ Error loading models:", str(e))
    finetuned_model = None
    frozen_model = None


# ==============================
# 📌 IMAGE PREPROCESSING
# ==============================

def preprocess_image(file):
    try:
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Invalid image file")

        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img / 255.0  # normalization
        img = np.expand_dims(img, axis=0)

        return img

    except Exception as e:
        raise Exception(f"Image preprocessing failed: {str(e)}")


# ==============================
# 📌 SEVERITY ESTIMATION
# ==============================

def estimate_severity(confidence):
    if confidence > 0.85:
        return "High"
    elif confidence > 0.6:
        return "Medium"
    else:
        return "Low"


# ==============================
# 📌 PRIORITY SCORE (FOR RISK)
# ==============================

def calculate_priority(damage_type, confidence):
    base_score = {
        "D00": 0,
        "D10": 5,
        "D20": 6,
        "D40": 9
    }

    score = base_score.get(damage_type, 0)

    # Adjust score using confidence
    return round(score * confidence, 2)


# ==============================
# 📌 MAIN PREDICTION FUNCTION
# ==============================

def predict_damage(file, use_finetuned=True):
    try:
        if finetuned_model is None and frozen_model is None:
            raise Exception("Models are not loaded")

        # Preprocess image
        img = preprocess_image(file)

        # Select model
        model = finetuned_model if use_finetuned else frozen_model

        # Prediction
        preds = model.predict(img)

        class_index = int(np.argmax(preds))
        confidence = float(np.max(preds))

        label = CLASS_NAMES[class_index]
        damage_name = CLASS_MAP[label]

        # Extra insights
        severity = estimate_severity(confidence)
        priority_score = calculate_priority(label, confidence)

        return {
            "damage_code": label,
            "damage_type": damage_name,
            "confidence": round(confidence, 3),
            "severity": severity,
            "priority_score": priority_score
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "error": str(e)
        }