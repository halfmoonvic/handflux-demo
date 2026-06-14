import * as THREE from 'three';
import type { VisualTheme } from '../state/visualModeStore';

const THEME_COLORS: Record<VisualTheme, string> = {
  ion: '#78d9ff',
  aqua: '#32f5c8',
  flare: '#ff4fd8',
};

type Wave = {
  mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  life: number;
};

export class ShockwaveSystem {
  private readonly waves: Wave[] = [];
  private theme: VisualTheme = 'ion';

  constructor(private readonly scene: THREE.Scene) {}

  setTheme(theme: VisualTheme) {
    this.theme = theme;
  }

  burst(position: THREE.Vector3) {
    const material = new THREE.MeshBasicMaterial({
      color: THEME_COLORS[this.theme],
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.2, 96), material);
    mesh.position.copy(position);
    this.scene.add(mesh);
    this.waves.push({ mesh, life: 0.8 });
  }

  update(delta: number) {
    for (let index = this.waves.length - 1; index >= 0; index -= 1) {
      const wave = this.waves[index];
      wave.life -= delta;

      if (wave.life <= 0) {
        this.scene.remove(wave.mesh);
        wave.mesh.geometry.dispose();
        wave.mesh.material.dispose();
        this.waves.splice(index, 1);
        continue;
      }

      const progress = 1 - wave.life / 0.8;
      wave.mesh.scale.setScalar(1 + progress * 9);
      wave.mesh.material.opacity = (1 - progress) * 0.68;
    }
  }
}
