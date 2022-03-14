import { Vector3 } from "../../../../../math/Vector3";
import { createValidNumberLiteral } from "../../utils";
import { Node } from "../../Node";
import { SocketType } from "../../Socket";


export class Vector3InputNode extends Node {

  #value: Vector3 = new Vector3(0, 0, 0)

  constructor(id: string) {
    super(id, "Vector3Input")
    this.addOutSocket("Vector3InputNodeOut", SocketType.Vector3)
  }

  getValue(): Vector3 {
    return this.#value
  }

  setValue(value: Vector3) {
    this.#value = value
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const outputs = this.getOutSockets()
    const x = this.#value.x
    const y = this.#value.y
    const z = this.#value.z
    const parts = [x, y, z].map(createValidNumberLiteral).join(", ")
    return `
    vec3 ${outputs[0].getVeriableName()} = vec3(${parts});
    `
  }
}