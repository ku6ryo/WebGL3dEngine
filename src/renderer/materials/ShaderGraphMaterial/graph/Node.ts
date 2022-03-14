import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { Vector4 } from "../../../math/Vector4";
import { validVariableName } from "./utils";
import { Socket, SocketType } from "./Socket";

export enum UniformType {
  Vector2 = "vec2",
  Vector3 = "vec3",
  Vector4 = "vec4",
  Sampler2D = "sampler2D",
}

export type Uniform = {
  type: UniformType;
  name?: string;
  valueSampler2D?: HTMLImageElement;
  valueVector2?: Vector2;
  valueVector3?: Vector3;
  valueVector4?: Vector4;
}

export enum AttributeType {
  UV = "uv",
}

export abstract class Node {
  // Unique id for this node
  #id: string;
  // ID to distinguish node types.
  #typeId: string;

  // Input parameter sockets
  #inSockets: Socket[] = [];
  // Output parameter sockets
  #outSockets: Socket[] = [];

  #uniforms: Uniform[] = []

  /**
   * Attribute types to use. UV, Vertex color etc.
   */
  #attributes: AttributeType[] = []

  constructor(id: string, typeId: string, uniforms: UniformType[] = [], attributes: AttributeType[] = []) {
    if (!validVariableName(id)) {
      throw new Error(`Invalid node id: ${id}`)
    }
    if (!validVariableName(typeId)) {
      throw new Error(`Invalid node typeId: ${typeId}`)
    }
    this.#id = id;
    this.#typeId = typeId;

    this.#uniforms = uniforms.map(t => {
      return {
        type: t,
      }
    })
    this.#attributes = attributes
  }

  getId() {
    return this.#id
  }

  getTypeId() {
    return this.#typeId
  }
  
  protected createSocket(name: string, type: SocketType) {
    if (!validVariableName(name)) {
      throw new Error(`Invalid socket name: ${name}`)
    }
    return new Socket(this.#id + "_" + name, type)
  }

  protected addInSocket(name: string, type: SocketType) {
    this.#inSockets.push(this.createSocket(name, type))
  }

  getInSockets(): Socket[] {
    return [...this.#inSockets]
  }

  protected addOutSocket(name: string, type: SocketType) {
    this.#outSockets.push(this.createSocket(name, type))
  }

  getOutSockets(): Socket[] {
    return [...this.#outSockets]
  }

  setUnifromName(index: number, name: string) {
    const u = this.#uniforms[index]
    if (!u) {
      throw new Error(`Uniform index ${index} does not exist`)
    }
    u.name = name
  }

  getUniforms(): Uniform[] {
    return [...this.#uniforms]
  }

  getUnifromName(index: number) {
    const u = this.#uniforms[index]
    if (!u) {
      throw new Error(`Uniform index ${index} does not exist`)
    }
    if (!u.name) {
      throw new Error(`Uniform index ${index} does not have a name`)
    }
    return u.name
  }

  setUniformValue(index: number, value: Vector2): void;
  setUniformValue(index: number, value: Vector3): void;
  setUniformValue(index: number, value: Vector4): void;
  setUniformValue(index: number, value: HTMLImageElement): void;
  setUniformValue(index: number, value: HTMLImageElement | Vector2 | Vector3 | Vector4): void {
    const u = this.#uniforms[index]
    if (!u) {
      throw new Error(`Uniform index ${index} does not exist`)
    }
    if (value instanceof HTMLImageElement) {
      u.valueSampler2D = value
    } else if (value instanceof Vector2) {
      u.valueVector2 = value
    } else if (value instanceof Vector3) {
      u.valueVector3 = value
    } else if (value instanceof Vector4) {
      u.valueVector4 = value
    } else {
      throw new Error("value is not supported type")
    }
  }

  getAttributes() {
    return [...this.#attributes]
  }

  abstract generateCommonCode(): string;

  abstract generateCode(): string
}