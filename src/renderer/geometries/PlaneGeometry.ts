import { Geometry } from "./Geometry";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";


export class PlaneGeometry extends Geometry {
  constructor() {
    const vertices = [
      new Vector3(-0.5, -0.5, 0.0),
      new Vector3(0.5, -0.5, 0.0),
      new Vector3(0.5, 0.5, 0.0),
      new Vector3(-0.5, 0.5, 0.0)
    ]
    const indices = [[0, 2, 1], [0, 3, 2]]
    const uvs = [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1), new Vector2(0, 1)]
    super(vertices, indices, uvs)
  }
}
