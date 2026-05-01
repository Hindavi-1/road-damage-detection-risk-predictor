# Priority-Based Road Damage Assessment

This project provides a comprehensive end-to-end system to detect, classify, and prioritize road damage from images. It uses a deep learning-based object detection model to identify road damage and extracts quantitative features to classify the damage into repair priority levels, assisting authorities in prioritizing road repair decisions.

## Objectives
- **Detect and Classify:** Identify road damage types (e.g., Longitudinal Cracks, Transverse Cracks, Alligator Cracks, Potholes) from road images using deep learning techniques.
- **Extract Features:** Calculate damage-related features such as damage type frequency and estimated damaged area.
- **Prioritize:** Classify road damage into four repair priority levels: Very High, High, Medium, and Low based on severity and area.
- **Assist Authorities:** Reduce manual inspection effort and improve decision-making efficiency.

## Architecture

The project adopts a two-stage modeling approach integrated into a modern web stack:

### Stage 1: Detection & Extraction
A deep learning image classification model (`VGG16`) identifies the damage type. OpenCV is used alongside the model to estimate the bounding box and calculate the normalized affected damage area.

### Stage 2: Risk Prediction
The extracted features (damage type and affected area) are used to assign a repair priority level based on risk thresholds.

### Tech Stack
- **Frontend (`dashboard/`)**: React, TypeScript, Vite, Tailwind CSS, Framer Motion. Provides a highly interactive and responsive UI for uploading images and viewing the prediction pipeline results.
- **Backend (`backend/`)**: Python, Flask, TensorFlow/Keras, OpenCV. Serves the REST API (`/analyze`) that runs inference on the uploaded images and returns annotated results.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.8+

### 1. Run the Backend API

Navigate to the backend directory, install dependencies, and start the Flask server.

```bash
cd backend
pip install -r requirements.txt
python main.py
```
The backend API will start at `http://localhost:5000`.

### 2. Run the Frontend Dashboard

Open a new terminal, navigate to the dashboard directory, install dependencies, and start the Vite development server.

```bash
cd dashboard
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000` (or the port specified by Vite).

## Usage
1. Open the dashboard in your browser.
2. Upload a road image (JPG/PNG).
3. The image is sent to the backend where the deep learning model detects the damage type.
4. The backend calculates the bounding box area and assigns a priority level.
5. The frontend displays the annotated image, the extracted features (Pothole/Crack count, Damaged Area), and the final repair priority.

## Dataset
The model was trained on the **RDD2020 (India)** dataset, featuring images captured from vehicle-mounted smartphones.
