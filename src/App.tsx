import style from "./App.module.scss";
import { Board, NodeProps, WireProps } from "./graph/Board";
import { ShaderPreview } from "./ShaderPreview";
import { factories } from "./graph_definitions/definitions/factories";
import { createGraphFromInputs } from "./graph_definitions/createGraphFromInputs";

let preview = new ShaderPreview()
let prevNodesCount = -1
let prevWireCount = -1
function onChange(nodes: NodeProps[], wires: WireProps[]) {
  if (nodes.length === 0) {
    return
  }
  if (prevNodesCount !== nodes.length || prevWireCount !== wires.length) {
    console.log(nodes, wires)
    prevNodesCount = nodes.length
    prevWireCount = wires.length
    try {
      const graph = createGraphFromInputs(nodes, wires)
      preview.update(graph)
    } catch (e) {
      console.error(e)
    }
  }
}

preview.start()

export const App = () => {
  return (
    <div className={style.container}>
      <Board factories={factories} onChange={onChange}/>
    </div>
  )
}