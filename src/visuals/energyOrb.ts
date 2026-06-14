import * as THREE from 'three';
import type { Point2D } from '../gestures/gestureTypes';
import type { VisualTheme } from '../state/visualModeStore';

const THEME_COLORS: Record<VisualTheme, string> = {
  ion: '#78d9ff',
  aqua: '#32f5c8',
  flare: '#ff4fd8',
};

export class EnergyOrb {
  private readonly group = new THREE.Group();
  private readonly core: THREE.Mesh;
  private readonly glow: THREE.Sprite;
  private target = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: THEME_COLORS.ion,
      transparent: true,
      opacity: 0.88,
    });
    this.core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 48, 48), coreMaterial);

    const glowTexture = new THREE.CanvasTexture(createGlowCanvas());
    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: THEME_COLORS.ion,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.glow.scale.setScalar(1.35);

    this.group.add(this.glow, this.core);
    scene.add(this.group);
  }

  setTheme(theme: VisualTheme) {
    const color = new THREE.Color(THEME_COLORS[theme]);
    const coreMaterial = this.core.material as THREE.MeshBasicMaterial;
    const glowMaterial = this.glow.material as THREE.SpriteMaterial;
    coreMaterial.color = color;
    glowMaterial.color = color;
  }

  setTarget(point: Point2D) {
    this.target.set((point.x - 0.5) * 5.6, (0.5 - point.y) * 3.15, 0);
  }

  update(delta: number, openness: number, compacting: boolean) {
    this.group.position.lerp(this.target, Math.min(1, delta * 8));
    const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.08;
    const scale = compacting ? 0.75 : 0.9 + openness * 0.65;
    this.group.scale.setScalar(scale * pulse);
  }

  getPosition() {
    return this.group.position.clone();
  }
}

function createGlowCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  if (!context) {
    return canvas;
  }

  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 60);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.35, 'rgba(120,217,255,0.38)');
  gradient.addColorStop(1, 'rgba(120,217,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  return canvas;
}
