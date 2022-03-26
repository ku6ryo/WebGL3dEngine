export class Vector4 {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public w: number
  ) {}

  lengthSquared(): number {
    return (
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  normalize(): Vector4 {
    const l = this.length();
    return new Vector4(this.x / l, this.y / l, this.z / l, this.w / l);
  }

  add(v: Vector4): Vector4 {
    return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
  }

  subtract(v: Vector4): Vector4 {
    return this.add(v.invert());
  }

  dot(v: Vector4): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  invert(): Vector4 {
    return new Vector4(-this.x, -this.y, -this.z, -this.w);
  }
}
