import { NodeTypeId } from "./NodeTypeId"
import { NodeColor } from "../../graph/NodeBox"
import { NodeBlueprint } from "../../graph/Board"
import { mathTypes } from "./data_types"

export const outputFactories = [{
  id: NodeTypeId.OutputColor,
  name: "Output / Color",
  factory: () => {
    return {
      color: NodeColor.Green,
      inNodeInputSlots: [],
      inSockets: [{
        label: "Color",
        dataTypes: mathTypes,
      }],
      outSockets: []
    } as NodeBlueprint
  }
}]