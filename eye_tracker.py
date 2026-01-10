import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Constants for iris landmarks (MediaPipe specific)
LEFT_IRIS = [474, 475, 476, 477]
RIGHT_IRIS = [469, 470, 471, 472]

# Open Camera
cap = cv2.VideoCapture(0)

print("Starting Eye Focus Tracker...")
print("Press 'q' to quit.")

while cap.isOpened():
    success, image = cap.read()
    if not success:
        break

    # Flip the image horizontally for a later selfie-view display
    image = cv2.flip(image, 1)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_image)

    status_message = "Looking at Screen"
    message_color = (0, 255, 0) # Green

    if results.multi_face_landmarks:
        mesh_points = np.array([np.multiply([p.x, p.y], [image.shape[1], image.shape[0]]).astype(int) 
                              for p in results.multi_face_landmarks[0].landmark])
        
        # Get iris centers
        (l_cx, l_cy), l_radius = cv2.minEnclosingCircle(mesh_points[LEFT_IRIS])
        (r_cx, r_cy), r_radius = cv2.minEnclosingCircle(mesh_points[RIGHT_IRIS])
        
        center_left = np.array([l_cx, l_cy], dtype=np.int32)
        center_right = np.array([r_cx, r_cy], dtype=np.int32)

        # Basic logic: If iris is too far from the center of the eye area, user is looking away
        # For a production app, this would involve head pose estimation + iris tracking
        
        # Simplified gaze detection: Check if iris centers are relatively stable
        # In this script, we'll draw the landmarks for visualization
        cv2.circle(image, center_left, int(l_radius), (255, 0, 255), 1, cv2.LINE_AA)
        cv2.circle(image, center_right, int(r_radius), (255, 0, 255), 1, cv2.LINE_AA)

        # Example thresholding for "looking away" (Simplified)
        # We calculate the eye aspect ratio or simple displacement
        # Here we just show the message; real calibration would be needed
        
        # Draw status on screen
        cv2.putText(image, status_message, (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, message_color, 2)
    else:
        cv2.putText(image, "No Face Detected!", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    cv2.imshow('Eye Focus Tracker', image)

    if cv2.waitKey(5) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
