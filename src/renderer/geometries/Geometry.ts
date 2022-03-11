import { Vector3 } from '../math/Vector3';

export class Geometry {

  #vertices: Vector3[] = []
  #normals: Vector3[] = []
  #triangles: number[][] = []

  constructor(vertices: Vector3[], triangles: number[][]) {
    this.#vertices = vertices
    this.#triangles = triangles
    this.updateNormals()
  }

  getVertices() {
    return this.#vertices
  }

  getFlatVertices() {
    const array: number[] = []
    this.#vertices.forEach((v) => {
      array.push(v.x)
      array.push(v.y)
      array.push(v.z)
    })
    return array
  }

  getTriangles() {
    return this.#triangles
  }

  getIndices() {
    return this.#triangles.flat()
  }

  getNormals() {
    return this.#normals
  }

  getFlatNormals() {
    const array: number[] = []
    this.#normals.forEach((v) => {
      array.push(v.x)
      array.push(v.y)
      array.push(v.z)
    })
    return array
  }

  updateNormals() {
    const tmpNormals: Vector3[] = []
    this.#triangles.forEach(t => {
      const i0 = t[0]
      const i1 = t[1]
      const i2 = t[2]
      const v0 = this.#vertices[i0]
      const v1 = this.#vertices[i1]
      const v2 = this.#vertices[i2]

      const vv01 = v1.subtract(v0)
      const vv02 = v2.subtract(v0)
      const cross = vv02.cross(vv01)
      ;[i0, i1, i2].forEach(i => {
        tmpNormals[i] = tmpNormals[i] || new Vector3(0, 0, 0)
        tmpNormals[i] = tmpNormals[i].add(cross)
      })
    })
    this.#normals = tmpNormals.map(n => {
      return n.normalize()
    })
  }
}