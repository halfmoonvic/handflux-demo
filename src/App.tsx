import { useEffect, useRef, useState } from 'react';
import { startCamera } from './camera/camera';
import { createHandTracker, type HandTracker } from './camera/handTracker';
import { CameraPreview } from './components/CameraPreview';
import { ControlPanel } from './components/ControlPanel';
import { DebugHud } from './components/DebugHud';
import { emptyHandSnapshot, type HandSnapshot } from './gestures/gestureTypes';
import { handState } from './state/handState';
import { visualModeStore, type VisualTheme } from './state/visualModeStore';
import { trackingCopy } from './ui/hud';
import type { HandFluxScene } from './visuals/scene';

export function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [snapshot, setSnapshot] = useState<HandSnapshot>(emptyHandSnapshot);
  const [status, setStatus] = useState(trackingCopy.initializing);
  const [cameraVisible, setCameraVisible] = useState(true);
  const [theme, setTheme] = useState<VisualTheme>(visualModeStore.getTheme());

  useEffect(() => {
    const unsubscribe = handState.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
      setStatus(nextSnapshot.detected ? trackingCopy.tracking : trackingCopy.waiting);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const container = sceneRef.current;

    if (!container) {
      return undefined;
    }

    const containerElement = container;
    let handFluxScene: HandFluxScene | undefined;
    let cancelled = false;

    async function bootScene() {
      const { createHandFluxScene } = await import('./visuals/scene');

      if (cancelled) {
        return;
      }

      handFluxScene = createHandFluxScene(containerElement);
    }

    void bootScene();

    return () => {
      cancelled = true;
      handFluxScene?.dispose();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const videoElement = video;
    let cleanupCamera: (() => void) | undefined;
    let tracker: HandTracker | undefined;
    let cancelled = false;

    async function boot() {
      try {
        cleanupCamera = await startCamera(videoElement);

        if (cancelled) {
          cleanupCamera();
          return;
        }

        setStatus(trackingCopy.cameraReady);
        tracker = await createHandTracker(videoElement);

        if (cancelled) {
          tracker.dispose();
          return;
        }

        tracker.start();
      } catch {
        setStatus(trackingCopy.blocked);
      }
    }

    void boot();

    return () => {
      cancelled = true;
      tracker?.dispose();
      cleanupCamera?.();
    };
  }, []);

  function handleThemeChange(nextTheme: VisualTheme) {
    setTheme(nextTheme);
    visualModeStore.setTheme(nextTheme);
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <div ref={sceneRef} className="visual-stage" aria-hidden="true" />
      <div className="brand-mark">
        <span>HandFlux</span>
      </div>
      <DebugHud snapshot={snapshot} status={status} />
      <ControlPanel
        cameraVisible={cameraVisible}
        theme={theme}
        onToggleCamera={() => setCameraVisible((visible) => !visible)}
        onThemeChange={handleThemeChange}
      />
      <CameraPreview videoRef={videoRef} hidden={!cameraVisible} />
    </main>
  );
}
