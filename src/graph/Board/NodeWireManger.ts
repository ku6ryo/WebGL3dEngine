import shortUUID from "short-uuid";
import { NodeProps, WireProps } from "./types";


export class NodeWireManager {

  #id = shortUUID.generate()
  #nodes: NodeProps[] = []
  #wires: WireProps[] = []
  #onUpdate: null | ((updateId: string) => void) = null

  setOnUpdate(onUpdate: (updateId: string) => void) {
    this.#onUpdate = onUpdate
  }

  private notifyUpdate() {
    if (this.#onUpdate) {
      this.#onUpdate(this.#id)
    }
  }

  getUpdateId() {
    return this.#id
  }

  getNodes() {
    return [...this.#nodes]
  }

  updateNodes(nodes: NodeProps[]) {
    this.#nodes = [...nodes]
    this.#id = shortUUID.generate()
    this.notifyUpdate()
  }

  getWires() {
    return [...this.#wires]
  }

  updateWires(wires: WireProps[]) {
    this.#wires = [...wires]
    this.#id = shortUUID.generate()
    this.notifyUpdate()
  }
}