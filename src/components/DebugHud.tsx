import type { HandSnapshot } from '../gestures/gestureTypes';

type DebugHudProps = {
  snapshot: HandSnapshot;
  status: string;
};

export function DebugHud({ snapshot, status }: DebugHudProps) {
  return (
    <section className="debug-hud" aria-label="Tracking status">
      <div>
        <span>Status</span>
        <strong>{status}</strong>
      </div>
      <div>
        <span>Gesture</span>
        <strong>{snapshot.detected ? snapshot.gesture : 'none'}</strong>
      </div>
      <div>
        <span>Active</span>
        <strong>{snapshot.detected ? snapshot.trackedPoints.length : '--'}</strong>
      </div>
      <div>
        <span>Palm</span>
        <strong>
          {snapshot.detected
            ? `${snapshot.palmCenter.x.toFixed(2)}, ${snapshot.palmCenter.y.toFixed(2)}`
            : '--'}
        </strong>
      </div>
      <div>
        <span>Confidence</span>
        <strong>{snapshot.detected ? `${Math.round(snapshot.confidence * 100)}%` : '--'}</strong>
      </div>
    </section>
  );
}
