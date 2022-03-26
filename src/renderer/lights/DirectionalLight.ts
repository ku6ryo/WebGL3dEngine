import { Vector3 } from '../math/Vector3';

export class DirectionalLight {
  constructor(private direction: Vector3, private intensity: number) {}

  setDirection(direction: Vector3) {
    this.direction = direction;
  }

  getDirection() {
    return this.direction;
  }

  setIntensity(intensity: number) {
    this.intensity = intensity;
  }

  getIntensity() {
    return this.intensity;
  }
}
