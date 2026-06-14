import { emptyHandSnapshot, type HandSnapshot } from '../gestures/gestureTypes';

type Listener = (snapshot: HandSnapshot) => void;

let snapshot = emptyHandSnapshot;
const listeners = new Set<Listener>();

export const handState = {
  getSnapshot() {
    return snapshot;
  },
  setSnapshot(nextSnapshot: HandSnapshot) {
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener(snapshot));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
