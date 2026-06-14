import type { RefObject } from 'react';

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  hidden: boolean;
};

export function CameraPreview({ videoRef, hidden }: CameraPreviewProps) {
  return (
    <div className={`camera-preview ${hidden ? 'camera-preview--hidden' : ''}`}>
      <video ref={videoRef} aria-label="Camera preview" />
    </div>
  );
}
