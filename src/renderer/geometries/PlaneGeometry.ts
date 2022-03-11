import { Geometry } from "./Geometry";
import { Vector3 } from "../math/Vector3";


export class PlaneGeometry extends Geometry {
  constructor() {
    const vertices = [
      new Vector3(-0.5, -0.5, 0.0),
      new Vector3(0.5, -0.5, 0.0),
      new Vector3(0.5, 0.5, 0.0),
      new Vector3(-0.5, 0.5, 0.0)
    ]
    const indices = [[0, 1, 2], [0, 2, 3]]
    super(vertices, indices)
  }
}
