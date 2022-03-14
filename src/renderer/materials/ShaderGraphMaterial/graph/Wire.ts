import { Socket, SocketType } from "./nodes/Socket"

export class Wire {
  #inSocket: Socket
  #outSocket: Socket

  constructor(inSocket: Socket, outSocket: Socket) {
    this.#inSocket = inSocket
    this.#outSocket = outSocket
  }

  getInSocket(): Socket {
    return this.#inSocket
  }

  getOutSocket(): Socket {
    return this.#outSocket
  }

  generateCode(): string {
    const iType = this.#inSocket.getType()
    const iVar = this.#inSocket.getVeriableName()
    const oType = this.#outSocket.getType()
    const oVar = this.#outSocket.getVeriableName()

    if (iType === SocketType.Sampler2D) {
      if (oType !== SocketType.Sampler2D) {
        throw new Error("Sampler2D can only be connected to Sampler2D")
      } else {
        this.#outSocket.overrideVariableName(iVar)
        return ""
      }
    }

    if (iType === oType) {
      return `${oType} ${oVar} = ${iVar};`
    }
    // float
    if (iType === SocketType.Float && oType === SocketType.Vector2) {
      return `vec2 ${oVar} = vec2(${iVar});`
    }
    if (iType === SocketType.Float && oType === SocketType.Vector3) {
      return `vec3 ${oVar} = vec3(${iVar});`
    }
    if (iType === SocketType.Float && oType === SocketType.Vector4) {
      return `vec4 ${oVar} = vec4(${iVar});`
    }
    // vec2
    if (iType === SocketType.Vector2 && oType === SocketType.Float) {
      return `float ${oVar} = ${iVar}.x;`
    }
    if (iType === SocketType.Vector2 && oType === SocketType.Vector3) {
      return `vec3 ${oVar} = vec3(${iVar}, 0.0);`
    }
    if (iType === SocketType.Vector2 && oType === SocketType.Vector4) {
      return `vec4 ${oVar} = vec4(${iVar}, 0.0, 0.0);`
    }
    // vec3
    if (iType === SocketType.Vector3 && oType === SocketType.Float) {
      return `float ${oVar} = ${iVar}.x;`
    }
    if (iType === SocketType.Vector3 && oType === SocketType.Vector2) {
      return `vec2 ${oVar} = vec2(${iVar}.x, ${iVar}.y);`
    }
    if (iType === SocketType.Vector3 && oType === SocketType.Vector4) {
      return `vec4 ${oVar} = vec4(${iVar}, 0.0);`
    }
    // vec4
    if (iType === SocketType.Vector4 && oType === SocketType.Float) {
      return `float ${oVar} = ${iVar}.x;`
    }
    if (iType === SocketType.Vector4 && oType === SocketType.Vector2) {
      return `vec2 ${oVar} = vec2(${iVar}.x, ${iVar}.y);`
    }
    if (iType === SocketType.Vector4 && oType === SocketType.Vector3) {
      return `vec3 ${oVar} = vec3(${iVar}.x, ${iVar}.y, ${iVar}.z);`
    }
    return ""
  }
}