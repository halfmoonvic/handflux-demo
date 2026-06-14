import * as THREE from 'three';
import { handState } from '../state/handState';
import { visualModeStore } from '../state/visualModeStore';
import { EnergyOrb } from './energyOrb';
import { ParticleSystem } from './particles';
import { ShockwaveSystem } from './shockwave';

export type HandFluxScene = {
  dispose: () => void;
};

export function createHandFluxScene(container: HTMLElement): HandFluxScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x05070d, 1);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const point = new THREE.PointLight(0x78d9ff, 3, 10);
  point.position.set(0, 0, 2.5);
  scene.add(ambient, point);

  const orb = new EnergyOrb(scene);
  const particles = new ParticleSystem(scene);
  const shockwaves = new ShockwaveSystem(scene);
  let frameId = 0;
  let lastTime = performance.now();
  let lastGesture = handState.getSnapshot().gesture;

  const resize = () => {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  };

  const unsubscribeTheme = visualModeStore.subscribe((theme) => {
    orb.setTheme(theme);
    particles.setTheme(theme);
    shockwaves.setTheme(theme);
  });

  const animate = (time: number) => {
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    const hand = handState.getSnapshot();
    if (hand.detected) {
      orb.setTarget(hand.palmCenter);
      particles.emitFromPoint(hand.indexTip, hand.speed);

      if (hand.gesture === 'open-palm' && lastGesture !== 'open-palm') {
        shockwaves.burst(orb.getPosition());
      }

      if (hand.gesture === 'fist') {
        particles.attractTo(orb.getPosition(), delta);
      }
    }

    lastGesture = hand.gesture;
    orb.update(delta, hand.openness, hand.gesture === 'fist');
    particles.update(delta);
    shockwaves.update(delta);
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener('resize', resize);
  frameId = window.requestAnimationFrame(animate);

  return {
    dispose() {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frameId);
      unsubscribeTheme();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}
