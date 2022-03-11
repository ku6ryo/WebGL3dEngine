import { Geometry } from "./geometries/Geometry"
import { Material } from "./materials/Material"
import { StandardMaterial } from "./materials/StandardMaterial/StandardMaterial"
import { Vector3 } from "./math/Vector3"

export class Thing {

  #geometry: Geometry
  #material: Material = new StandardMaterial()

  #position: Vector3 = new Vector3(0, 0, 0)
  #scale: Vector3 = new Vector3(1, 1, 1)
  #rotation: Vector3 = new Vector3(0, 0, 0)

  constructor(geometry: Geometry) {
    this.#geometry = geometry
  }

  getGeometry() {
    return this.#geometry
  }

  setGeometry(g: Geometry) {
    this.#geometry = g
  }

  getMaterial() {
    return this.#material
  }

  setMaterial(m: Material) {
    this.#material = m
  }

  setRotation(rotation: Vector3) {
    this.#rotation = rotation
  }

  getRotation() {
    return this.#rotation
  }

  getScale() {
    return this.#scale
  }

  setScale(scale: Vector3) {
    this.#scale = scale
  }

  getPosition() {
    return this.#position
  }

  setPosition(position: Vector3) {
    this.#position = position
  }
}