import style from "./App.module.scss";
import { Board } from "./graph/Board";
import { NodeProps, WireProps } from "./graph/Board/types";
import { factories } from "./graph_definitions/definitions/factories";
import { createGraphFromInputs } from "./graph_definitions/createGraphFromInputs";
import { Preview } from "./graph/Preview";

function onChange(nodes: NodeProps[], wires: WireProps[]) {
  /*
  if (nodes.length === 0) {
    return
  }
  if (prevNodesCount !== nodes.length || prevWireCount !== wires.length) {
    prevNodesCount = nodes.length
    prevWireCount = wires.length
    try {
      const graph = createGraphFromInputs(nodes, wires)
      preview.update(graph)
    } catch (e) {
      console.error(e)
    }
  }
  */
}

export const App = () => {
  return (
    <>
      <div className={style.board}>
        <Board factories={factories} onChange={onChange}/>
      </div>
      <div className={style.preview}>
        <Preview />
      </div>
    </>
  )
}