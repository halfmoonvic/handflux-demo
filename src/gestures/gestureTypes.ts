import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type GestureKind = 'none' | 'open-palm' | 'fist' | 'index-point' | 'single-finger';

export type TrackedFingerKind = 'fist' | 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

export type Point2D = {
  x: number;
  y: number;
};

export type TrackedFinger = {
  kind: TrackedFingerKind;
  tip: Point2D;
  speed: number;
};

export type HandSnapshot = {
  detected: boolean;
  gesture: GestureKind;
  confidence: number;
  palmCenter: Point2D;
  indexTip: Point2D;
  trackedPoints: TrackedFinger[];
  openness: number;
  speed: number;
  landmarks: NormalizedLandmark[];
  updatedAt: number;
};

export const emptyHandSnapshot: HandSnapshot = {
  detected: false,
  gesture: 'none',
  confidence: 0,
  palmCenter: { x: 0.5, y: 0.5 },
  indexTip: { x: 0.5, y: 0.5 },
  trackedPoints: [],
  openness: 0,
  speed: 0,
  landmarks: [],
  updatedAt: 0,
};
