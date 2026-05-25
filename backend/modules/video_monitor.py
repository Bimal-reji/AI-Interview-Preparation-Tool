import cv2
import mediapipe as mp
from ultralytics import YOLO

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh()

phone_model = YOLO("yolov8n.pt")


def analyze_frame(frame):

    results = {
        "face_detected": False,
        "face_straight": False,
        "phone_detected": False,
        "attention": "Low",
        "confidence": "Low"
    }

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_results = face_mesh.process(rgb)

    # ---------------- FACE + HEAD DIRECTION ----------------

    if face_results.multi_face_landmarks:

        results["face_detected"] = True

        landmarks = face_results.multi_face_landmarks[0]

        nose = landmarks.landmark[1]
        left_eye = landmarks.landmark[33]
        right_eye = landmarks.landmark[263]

        center_x = (left_eye.x + right_eye.x) / 2

        # detect head straight
        if abs(nose.x - center_x) < 0.04:
            results["face_straight"] = True

        # eye openness detection
        upper_eye = landmarks.landmark[159]
        lower_eye = landmarks.landmark[145]

        eye_distance = abs(upper_eye.y - lower_eye.y)

        if eye_distance > 0.015:
            results["attention"] = "Focused"
        else:
            results["attention"] = "Distracted"

    # ---------------- PHONE DETECTION ----------------

    detections = phone_model(frame, conf=0.4)

    for r in detections:
        for box in r.boxes:

            cls = int(box.cls[0])
            label = phone_model.names[cls]

            if label == "cell phone":
                results["phone_detected"] = True

    # ---------------- CONFIDENCE CALCULATION ----------------

    score = 100

    if not results["face_detected"]:
        score -= 40

    if not results["face_straight"]:
        score -= 25

    if results["phone_detected"]:
        score -= 35

    if results["attention"] == "Distracted":
        score -= 10

    if score >= 70:
        results["confidence"] = "High"

    elif score >= 40:
        results["confidence"] = "Medium"

    else:
        results["confidence"] = "Low"

    return results