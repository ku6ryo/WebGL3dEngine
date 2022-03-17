import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
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
  inNodeId: string,
  outNodeId: string,
  inSocketIndex: number,
  outSocketIndex: number,
  inX: number,
  inY: number,
  outX: number,
  outY: number,
}

type DrawingWireStats = {
  startNodeId: string,
  startSocketIndex: number,
  startDirection: SocketDirection,
  startX: number,
  startY: number,
  movingX: number,
  movingY: number,
}

type DraggingBoardStats = {
  startX: number,
  startY: number,
  startMouseX: number,
  startMouseY: number,
}

type BoardStats = {
  centerX: number,
  centerY: number,
  height: number,
  width: number,
  zoom: number,
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
  const [board, setBoard] = useState<BoardStats>({
    centerX: 0,
    centerY: 0,
    width: 1000,
    height: 1000,
    zoom: 1,
  })
  const [cursorOnBoad, setCursorOnBoard] = useState(false)
  const [draggingBoard, setDraggingBoard] = useState<DraggingBoardStats | null>(null)
  const [drawingWire, setDrawingWire] = useState<DrawingWireStats | null>(null)
  const [draggingNode, setDraggingNode] = useState<DraggingNodeStats | null>(null)
  const [wires, setWires] = useState<WireProps[]>([])
  const [nodes, setNodes] = useState<NodeProps[]>([])
  const onSocketMouseDown = (id: string, dir: "in" | "out", i: number, x: number, y: number) => {
    if (dir === "out") {
      setDrawingWire({
        startDirection: dir,
        startNodeId: id,
        startSocketIndex: i,
        startX: x,
        startY: y,
        movingX: x,
        movingY: y
      })
    } else {
      const existingWire = wires.find(w => w.inNodeId === id && w.inSocketIndex === i)
      if (existingWire) {
        setWires(wires.filter(w => w !== existingWire))
        setDrawingWire({
          startDirection: "out",
          startNodeId: id,
          startSocketIndex: i,
          startX: existingWire.inX,
          startY: existingWire.inY,
          movingX: x,
          movingY: y
        })
      } else {
        setDrawingWire({
          startDirection: dir,
          startNodeId: id,
          startSocketIndex: i,
          startX: x,
          startY: y,
          movingX: x,
          movingY: y
        })
      }
    }
  }
  const onSocketMouseUp = (id: string, dir: SocketDirection, i: number, x: number, y: number) => {
    if (drawingWire === null) {
      return
    }
    if (drawingWire.startNodeId === id || drawingWire.startDirection === dir) {
      return
    }
    if (drawingWire.startDirection === "in") {
      setWires([
        ...wires,
        {
          inNodeId: drawingWire.startNodeId,
          inSocketIndex: drawingWire.startSocketIndex,
          outNodeId: id,
          outSocketIndex: i,
          inX: x,
          inY: y,
          outX: drawingWire.startX,
          outY: drawingWire.startY,
        }
      ])
    } else {
      const newWire = {
        inNodeId: id,
        inSocketIndex: i,
        outNodeId: drawingWire.startNodeId,
        outSocketIndex: drawingWire.startSocketIndex,
        inX: drawingWire.startX,
        inY: drawingWire.startY,
        outX: x,
        outY: y,
      }
      const existingWire = wires.find(w => w.inNodeId === id && w.inSocketIndex === i)
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
        wires: wires.filter(w => w.inNodeId === id || w.outNodeId === id).map(w => ({...w}))
      })
      const newArray = nodes.filter(n => t !== n).map(n => { n.selected = false; return n })
      newArray.push(t)
      setNodes(newArray)
    }
  }
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (drawingWire) {
      const t = e.currentTarget
      const x = (board.centerX + e.clientX - t.getBoundingClientRect().left - board.width / 2) / board.zoom
      const y = (board.centerY + e.clientY - t.getBoundingClientRect().top - board.height / 2) / board.zoom
      setDrawingWire({
        ...drawingWire,
        movingX: x + (drawingWire.startDirection === "in" ? 1 : -1) * 2,
        movingY: y,
      })
    }
    if (draggingNode !== null) {
      const t = nodes.find(n => n.id === draggingNode.id)
      if (t) {
        const x = (e.clientX - draggingNode.startMouseX) / board.zoom + draggingNode.startX
        const y = (e.clientY - draggingNode.startMouseY) / board.zoom + draggingNode.startY
        setNodes(nodes.map(n => n.id === draggingNode.id ? { ...n, x, y } : n))
      }
      setWires(wires.map(w => {
        if (w.inNodeId === draggingNode.id) {
          const sw = draggingNode.wires.find(sw => sw.inNodeId === w.inNodeId && sw.inSocketIndex === w.inSocketIndex)
          if (sw) {
            const x = sw.outX + (e.clientX - draggingNode.startMouseX) / board.zoom
            const y = sw.outY + (e.clientY - draggingNode.startMouseY) / board.zoom
            w.outX = x
            w.outY = y
          }
        }
        if (w.outNodeId === draggingNode.id) {
          const sw = draggingNode.wires.find(sw => sw.outNodeId === w.outNodeId && sw.outSocketIndex === w.outSocketIndex)
          if (sw) {
            const x = sw.inX + (e.clientX - draggingNode.startMouseX) / board.zoom
            const y = sw.inY + (e.clientY - draggingNode.startMouseY) / board.zoom
            w.inX = x
            w.inY = y
          }
        }
        return w
      }))
    }
    if (draggingBoard) {
      const x = draggingBoard.startX - (e.clientX - draggingBoard.startMouseX) / board.zoom
      const y = draggingBoard.startY - (e.clientY - draggingBoard.startMouseY) / board.zoom
      setBoard({
        ...board,
        centerX: x,
        centerY: y,
      })
    }
  }
  const onMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRootRef.current) {
      setNodes(nodes.map(n => { n.selected = false; return n }))
    }
    setDrawingWire(null)
    setDraggingNode(null)
    setDraggingBoard(null)
  }
  const onMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    setCursorOnBoard(true)
  }
  const onMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
    setCursorOnBoard(false)
    setDrawingWire(null)
    setDraggingNode(null)
    setDraggingBoard(null)
  }
  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Wheel button
    if (e.button == 1) {
      setDraggingBoard({
        startX: board.centerX,
        startY: board.centerY,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
      })
    }
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
    const keydownListener = (e: KeyboardEvent) => {
      if (e.code === "Delete" || e.code === "Backspace") {
        const target = nodes.find(n => n.selected)
        setNodes(nodes.filter(n => n !== target))
        setWires(wires.filter(w => w.inNodeId != target?.id && w.outNodeId != target?.id))
      }
      if (e.code === "Escape") {
        setNodes(nodes.map(n => { n.selected = false; return n }))
      }
    }
    const mouseWheelListener = (e: WheelEvent) => {
      if (!cursorOnBoad) {
        return
      }
      const s = Math.sign(e.deltaY)
      if ((s > 0 && board.zoom > 0.3) || (s < 0 && board.zoom < 2.5)) {
        setBoard({
          ...board,
          zoom: board.zoom - 0.05 * Math.sign(e.deltaY)
        })
      }
    }
    const resizeListener = () => {
      if (svgRootRef.current) {
      }
    }
    window.addEventListener("keydown", keydownListener)
    window.addEventListener("wheel", mouseWheelListener)
    window.addEventListener("resize", resizeListener)
    return () => {
      window.removeEventListener("keydown", keydownListener)
      window.removeEventListener("wheel", mouseWheelListener)
      window.removeEventListener("resize", resizeListener)
    }
  }, [nodes, wires, board, cursorOnBoad, svgRootRef.current])
  useEffect(() => {
    if (svgRootRef.current) {
      setBoard({
        centerX: 0,
        centerY: 0,
        height: svgRootRef.current.clientHeight,
        width: svgRootRef.current.clientWidth,
        zoom: 1
      })
    }
  }, [svgRootRef.current])
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
        viewBox={`${(board.centerX - board.width / 2) / board.zoom} ${(board.centerY - board.height / 2) / board.zoom} ${board.width / board.zoom} ${board.height / board.zoom}`}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
       <defs>
        <linearGradient id="wire-linear" x1="20%" y1="0%" x2="80%" y2="0%" spreadMethod="pad">
          <stop offset="0%"   stopColor="#ddd"/>
          <stop offset="100%" stopColor="#888"/>
        </linearGradient>
        </defs>
        {wires.map(w => (
          <WireLine x1={w.inX} y1={w.inY} x2={w.outX} y2={w.outY}/>
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
        {drawingWire && (drawingWire.startDirection == "in" ? (
          <WireLine x1={drawingWire.movingX} y1={drawingWire.movingY} x2={drawingWire.startX} y2={drawingWire.startY}/>
        ) : (
          <WireLine x1={drawingWire.startX} y1={drawingWire.startY} x2={drawingWire.movingX} y2={drawingWire.movingY}/>
        ))}
      </svg>
    </div>
  )
}