import { NodeTypeId } from "./NodeTypeId"
import { NodeColor } from "../../graph/NodeBox"
import { NodeBlueprint } from "../../graph/Board.tsx"

export const outputFactories = [{
  id: NodeTypeId.OutputColor,
  name: "Output / Color",
  factory: () => {
    return {
      color: NodeColor.Green,
      inNodeInputSlots: [],
      inSockets: [{
        label: "Color",
      }],
      outSockets: []
    } as NodeBlueprint
  }
}]