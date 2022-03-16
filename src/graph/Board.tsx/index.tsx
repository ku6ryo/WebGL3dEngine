import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { NodeBox, InSocket, OutSocket, SocketDirection, NodeColor, InNodeInputType, InNodeInputValue } from "../NodeBox";
import { WireLine } from "../WireLine";
import style from "./style.module.scss"

export type NodeProps = {
  id: string,
  typeId: string,
  x: number,
  y: number,
  name: string,
  color: NodeColor,
  inSockets: InSocket[],
  outSockets: OutSocket[]
  inNodeInputSlots: InNodeInputType[],
  inNodeInputValues: InNodeInputValue[],
  selected: boolean,
}

type DraggingNodeStats = {
  id: string,
  startX: number,
  startY: number,
  startMouseX: number,
  startMouseY: number,
  // Wires connected when dragging started.
  wires: WireProps[]
}

export type WireProps = {
  nodeId1: string,
  nodeId2: string,
  socketIndex1: number,
  socketIndex2: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

type DrawingWireStats = {
  nodeId: string,
  socketIndex: number,
  direction: SocketDirection,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

let nextId = 0
function generateNodeId() {
  return nextId++
}

export type NodeBlueprint = {
  color: NodeColor,
  inSockets: InSocket[],
  outSockets: OutSocket[],
  inNodeInputSlots: InNodeInputType[],
}

export type NodeFactory = {
  id: string,
  name: string
  factory: () => NodeBlueprint
}

type Props = {
  factories: NodeFactory[]
  onChange: (nodes: NodeProps[], wires: WireProps[]) => void
}

/**
 * A board to place nodes and wires.
 */
export function Board({
  factories,
  onChange,
}: Props) {
  const svgRootRef = useRef<SVGSVGElement | null>(null)
  const [drawingWire, setDrawingWire] = useState<DrawingWireStats | null>(null)
  const [draggingNode, setDraggingNode] = useState<DraggingNodeStats | null>(null)
  const [wires, setWires] = useState<WireProps[]>([])
  const [nodes, setNodes] = useState<NodeProps[]>([])
  const onSocketMouseDown = (id: string, dir: "in" | "out", i: number, x: number, y: number) => {
    if (dir === "out") {
      setDrawingWire({
        direction: dir,
        nodeId: id,
        socketIndex: i,
        x1: x,
        y1: y,
        x2: x,
        y2: y
      })
    } else {
      const existingWire = wires.find(w => w.nodeId1 === id && w.socketIndex1 === i)
      if (existingWire) {
        setWires(wires.filter(w => w !== existingWire))
        setDrawingWire({
          direction: "out",
          nodeId: id,
          socketIndex: i,
          x1: existingWire.x1,
          y1: existingWire.y1,
          x2: x,
          y2: y
        })
      } else {
        setDrawingWire({
          direction: dir,
          nodeId: id,
          socketIndex: i,
          x1: x,
          y1: y,
          x2: x,
          y2: y
        })
      }
    }
  }
  const onSocketMouseUp = (id: string, dir: SocketDirection, i: number, x: number, y: number) => {
    if (drawingWire === null) {
      return
    }
    if (drawingWire.nodeId === id || drawingWire.direction === dir) {
      return
    }
    if (drawingWire.direction === "in") {
      setWires([
        ...wires,
        {
          nodeId1: drawingWire.nodeId,
          socketIndex1: drawingWire.socketIndex,
          nodeId2: id,
          socketIndex2: i,
          x1: x,
          y1: y,
          x2: drawingWire.x1,
          y2: drawingWire.y1,
        }
      ])
    } else {
      const newWire = {
        nodeId1: id,
        socketIndex1: i,
        nodeId2: drawingWire.nodeId,
        socketIndex2: drawingWire.socketIndex,
        x1: drawingWire.x1,
        y1: drawingWire.y1,
        x2: x,
        y2: y,
      }
      const existingWire = wires.find(w => w.nodeId1 === id && w.socketIndex1 === i)
      if (existingWire) {
        setWires(wires.filter(w => w !== existingWire).concat(newWire))
      } else {
        setWires([...wires, newWire])
      }
    }
  }
  // Emit change.
  useEffect(() => {
    onChange(nodes, wires)
  }, [nodes, wires])
  const onNodeDragStart = (id: string, x: number, y: number) => {
    const t = nodes.find(n => n.id === id)
    if (t) {
      t.selected = true
      setDraggingNode({
        id,
        startX: t.x,
        startY: t.y,
        startMouseX: x,
        startMouseY: y,
        wires: wires.filter(w => w.nodeId1 === id || w.nodeId2 === id).map(w => ({...w}))
      })
      const newArray = nodes.filter(n => t !== n).map(n => { n.selected = false; return n })
      newArray.push(t)
      setNodes(newArray)
    }
  }
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (drawingWire) {
      const t = e.currentTarget
      const x = e.clientX - t.getBoundingClientRect().left
      const y = e.clientY - t.getBoundingClientRect().top
      const sx = drawingWire.x1
      const sy = drawingWire.y1
      const dx = x - sx
      const dy = y - sy
      const d = Math.sqrt(dx * dx + dy * dy)
      setDrawingWire({
        ...drawingWire,
        x2: x - dx / d * 2,
        y2: y - dy / d * 2,
      })
    }
    if (draggingNode !== null) {
      const t = nodes.find(n => n.id === draggingNode.id)
      if (t) {
        const x = e.clientX - draggingNode.startMouseX + draggingNode.startX
        const y = e.clientY - draggingNode.startMouseY + draggingNode.startY
        setNodes(nodes.map(n => n.id === draggingNode.id ? { ...n, x, y } : n))
      }
      setWires(wires.map(w => {
        if (w.nodeId1 === draggingNode.id) {
          const sw = draggingNode.wires.find(sw => sw.nodeId1 === w.nodeId1 && sw.socketIndex1 === w.socketIndex1)
          if (sw) {
            const x = sw.x2 + e.clientX - draggingNode.startMouseX 
            const y = sw.y2 + e.clientY - draggingNode.startMouseY
            w.x2 = x
            w.y2 = y
          }
        }
        if (w.nodeId2 === draggingNode.id) {
          const sw = draggingNode.wires.find(sw => sw.nodeId2 === w.nodeId2 && sw.socketIndex2 === w.socketIndex2)
          if (sw) {
            const x = sw.x1 + e.clientX - draggingNode.startMouseX 
            const y = sw.y1 + e.clientY - draggingNode.startMouseY
            w.x1 = x
            w.y1 = y
          }
        }
        return w
      }))
    }
  }
  const onMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRootRef.current) {
      setNodes(nodes.map(n => { n.selected = false; return n }))
    }
    setDrawingWire(null)
    setDraggingNode(null)
  }
  const onMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
    setDrawingWire(null)
    setDraggingNode(null)
  }
  const onNodeAdd: MouseEventHandler<HTMLDivElement> = (e) => {
    const typeId = e.currentTarget.dataset.nodeTypeId
    const f = factories.find(f => f.id === typeId)
    if (f) {
      const n = f.factory()
      setNodes([
        ...nodes,
        {
          id: f.id + generateNodeId(),
          typeId: f.id,
          x: 0,
          y: 0,
          color: n.color,
          name: f.name,
          selected: false,
          inNodeInputSlots: n.inNodeInputSlots,
          inNodeInputValues: Array(n.inNodeInputSlots.length).fill({}),
          inSockets: n.inSockets,
          outSockets: n.outSockets,
        }
      ])
    } else {
      throw new Error("No factory found for node type " + typeId)
    }
  }
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === "Delete" || e.code === "Backspace") {
        const target = nodes.find(n => n.selected)
        setNodes(nodes.filter(n => n !== target))
        setWires(wires.filter(w => w.nodeId1 != target?.id && w.nodeId2 != target?.id))
      }
    }
    window.addEventListener("keydown", listener)
    return () => {
      window.removeEventListener("keydown", listener)
    }
  }, [nodes, wires])
  const onInNodeValueChange = (nodeId: string, index: number, value: InNodeInputValue) => {
    const n = nodes.find(n => n.id === nodeId)
    if (n) {
      n.inNodeInputValues[index] = value
    }
  }
  return (
    <div className={style.frame}>
      <div className={style.nodeSelector}>
        {factories.map(f => (
          <div
            key={f.id}
            className={style.item}
            data-node-type-id={f.id}
            onClick={onNodeAdd}
          >{f.name}</div>
        ))}
      </div>
      <svg
        className={style.board}
        ref={svgRootRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
       <defs>
        <linearGradient id="wire-linear" x1="20%" y1="0%" x2="80%" y2="0%" spreadMethod="pad">
          <stop offset="0%"   stopColor="#ddd"/>
          <stop offset="100%" stopColor="#888"/>
        </linearGradient>
        </defs>
        {wires.map(w => (
          <WireLine x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}/>
        ))}
        {nodes.map((n) => (
          <NodeBox
            key={n.id}
            id={n.id}
            name={n.name}
            color={n.color}
            x={n.x}
            y={n.y}
            selected={n.selected}
            inSockets={n.inSockets}
            outSockets={n.outSockets}
            inNodeInputSlots={n.inNodeInputSlots}
            onSocketMouseDown={onSocketMouseDown}
            onSocketMouseUp={onSocketMouseUp}
            onDragStart={onNodeDragStart}
            onInNodeValueChange={onInNodeValueChange}
          />
        ))}
        {drawingWire && (drawingWire.direction == "in" ? (
          <WireLine x1={drawingWire.x2} y1={drawingWire.y2} x2={drawingWire.x1} y2={drawingWire.y1}/>
        ) : (
          <WireLine x1={drawingWire.x1} y1={drawingWire.y1} x2={drawingWire.x2} y2={drawingWire.y2}/>
        ))}
      </svg>
    </div>
  )
}