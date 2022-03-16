import { NodeTypeId } from "./NodeTypeId"
import { NodeColor, InNodeInputType } from "../../graph/NodeBox"
import { NodeBlueprint } from "../../graph/Board.tsx"

export const inputFactories = [{
  id: NodeTypeId.InputUv,
  name: "Input / UV",
  factory: () => {
    return {
      color: NodeColor.Red,
      inNodeInputSlots: [],
      inSockets: [],
      outSockets: [{
        label: "UV",
      }]
    } as NodeBlueprint
  }
}, {
  id: NodeTypeId.InputFloat,
  name: "Input / Float",
  factory: () => {
    return {
      color: NodeColor.Red,
      inNodeInputSlots: [InNodeInputType.Float],
      inSockets: [],
      outSockets: [{
        label: "value",
      }]
    } as NodeBlueprint
  }
}]