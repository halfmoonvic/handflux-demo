export async function startCamera(video: HTMLVideoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });

  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => resolve();
  });

  await video.play();

  return () => {
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };
}
