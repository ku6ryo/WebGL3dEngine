export enum SocketType {
  Float = "float",
  Vector2 = "vec2",
  Vector3 = "vec3",
  Vector4 = "vec4",
  Sampler2D = "sampler2D",
}

export class Socket {
  #id: string;
  #type: SocketType;
  #overriddenVariableName: string | null = null;

  constructor(id: string, type: SocketType) {
    this.#id = id;
    this.#type = type
  }

  getId() {
    return this.#id
  }

  getType(): SocketType {
    return this.#type
  }

  getVeriableName(): string {
    return this.#overriddenVariableName || `${this.#id}_${this.#type}`
  }

  /**
   * Forces to use the given variable name instead of the default one. 
   * This can be used for uniform names.
   */
  overrideVariableName(name: string) {
    this.#overriddenVariableName = name
  }

  /**
   * Stops overriding the variable name.
   */
  clearVariableNameOverride() {
    this.#overriddenVariableName = null
  }
}