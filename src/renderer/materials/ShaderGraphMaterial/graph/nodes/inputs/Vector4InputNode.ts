import { Vector4 } from "../../../../../math/Vector4";
import { createValidNumberLiteral } from "../../utils";
import { Node } from "../../Node";
import { SocketType } from "../../Socket";


export class Vector4InputNode extends Node {

  #value: Vector4 = new Vector4(0, 0, 0, 0)

  constructor(id: string) {
    super(id, "Vector4Input")
    this.addOutSocket("vector4InputNodeOut", SocketType.Vector4)
  }

  getValue(): Vector4 {
    return this.#value
  }

  setValue(value: Vector4) {
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
    const w = this.#value.w
    const parts = [x, y, z, w].map(createValidNumberLiteral).join(", ")
    return `
    vec4 ${outputs[0].getVeriableName()} = vec4(${parts});
    `
  }
}