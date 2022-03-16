import { NodeProps, WireProps } from "../graph/Board.tsx";
import { ShaderDataType } from "../renderer/materials/ShaderGraphMaterial/graph/data_types";
import { Graph } from "../renderer/materials/ShaderGraphMaterial/graph/Graph";
import { Node } from "../renderer/materials/ShaderGraphMaterial/graph/Node";
import { FloatInputNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/FloatInputNode";
import { UvInputNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/UvInputNode";
import { AddNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/AddNode";
import { PerlinNoiseNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/noises/ParlinNoiseNode";
import { ColorOutputNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/outputs/ColorOutputNode";
import { Wire } from "../renderer/materials/ShaderGraphMaterial/graph/Wire";
import { NodeTypeId } from "../graph_definitions/definitions/NodeTypeId";
import { SineNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/SineNode";
import { CosineNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/CosineNode";
import { TangentNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/TangentNode";
import { DotNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/DotNode";
import { SubtractNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/SubtractNode";
import { FracNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/FracNode";
import { MultiplyNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/MultiplyNode";
import { TextureInputNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/TextureInputNode";
import { SampleTextureNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/texture/SampleTextureNode";
import { TimeInputNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/TimeInputNode";
import { CombineNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/CombineNode";
import { SeparateNode } from "../renderer/materials/ShaderGraphMaterial/graph/nodes/math/SeparateNode";


export function createGraphFromInputs(nodes: NodeProps[], wires: WireProps[]): Graph {
  const graph = new Graph()
  nodes.forEach(n => {
    let sn: Node | null = null
    // Input
    if (n.typeId === NodeTypeId.InputUv) {
      sn = new UvInputNode(n.id)
    }
    if (n.typeId === NodeTypeId.InputTime) {
      sn = new TimeInputNode(n.id)
    }
    if (n.typeId === NodeTypeId.InputFloat) {
      sn = (() => {
        const node = new FloatInputNode(n.id)
        node.setValue(n.inNodeInputValues[0].float || 0)
        return node
      })()
    }
    if (n.typeId === NodeTypeId.InputTexture) {
      sn = (() => {
        if (n.inNodeInputValues[0].image) {
          return new TextureInputNode(n.id, n.inNodeInputValues[0].image)
        } else {
          throw new Error("no image")
        }
      })()
    }
    // Output
    if (n.typeId === NodeTypeId.OutputColor) {
      sn = new ColorOutputNode(n.id)
    }
    // Math
    if (n.typeId === NodeTypeId.MathAdd) {
      sn = new AddNode(n.id, ShaderDataType.Vector4)
    }
    if (n.typeId === NodeTypeId.MathSine) {
      sn = new SineNode(n.id, ShaderDataType.Vector4)
    }
    if (n.typeId === NodeTypeId.MathCosine) {
      sn = new CosineNode(n.id, ShaderDataType.Vector4)
    }
    if (n.typeId === NodeTypeId.MathTangent) {
      sn = new TangentNode(n.id, ShaderDataType.Vector4)
    }
    if (n.typeId === NodeTypeId.MathDot) {
      sn = new DotNode(n.id, ShaderDataType.Vector4)
    }
    if (n.typeId === NodeTypeId.MathMultiply) {
      sn = new MultiplyNode(n.id, ShaderDataType.Vector4)
    }
    if (n.typeId === NodeTypeId.MathSubtract) {
      sn = new SubtractNode(n.id, ShaderDataType.Vector4)
    }
    if (n.typeId === NodeTypeId.MathFrac) {
      sn = new FracNode(n.id, ShaderDataType.Vector4)
    }
    if (n.typeId === NodeTypeId.MathCombine) {
      sn = new CombineNode(n.id)
    }
    if (n.typeId === NodeTypeId.MathSeparate) {
      sn = new SeparateNode(n.id)
    }
    // Texture
    if (n.typeId === NodeTypeId.TexturePerlinNoise) {
      sn = new PerlinNoiseNode(n.id)
    }
    if (n.typeId === NodeTypeId.TextureSample) {
      sn = new SampleTextureNode(n.id)
    }

    if (sn) {
      graph.addNode(sn)
    }
  })
  wires.forEach(w => {
    const node1 = graph.getNodes().find(n => n.getId() === w.nodeId1)
    const node2 = graph.getNodes().find(n => n.getId() === w.nodeId2)
    if (node1 && node2) {
      graph.addWire(
        new Wire(
          node2.getOutSockets()[w.socketIndex2],
          node1.getInSockets()[w.socketIndex1],
        )
      )
    }
  })
  return graph
}