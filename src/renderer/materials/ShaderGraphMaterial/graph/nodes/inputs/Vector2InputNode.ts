import { Vector2 } from "../../../../../math/Vector2";
import { createValidNumberLiteral } from "../../utils";
import { Node } from "../Node";
import { SocketType } from "../Socket";


export class Vector2InputNode extends Node {

  #value: Vector2 = new Vector2(0, 0)

  constructor(id: string) {
    super(id, "Vector2Input")
    this.addOutSocket("Vector2InputNodeOut", SocketType.Vector2)
  }

  getValue(): Vector2 {
    return this.#value
  }

  setValue(value: Vector2) {
    this.#value = value
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const outputs = this.getOutSockets()
    const x = this.#value.x
    const y = this.#value.y
    const parts = [x, y].map(createValidNumberLiteral).join(", ")
    return `
    vec2 ${outputs[0].getVeriableName()} = vec2(${parts});
    `
  }
}