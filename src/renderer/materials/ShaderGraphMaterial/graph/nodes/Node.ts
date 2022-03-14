import { validVariableName } from "../utils";
import { Socket, SocketType } from "./Socket";

export abstract class Node {
  // Unique id for this node
  #id: string;
  // ID to distinguish node types.
  #typeId: string;

  // Input parameter sockets
  #inSockets: Socket[] = [];
  // Output parameter sockets
  #outSockets: Socket[] = [];

  constructor(id: string, typeId: string) {
    if (!validVariableName(id)) {
      throw new Error(`Invalid node id: ${id}`)
    }
    if (!validVariableName(typeId)) {
      throw new Error(`Invalid node typeId: ${typeId}`)
    }
    this.#id = id;
    this.#typeId = typeId;
  }

  getId() {
    return this.#id
  }

  getTypeId() {
    return this.#typeId
  }
  
  createSocket(name: string, type: SocketType) {
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

  abstract generateCommonCode(): string;

  abstract generateCode(): string
}