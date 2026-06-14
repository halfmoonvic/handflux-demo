# HandFlux

HandFlux is a browser-based hand gesture visual prototype. It uses the camera to track one hand in real time, then maps gestures to particle trails, an energy orb, and shockwave effects.

HandFlux 是一个基于浏览器摄像头的手势视觉交互原型。它会实时识别单手，并把手势映射为粒子轨迹、能量球和冲击波效果。

## Features

- Fullscreen dark visual stage built with Three.js.
- Camera-based hand tracking powered by MediaPipe Hand Landmarker.
- Palm position controls a glowing energy orb.
- Index finger movement creates a particle trail.
- Open palm triggers expanding shockwaves.
- Fist pulls particles toward the energy orb.
- Debug HUD shows tracking status, gesture, palm position, and confidence.
- Camera preview can be shown or hidden.
- Three visual themes: Ion, Aqua, and Flare.

## Recognized Gestures

HandFlux currently supports three interactive gestures:

| Gesture | 中文 | Effect |
| --- | --- | --- |
| Index point | 食指指向 | Draws a particle trail from the index fingertip. |
| Open palm | 张开手掌 | Releases expanding shockwaves. |
| Fist | 握拳 | Attracts particles toward the energy orb. |

The internal `none` state means no clear gesture is currently recognized.

## Tech Stack

- Vite
- React
- TypeScript
- Three.js
- MediaPipe Tasks Vision
- ESLint

## Requirements

- Node.js 20 or newer is recommended.
- A desktop browser with camera access.
- Network access for MediaPipe WASM and model assets.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local Vite URL, then allow camera access when the browser asks.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Project Structure

```text
src/
  camera/       Camera stream and hand tracker setup
  components/   React UI components
  gestures/     Gesture data types and detection logic
  state/        Small mutable stores for hand data and visual mode
  styles/       App styling
  ui/           HUD helpers
  visuals/      Three.js scene, particles, orb, and shockwaves
```

## Notes

The first version focuses on a single-hand MVP. The project plan in `docs/project-plan.md` includes possible future work such as dual-hand interaction, more visual modes, and richer shader or canvas effects.
