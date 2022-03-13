export class Vector2 {
  constructor(public x: number, public y: number) {}

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  length(): number {
    return Math.sqrt(this.lengthSquared())
  }

  normalize(): Vector2 {
    const l = this.length()
    return new Vector2(this.x / l, this.y / l)
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y)
  }

  subtract(v: Vector2): Vector2 {
    return this.add(v.invert())
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y
  }

  invert(): Vector2 {
    return new Vector2(-this.x, -this.y)
  }
}