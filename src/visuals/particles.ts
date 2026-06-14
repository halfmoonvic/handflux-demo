import * as THREE from 'three';
import type { Point2D } from '../gestures/gestureTypes';
import type { VisualTheme } from '../state/visualModeStore';

const MAX_PARTICLES = 700;
const THEME_COLORS: Record<VisualTheme, THREE.ColorRepresentation[]> = {
  ion: ['#eefaff', '#78d9ff', '#7c7dff'],
  aqua: ['#f1fffb', '#32f5c8', '#0ba7a5'],
  flare: ['#fff0fb', '#ff4fd8', '#ffb15c'],
};

type Particle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
};

export class ParticleSystem {
  private readonly geometry = new THREE.BufferGeometry();
  private readonly material = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.94,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  private readonly points: THREE.Points;
  private readonly particles: Particle[] = [];
  private theme: VisualTheme = 'ion';
  private readonly lastPoints = new Map<string, Point2D>();

  constructor(scene: THREE.Scene) {
    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }

  setTheme(theme: VisualTheme) {
    this.theme = theme;
  }

  emitFromPoint(point: Point2D, speed: number, pointId = 'default', intensity = 1) {
    const world = toWorld(point);
    const count = Math.max(1, Math.min(12, Math.round((3 + speed * 6) * intensity)));
    const colors = THEME_COLORS[this.theme];
    const lastPoint = this.lastPoints.get(pointId);

    for (let index = 0; index < count; index += 1) {
      if (this.particles.length >= MAX_PARTICLES) {
        this.particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const force = 0.18 + Math.random() * (0.45 + speed * 0.05);
      const drift = lastPoint
        ? new THREE.Vector3(point.x - lastPoint.x, lastPoint.y - point.y, 0).multiplyScalar(6)
        : new THREE.Vector3();

      this.particles.push({
        position: world.clone(),
        velocity: new THREE.Vector3(Math.cos(angle) * force, Math.sin(angle) * force, 0).add(drift),
        life: 0.85,
        maxLife: 0.85,
        color: new THREE.Color(colors[index % colors.length]),
      });
    }

    this.lastPoints.set(pointId, point);
  }

  attractTo(target: THREE.Vector3, delta: number) {
    for (const particle of this.particles) {
      const pull = target.clone().sub(particle.position).multiplyScalar(delta * 2.8);
      particle.velocity.add(pull);
    }
  }

  update(delta: number) {
    const positions: number[] = [];
    const colors: number[] = [];

    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      particle.life -= delta;

      if (particle.life <= 0) {
        this.particles.splice(index, 1);
        continue;
      }

      particle.position.addScaledVector(particle.velocity, delta);
      particle.velocity.multiplyScalar(0.965);
      const alpha = Math.max(0, particle.life / particle.maxLife);
      positions.push(particle.position.x, particle.position.y, particle.position.z);
      colors.push(particle.color.r * alpha, particle.color.g * alpha, particle.color.b * alpha);
    }

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    this.geometry.computeBoundingSphere();
  }
}

function toWorld(point: Point2D) {
  return new THREE.Vector3((point.x - 0.5) * 5.6, (0.5 - point.y) * 3.15, 0);
}
