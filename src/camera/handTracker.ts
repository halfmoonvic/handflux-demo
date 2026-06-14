import { detectGesture } from '../gestures/gestureDetector';
import { handState } from '../state/handState';

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export type HandTracker = {
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

export async function createHandTracker(video: HTMLVideoElement): Promise<HandTracker> {
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
  const filesetResolver = await FilesetResolver.forVisionTasks(WASM_ROOT);
  const landmarker = await HandLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate: 'GPU',
    },
    numHands: 1,
    minHandDetectionConfidence: 0.45,
    minHandPresenceConfidence: 0.45,
    minTrackingConfidence: 0.45,
    runningMode: 'VIDEO',
  });

  let active = false;
  let frameId = 0;

  const tick = () => {
    if (!active) {
      return;
    }

    const now = performance.now();
    const result = landmarker.detectForVideo(video, now);
    handState.setSnapshot(detectGesture(result, handState.getSnapshot(), now));
    frameId = window.requestAnimationFrame(tick);
  };

  return {
    start() {
      if (active) {
        return;
      }
      active = true;
      tick();
    },
    stop() {
      active = false;
      window.cancelAnimationFrame(frameId);
    },
    dispose() {
      active = false;
      window.cancelAnimationFrame(frameId);
      landmarker.close();
    },
  };
}
