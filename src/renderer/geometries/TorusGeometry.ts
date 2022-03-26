import { Geometry } from './Geometry';
import { Vector3 } from '../math/Vector3';
import { Vector2 } from '../math/Vector2';

type Vert = {
  index: number;
  position: Vector3;
};

function createTriangles(ring0: Vert[], ring1: Vert[]) {
  const verts = ring0.length;
  const triangles: number[][] = [];
  for (let i = 0; i < ring0.length; i++) {
    triangles.push([
      ring0[i].index,
      ring0[(i + 1) % verts].index,
      ring1[(i + 1) % verts].index,
    ]);
    triangles.push([
      ring0[i].index,
      ring1[(i + 1) % verts].index,
      ring1[i].index,
    ]);
  }
  return triangles;
}

export class TorusGeometry extends Geometry {
  constructor(
    tubeRadius: number,
    radialSegments: number,
    tubularSegments: number
  ) {
    const radius = 1;
    const rings: Vert[][] = [];
    const uvs: Vector2[] = [];
    let index = 0;
    for (let i = 0; i < radialSegments; ++i) {
      const ring: Vert[] = [];
      for (let j = 0; j < tubularSegments; ++j) {
        const u = (j / tubularSegments) * Math.PI * 2;
        const v = (i / radialSegments) * Math.PI * 2;
        const x = (radius + tubeRadius * Math.cos(v)) * Math.cos(u);
        const y = (radius + tubeRadius * Math.cos(v)) * Math.sin(u);
        const z = tubeRadius * Math.sin(v);
        ring.push({ index, position: new Vector3(x, y, z) });
        uvs.push(
          new Vector2(j / (tubularSegments - 1), i / (radialSegments - 1))
        );
        index += 1;
      }
      rings.push(ring);
    }
    const vertices = rings.flat().map((v) => v.position);
    const trianglesArray: number[][][] = [];
    for (let k = 0; k < rings.length; ++k) {
      trianglesArray.push(
        createTriangles(rings[k], rings[(k + 1) % rings.length])
      );
    }
    const triangles = trianglesArray.flat();
    super(vertices, triangles, uvs);
  }
}
