import { mat4 } from "gl-matrix"
import { Vector3 } from "./math/Vector3"

export class Camera {

  #position: Vector3 = new Vector3(0, 0, 0)
  #target: Vector3 = new Vector3(0, 0, 0)
  #up: Vector3 = new Vector3(0, 1, 0)

  #fov = Math.PI / 4
  #aspect = 1
  #near = 0.1
  #far = 100

  #projectionMatrix: mat4
  #viewMatrix: mat4

  constructor() {
    this.#viewMatrix = mat4.identity(mat4.create())
    this.#projectionMatrix = mat4.identity(mat4.create())
  }

  setPosition(v: Vector3) {
    this.#position = v
    this.updateViewMatrix()
  }

  getPosition() {
    return this.#position
  }

  setTarget(v: Vector3) {
    this.#target = v
    this.updateViewMatrix()
  }

  getTarget() {
    return this.#target
  }

  setUp(v: Vector3) {
    this.#up = v
    this.updateViewMatrix()
  }

  getUp() {
    return this.#up
  }

  private updateViewMatrix(): void {
    const eye: [number, number, number] = [this.#position.x, this.#position.y, this.#position.z] 
    const center: [number, number, number] = [this.#target.x, this.#target.y, this.#target.z]
    const up: [number, number, number] = [this.#up.x, this.#up.y, this.#up.z]
    mat4.lookAt(this.#viewMatrix, eye, center, up)
  }

  getViewMatrix() {
    return this.#viewMatrix
  }

  setProjectionParams(fov: number, aspect: number, near: number, far: number): void {
    this.#fov = fov
    this.#aspect = aspect
    this.#near = near
    this.#far = far
    this.updateProjectionMatrix()
  }

  private updateProjectionMatrix() {
    mat4.perspective(this.#projectionMatrix, this.#fov, this.#aspect, this.#near, this.#far)
  }

  getProjectionMatrix(): mat4 {
    return this.#projectionMatrix
  }
}