import os
import io
import cv2
import numpy as np
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS

from models.ml_model import predict_damage

app = Flask(__name__)
CORS(app)

def estimate_damage_bbox(image_np: np.ndarray):
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 30, 100)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    dilated = cv2.dilate(edges, kernel, iterations=2)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    h, w = image_np.shape[:2]
    if not contours:
        return 0, 0, w, h, 1.0

    largest = max(contours, key=cv2.contourArea)
    x, y, bw, bh = cv2.boundingRect(largest)
    xmin, ymin = max(0, x), max(0, y)
    xmax, ymax = min(w, x + bw), min(h, y + bh)
    bbox_area = (xmax - xmin) * (ymax - ymin)
    img_area = h * w
    norm_area = float(bbox_area / img_area)
    return xmin, ymin, xmax, ymax, norm_area

def draw_bbox(image_np, xmin, ymin, xmax, ymax, label, confidence):
    vis = image_np.copy()
    color = (0, 0, 255) # Red in BGR
    cv2.rectangle(vis, (xmin, ymin), (xmax, ymax), color, 3)
    text = f"{label} {confidence*100:.1f}%"
    cv2.putText(vis, text, (xmin, max(0, ymin - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    return vis

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_bytes = file.read()
    
    # 1. Run inference
    # Pass a BytesIO object so ml_model can read it
    result = predict_damage(io.BytesIO(file_bytes), use_finetuned=True)
    if "error" in result:
        return jsonify(result), 500

    damage_code = result["damage_code"]
    damage_type_str = result["damage_type"]
    confidence = result["confidence"]
    severity = result["severity"]
    priority_score = result["priority_score"]

    # 2. Extract bounding box and area
    np_img = np.frombuffer(file_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    xmin, ymin, xmax, ymax, norm_area = estimate_damage_bbox(img_bgr)
    
    # 3. Create annotated image
    annotated_img = draw_bbox(img_bgr, xmin, ymin, xmax, ymax, damage_code, confidence)
    _, buffer = cv2.imencode('.jpg', annotated_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    image_url = f"data:image/jpeg;base64,{img_base64}"

    # Map output to frontend expected format
    # "D00": "Longitudinal Cracks", "D10": "Transverse Cracks", "D20": "Alligator Cracks", "D40": "Potholes"
    mapped_type = "other"
    if damage_code in ["D00", "D10", "D20"]:
        mapped_type = "crack"
    elif damage_code == "D40":
        mapped_type = "pothole"
        
    pothole_count = 1 if mapped_type == "pothole" else 0
    crack_count = 1 if mapped_type == "crack" else 0

    response = {
        "detections": [
            {
                "type": mapped_type,
                "confidence": confidence,
                "bbox": [
                    float(xmin)/img_bgr.shape[1], 
                    float(ymin)/img_bgr.shape[0], 
                    float(xmax-xmin)/img_bgr.shape[1], 
                    float(ymax-ymin)/img_bgr.shape[0]
                ]
            }
        ],
        "features": {
            "pothole_count": pothole_count,
            "crack_count": crack_count,
            "damage_area": norm_area
        },
        "prediction": {
            "priority": severity, # The frontend expects Very High | High | Medium | Low. ml_model estimate_severity gives High, Medium, Low.
            "risk_score": float(priority_score) / 10.0, # Normalizing based on max base score ~9
            "reason": f"{damage_type_str} detected with {confidence*100:.1f}% confidence. Area affected: {norm_area*100:.1f}%."
        },
        "image_url": image_url
    }

    # Adjust priority for 'Very High' if necessary (frontend expects it)
    if norm_area > 0.10 and response["prediction"]["priority"] == "High":
        response["prediction"]["priority"] = "Very High"

    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
