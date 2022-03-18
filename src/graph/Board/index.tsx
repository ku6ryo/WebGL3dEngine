import React, { MouseEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { NodeBox, InSocket, OutSocket, SocketDirection, NodeColor, InNodeInputType, InNodeInputValue } from "../NodeBox";
import { WireLine } from "../WireLine";
import style from "./style.module.scss"
import classnames from "classnames"
import { HistoryManager } from "./HistoryManager";

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
  startMouseX: number,
  startMouseY: number,
  nodes: { [id: string]: NodeProps },
  wires: { [key: string]: WireProps },
}

type DrawingRectStats = {
  startX: number,
  startY: number,
  x: number
  y: number
  width: number
  height: number
}

export type WireProps = {
  id: string,
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
  startCenterX: number,
  startCenterY: number,
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
  const [drawingRect, setDrawingRect] = useState<DrawingRectStats | null>(null)
  const [wires, setWires] = useState<WireProps[]>([])
  const [nodes, setNodes] = useState<NodeProps[]>([])

  const historyManager = useMemo(() => new HistoryManager(), [])

  const goToPrevHistory = () => {
    const history = historyManager.goBack()
    if (!history) {
      console.log("No history to go back to")
      return
    }
    const nodes = Object.values(history.nodes)
    const wires = Object.values(history.wires)
    setNodes(nodes)
    setWires(wires)
  }

  const onSocketMouseDown = (id: string, dir: SocketDirection, i: number, x: number, y: number) => {
    const node = nodes.find(n => n.id === id)
    if (!node) {
      return
    }
    const zoomedX = x / board.zoom + node.x
    const zoomedY = y / board.zoom + node.y
    if (dir === "out") {
      setDrawingWire({
        startDirection: dir,
        startNodeId: id,
        startSocketIndex: i,
        startX: zoomedX,
        startY: zoomedY,
        movingX: zoomedX,
        movingY: zoomedY
      })
    } else {
      const existingWire = wires.find(w => w.outNodeId === id && w.outSocketIndex === i)
      if (existingWire) {
        setWires(wires.filter(w => w !== existingWire))
        setDrawingWire({
          startDirection: "out",
          startNodeId: existingWire.inNodeId,
          startSocketIndex: existingWire.inSocketIndex,
          startX: existingWire.inX,
          startY: existingWire.inY,
          movingX: zoomedX,
          movingY: zoomedY
        })
      } else {
        setDrawingWire({
          startDirection: dir,
          startNodeId: id,
          startSocketIndex: i,
          startX: zoomedX,
          startY: zoomedY,
          movingX: zoomedX,
          movingY: zoomedY
        })
      }
    }
  }
  const onSocketMouseUp = (id: string, dir: SocketDirection, i: number, x: number, y: number) => {
    if (drawingWire === null || drawingWire.startNodeId === id || drawingWire.startDirection === dir) {
      return
    }
    const node = nodes.find(n => n.id === id)
    if (!node) {
      return
    }
    const zoomedX = x / board.zoom + node.x
    const zoomedY = y / board.zoom + node.y
    let newWires: WireProps[] = []
    if (drawingWire.startDirection === "in") {
      newWires = [
        ...wires,
        {
          id: "w" + generateNodeId(),
          inNodeId: id,
          inSocketIndex: i,
          outNodeId: drawingWire.startNodeId,
          outSocketIndex: drawingWire.startSocketIndex,
          inX: zoomedX,
          inY: zoomedY,
          outX: drawingWire.startX,
          outY: drawingWire.startY,
        }
      ]
    } else {
      const newWire = {
        id: "w" + generateNodeId(),
        inNodeId: drawingWire.startNodeId,
        inSocketIndex: drawingWire.startSocketIndex,
        outNodeId: id,
        outSocketIndex: i,
        inX: drawingWire.startX,
        inY: drawingWire.startY,
        outX: zoomedX,
        outY: zoomedY,
      }
      const existingWire = wires.find(w => w.outNodeId === id && w.outSocketIndex === i)
      if (existingWire) {
        newWires = wires.filter(w => w !== existingWire).concat(newWire)
      } else {
        newWires = [...wires, newWire]
      }
    }
    setWires(newWires)
    historyManager.save(nodes, newWires)
    setDrawingWire(null)
  }

  const onNodeDragStart = (id: string, mouseX: number, mouseY: number) => {
    const targetNode = nodes.find(n => n.id === id)
    if (targetNode) {
      // Wheel button
      if (!svgRootRef.current) {
        return
      }
      const svgRect = svgRootRef.current.getBoundingClientRect()
      const mouseOnBoardX = mouseX - svgRect.x
      const mouseOnBoardY = mouseY - svgRect.y
      if (!targetNode.selected) {
        nodes.forEach(n => {
          n.selected = false
        })
      }
      targetNode.selected = true
      const nodesToSave: { [key: string]: NodeProps } = {}
      nodes.forEach(n => {
        nodesToSave[n.id] = {...n}
      })
      const wiresToSave: { [key: string]: WireProps } = {}
      wires.forEach(n => {
        wiresToSave[n.id] = {...n}
      })
      setDraggingNode({
        startMouseX: mouseOnBoardX,
        startMouseY: mouseOnBoardY,
        nodes: nodesToSave,
        wires: wiresToSave,
      })
      const newNodes = [...nodes]
      const newWires = [...wires]
      setNodes(newNodes)
      setWires(newWires)
    }
  }

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRootRef.current) {
      return
    }
    const svgRect = svgRootRef.current.getBoundingClientRect()
    const mouseX = e.clientX - svgRect.x
    const mouseY = e.clientY - svgRect.y
    const boardX = (mouseX + board.centerX - board.width / 2) / board.zoom
    const boardY = (mouseY + board.centerY - board.height / 2) / board.zoom

    if (drawingWire) {
      setDrawingWire({
        ...drawingWire,
        movingX: boardX + (drawingWire.startDirection === "in" ? 1 : -1) * 3 / board.zoom,
        movingY: boardY,
      })
    }

    if (draggingNode) {
      const dMouseX = mouseX - draggingNode.startMouseX
      const dMouseY = mouseY - draggingNode.startMouseY
      const savedNodes = draggingNode.nodes
      const savedWires = draggingNode.wires
      const updatedNodes = nodes.map(n => {
        if (!n.selected) {
          return n
        }
        const lastNode = savedNodes[n.id]
        if (!lastNode) {
          throw new Error("no last node ... might be a bug")
        }
        n.x = lastNode.x + dMouseX / board.zoom
        n.y = lastNode.y + dMouseY / board.zoom
        wires.forEach(w => {
          const lastWire = savedWires[w.id]
          if (!lastWire) {
            throw new Error("no last wire ... might be a bug")
          }
          if (w.inNodeId === n.id) {
            w.inX = lastWire.inX + dMouseX / board.zoom
            w.inY = lastWire.inY + dMouseY / board.zoom
          }
          if (w.outNodeId === n.id) {
            w.outX = lastWire.outX + dMouseX / board.zoom
            w.outY = lastWire.outY + dMouseY / board.zoom
          }
        })
        return n
      })
      setNodes(updatedNodes)
      setWires([...wires])
    }
    if (draggingBoard) {
      const x = draggingBoard.startCenterX - (mouseX - draggingBoard.startMouseX)
      const y = draggingBoard.startCenterY - (mouseY - draggingBoard.startMouseY)
      setBoard({
        ...board,
        centerX: x,
        centerY: y,
      })
    }
    if (drawingRect && svgRootRef.current) {
      const { startX, startY } = drawingRect
      setDrawingRect({
        ...drawingRect,
        x: Math.min(startX, boardX),
        y: Math.min(startY, boardY),
        width: Math.abs(startX - boardX),
        height: Math.abs(startY - boardY),
      })
    }
  }
  const onMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    setDrawingWire(null)
    if (draggingNode) {
      historyManager.save(nodes, wires)
      setDraggingNode(null)
    }
    setDraggingBoard(null)
    if (drawingRect) {
      const newNodes = nodes.map(n => {
        if (
          drawingRect.startX < n.x && n.x < drawingRect.x + drawingRect.width &&
          drawingRect.startY < n.y && n.y < drawingRect.y + drawingRect.height
        ) {
          n.selected = true
        } else {
          n.selected = false
        }
        return n
      })
      setNodes(newNodes)
    } else if (e.target === svgRootRef.current) {
      const newNodes = nodes.map(n => { n.selected = false; return n })
      setNodes(newNodes)
    }
    setDrawingRect(null)
  }
  const onMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    setCursorOnBoard(true)
  }
  const onMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
    setCursorOnBoard(false)
    setDrawingWire(null)
    setDraggingNode(null)
    setDraggingBoard(null)
    setDrawingRect(null)
  }
  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Wheel button
    if (!svgRootRef.current) {
      return
    }
    const svgRect = svgRootRef.current.getBoundingClientRect()
    const mouseX = e.clientX - svgRect.x
    const mouseY = e.clientY - svgRect.y

    // Start dragging board
    if (e.button == 1) {
      setDraggingBoard({
        startCenterX: board.centerX,
        startCenterY: board.centerY,
        startMouseX: mouseX,
        startMouseY: mouseY,
      })
    }

    // Start drawing selection rect
    if (e.button == 0 && svgRootRef.current) {
      const svgRect = svgRootRef.current.getBoundingClientRect()
      const x = (e.clientX - svgRect.x + board.centerX - board.width / 2) / board.zoom
      const y = (e.clientY - svgRect.y + board.centerY - board.height / 2) / board.zoom
      setDrawingRect({
        startX: x,
        startY: y,
        x: x,
        y: y,
        width: 0,
        height: 0,
      })
    }
  }

  const onNodeAdd: MouseEventHandler<HTMLDivElement> = (e) => {
    const typeId = e.currentTarget.dataset.nodeTypeId
    const f = factories.find(f => f.id === typeId)
    if (f) {
      const n = f.factory()
      const newNodes = [
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
      ]
      historyManager.save(newNodes, wires)
      setNodes(newNodes)
    } else {
      throw new Error("No factory found for node type " + typeId)
    }
  }

  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      if (e.code === "Delete" || e.code === "Backspace") {
        const nodesToKeep = nodes.filter(n => !n.selected)
        const nodesToRemove = nodes.filter(n => n.selected)
        setNodes(nodesToKeep)
        setWires(wires.filter(w => {
          return !nodesToRemove.find(n => {
            return w.inNodeId === n.id || w.outNodeId === n.id
          })
        }))
      }
      if (e.code === "Escape") {
        setNodes(nodes.map(n => { n.selected = false; return n }))
      }
      if (e.code === "KeyZ" && e.ctrlKey) {
        goToPrevHistory()
      }
    }
    const mouseWheelListener = (e: WheelEvent) => {
      if (!cursorOnBoad || draggingBoard) {
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
        setBoard({
          ...board,
          height: svgRootRef.current.clientHeight,
          width: svgRootRef.current.clientWidth,
        })
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

  // Initially set the board size.
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

  // Emit change.
  useEffect(() => {
    onChange(nodes, wires)
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
        className={classnames({
          [style.board]: true,
          [style.grabbing]: !!draggingNode
        })}
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
        {drawingRect && (
          <rect
            x={drawingRect.x}
            y={drawingRect.y}
            width={drawingRect.width}
            height={drawingRect.height}
            fill="rgba(255, 255, 255, 0.1)"
            stroke="white"
            strokeWidth={2 / board.zoom}
            strokeLinecap="round"
            strokeDasharray={`${4 / board.zoom} ${4 / board.zoom}`}
          />
        )}
      </svg>
    </div>
  )
}