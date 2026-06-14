import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import {
  emptyHandSnapshot,
  type GestureKind,
  type HandSnapshot,
  type Point2D,
  type TrackedFinger,
  type TrackedFingerKind,
} from './gestureTypes';

const FINGER_LANDMARKS: Array<{
  kind: Exclude<TrackedFingerKind, 'fist'>;
  tip: number;
  joint: number;
}> = [
  { kind: 'thumb', tip: 4, joint: 2 },
  { kind: 'index', tip: 8, joint: 6 },
  { kind: 'middle', tip: 12, joint: 10 },
  { kind: 'ring', tip: 16, joint: 14 },
  { kind: 'pinky', tip: 20, joint: 18 },
];

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

function getPointSpeed(
  kind: TrackedFingerKind,
  tip: Point2D,
  previous: HandSnapshot,
  deltaTime: number,
) {
  const previousPoint = previous.trackedPoints.find((point) => point.kind === kind);

  if (!previous.detected || !previousPoint) {
    return 0;
  }

  return distance(tip, previousPoint.tip) / deltaTime;
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
  const extendedFingers = FINGER_LANDMARKS.filter(({ kind, tip: tipIndex, joint }) => {
    const tip = mirrorPoint(landmarks[tipIndex]);
    const jointPoint = mirrorPoint(landmarks[joint]);
    const tipPastJoint = distance(tip, wrist) > distance(jointPoint, wrist) * 1.08;

    if (kind !== 'thumb') {
      return tipPastJoint;
    }

    return tipPastJoint && Math.abs(tip.x - jointPoint.x) > palmSize * 0.55;
  }).map(({ kind, tip }) => ({
    kind,
    tip: mirrorPoint(landmarks[tip]),
  }));
  const openness = Math.min(1, extendedFingers.length / 5);

  let gesture: GestureKind = 'none';
  if (extendedFingers.length === 0) {
    gesture = 'fist';
  } else if (extendedFingers.length === 1) {
    gesture = extendedFingers[0].kind === 'index' ? 'index-point' : 'single-finger';
  } else if (extendedFingers.length >= 2) {
    gesture = 'open-palm';
  }

  const deltaTime = Math.max((now - previous.updatedAt) / 1000, 0.016);
  const trackedPoints: TrackedFinger[] =
    gesture === 'fist'
      ? [
          {
            kind: 'fist',
            tip: palmCenter,
            speed: getPointSpeed('fist', palmCenter, previous, deltaTime),
          },
        ]
      : extendedFingers.map(({ kind, tip }) => ({
          kind,
          tip,
          speed: getPointSpeed(kind, tip, previous, deltaTime),
        }));
  const indexSpeed = previous.detected ? distance(indexTip, previous.indexTip) / deltaTime : 0;
  const speed = Math.max(indexSpeed, ...trackedPoints.map((point) => point.speed));
  const handedness = result.handedness[0]?.[0];

  return {
    detected: true,
    gesture,
    confidence: handedness?.score ?? 0,
    palmCenter,
    indexTip,
    trackedPoints,
    openness,
    speed,
    landmarks: mirrored,
    updatedAt: now,
  };
}
