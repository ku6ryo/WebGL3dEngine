import { Geometry } from './Geometry';
import { Vector3 } from '../math/Vector3';

export class ConeGeometry extends Geometry {
  constructor(points: number) {
    if (points < 3) {
      throw new Error('ConeGeometry: points must be greater than 2');
    }
    const vertices: Vector3[] = [];
    const triangles: number[][] = [];
    const top = new Vector3(0, 1, 0);
    const center = new Vector3(0, 0, 0);
    vertices.push(top);
    vertices.push(center);
    for (let i = 2; i <= points + 2; ++i) {
      vertices.push(
        new Vector3(
          Math.sin((i * 2 * Math.PI) / points) * 0.5,
          0,
          Math.cos((i * 2 * Math.PI) / points) * 0.5
        )
      );
      if (i < points + 2) {
        triangles.push([0, i, i + 1]);
        triangles.push([1, i + 1, i]);
      }
    }
    triangles.push([0, points + 1, 2]);
    triangles.push([1, 2, points + 1]);
    super(vertices, triangles);
  }
}
