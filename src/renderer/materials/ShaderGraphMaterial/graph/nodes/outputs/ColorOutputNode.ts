import { Node } from "../../Node";
import { Socket, SocketType } from "../../Socket";


export class ColorOutputNode extends Node {

  constructor(id: string) {
    super(id, "ColorOutput", undefined, undefined, true)
    this.addInSocket("in0", SocketType.Vector4)
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const inputs = this.getInSockets()
    return `
    gl_FragColor = ${inputs[0].getVeriableName()};
    `
  }
}