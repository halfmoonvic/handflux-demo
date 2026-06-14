import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { emptyHandSnapshot, type GestureKind, type HandSnapshot, type Point2D } from './gestureTypes';

const TIP_INDICES = [8, 12, 16, 20];
const PIP_INDICES = [6, 10, 14, 18];

function mirrorPoint(point: Point2D): Point2D {
  return {
    x: 1 - point.x,
    y: point.y,
  };
}

function average(points: Point2D[]): Point2D {
  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

function distance(a: Point2D, b: Point2D) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function detectGesture(
  result: HandLandmarkerResult,
  previous: HandSnapshot,
  now = performance.now(),
): HandSnapshot {
  const landmarks = result.landmarks[0];

  if (!landmarks) {
    return {
      ...emptyHandSnapshot,
      updatedAt: now,
    };
  }

  const mirrored = landmarks.map((landmark) => ({
    ...landmark,
    x: 1 - landmark.x,
  }));

  const wrist = mirrorPoint(landmarks[0]);
  const palmCenter = average([0, 5, 9, 13, 17].map((index) => mirrorPoint(landmarks[index])));
  const indexTip = mirrorPoint(landmarks[8]);
  const palmSize = Math.max(distance(wrist, palmCenter), 0.001);
  const extendedFingers = TIP_INDICES.reduce((count, tipIndex, offset) => {
    const tip = mirrorPoint(landmarks[tipIndex]);
    const pip = mirrorPoint(landmarks[PIP_INDICES[offset]]);
    return count + (distance(tip, wrist) > distance(pip, wrist) * 1.08 ? 1 : 0);
  }, 0);
  const thumbOpen = Math.abs(landmarks[4].x - landmarks[2].x) > palmSize * 0.55;
  const openness = Math.min(1, (extendedFingers + (thumbOpen ? 1 : 0)) / 5);

  let gesture: GestureKind = 'none';
  if (openness >= 0.72) {
    gesture = 'open-palm';
  } else if (openness <= 0.26) {
    gesture = 'fist';
  } else if (extendedFingers === 1 && distance(indexTip, wrist) > palmSize * 1.8) {
    gesture = 'index-point';
  }

  const deltaTime = Math.max((now - previous.updatedAt) / 1000, 0.016);
  const speed = previous.detected ? distance(indexTip, previous.indexTip) / deltaTime : 0;
  const handedness = result.handedness[0]?.[0];

  return {
    detected: true,
    gesture,
    confidence: handedness?.score ?? 0,
    palmCenter,
    indexTip,
    openness,
    speed,
    landmarks: mirrored,
    updatedAt: now,
  };
}
