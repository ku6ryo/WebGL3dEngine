import { NodeTypeId } from "./NodeTypeId"
import { NodeColor } from "../../graph/NodeBox"
import { NodeBlueprint } from "../../graph/Board.tsx"

export const textureFactories = [{
  id: NodeTypeId.TextureSample,
  name: "Texture / Sample",
  factory: () => {
    return {
      color: NodeColor.Orange,
      inNodeInputSlots: [],
      inSockets: [{
        label: "Texture",
      }, {
        label: "UV",
      }],
      outSockets: [{
        label: "Color",
      }]
    } as NodeBlueprint
  }
}, {
  id: NodeTypeId.TexturePerlinNoise,
  name: "Texture / Parlin Noise",
  factory: () => {
    return {
      color: NodeColor.Orange,
      inNodeInputSlots: [],
      inSockets: [{
        label: "UV",
      }],
      outSockets: [{
        label: "Color",
      }]
    } as NodeBlueprint
  }
}]