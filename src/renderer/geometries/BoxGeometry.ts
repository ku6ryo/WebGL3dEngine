import { Geometry } from './Geometry';
import { Vector3 } from '../math/Vector3';

export class BoxGeometry extends Geometry {
  constructor() {
    super(
      [
        new Vector3(-0.5, -0.5, -0.5),
        new Vector3(0.5, -0.5, -0.5),
        new Vector3(0.5, 0.5, -0.5),
        new Vector3(-0.5, 0.5, -0.5),
        new Vector3(-0.5, -0.5, 0.5),
        new Vector3(0.5, -0.5, 0.5),
        new Vector3(0.5, 0.5, 0.5),
        new Vector3(-0.5, 0.5, 0.5),
      ],
      [
        [0, 2, 1],
        [0, 3, 2],
        [4, 5, 6],
        [4, 6, 7],
        [0, 4, 7],
        [0, 7, 3],
        [1, 6, 5],
        [1, 2, 6],
        [0, 1, 5],
        [0, 5, 4],
        [3, 6, 2],
        [3, 7, 6],
      ]
    );
  }
}
