export enum SocketType {
  Float = "float",
  Vector2 = "vec2",
  Vector3 = "vec3",
  Vector4 = "vec4",
}

export class Socket {
  #id: string;
  #type: SocketType;

  constructor(id: string, type: SocketType) {
    this.#id = id;
    this.#type = type
  }

  getType(): SocketType {
    return this.#type
  }

  getVeriableName(): string {
    return `${this.#id}_${this.#type}`
  }
}