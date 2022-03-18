import { MouseEventHandler, MouseEvent, useRef, useState, memo, useCallback, ChangeEventHandler, KeyboardEventHandler, useEffect } from "react"
import style from "./style.module.scss"
import classnames from "classnames"

export type SocketDirection = "in" | "out"

export enum NodeColor {
  Orange = "orange",
  Blue = "blue",
  Red = "red",
  Green = "green",
  Pink = "pink",
  Purple = "purple",
}

export enum InNodeInputType {
  Float = "float",
  Image = "image",
}

export type InNodeInputValue = {
  float?: number,
  image?: HTMLImageElement,
}

export type InSocket = {
  label: string,
  alternativeValueInputType?: InNodeInputType,
}

export type OutSocket = {
  label: string,
}

export type NodeCorner = {
  x: number,
  y: number,
}

function extractInfoFromCircle(e: MouseEvent<HTMLElement>, frame: SVGForeignObjectElement) {
  const circle = e.currentTarget
  const circleRect = circle.getBoundingClientRect()
  const frameRect = frame.getBoundingClientRect()
  const fx = frameRect.x
  const fy = frameRect.y
  const i = Number(circle.dataset.socketIndex)
  const dir = circle.dataset.socketDirection as SocketDirection
  const cx = circleRect.x + circleRect.width / 2
  const cy = circleRect.y + circleRect.height / 2
  const x = cx - fx
  const y = cy - fy
  return {
    i,
    dir: dir as SocketDirection,
    // releative to frame and not considering zoom.
    socketX: x,
    socketY: y,
  }
}

type Props = {
  id: string,
  color: NodeColor,
  name: string,
  x: number,
  y: number,
  inSockets: InSocket[],
  outSockets: OutSocket[],
  inNodeInputSlots: InNodeInputType[],
  selected: boolean,
  onSocketMouseUp: (id: string, direction: SocketDirection, i: number, x: number, y: number) => void,
  onSocketMouseDown: (id: string, direction: SocketDirection, i: number, x: number, y: number) => void,
  onDragStart: (id: string, x: number, y: number) => void,
  onInNodeValueChange: (id: string, i: number, value: InNodeInputValue) => void,
  onNodeResize: (id: string, rect: DOMRect) => void,
}

export const NodeBox = memo(function NodeBox({
  id,
  name,
  color,
  x,
  y,
  inSockets,
  outSockets,
  inNodeInputSlots,
  onSocketMouseUp,
  onSocketMouseDown,
  selected,
  onDragStart,
  onInNodeValueChange,
  onNodeResize,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [imageValue, setImageValue] = useState<HTMLImageElement | null>(null)
  const frameRef = useRef<SVGForeignObjectElement | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const onSocketMouseUpInternal: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    if (!frameRef.current) {
      return
    }
    e.stopPropagation()
    const { i, dir, socketX, socketY } = extractInfoFromCircle(e, frameRef.current)
    onSocketMouseUp(id, dir, i, socketX, socketY)
  }, [id, x, y, onSocketMouseUp, frameRef.current])

  const onSocketMouseDownInternal: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    if (!frameRef.current) {
      return
    }
    e.stopPropagation()
    const { i, dir, socketX, socketY } = extractInfoFromCircle(e, frameRef.current)
    onSocketMouseDown(id, dir, i, socketX, socketY)
  }, [id, x, y, onSocketMouseDown, frameRef.current])

  const onBoxMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    if (e.button === 0) {
      e.stopPropagation()
      onDragStart(id, e.clientX, e.clientY)
    }
  }, [id, onDragStart])

  const onFloatValueChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const index = Number(e.currentTarget.dataset.index)
    onInNodeValueChange(id, index, { float: Number(e.currentTarget.value) })
  }, [id, onInNodeValueChange])

  const onKeyDownInFloatValueInput: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
    e.stopPropagation()
  }, [])

  useEffect(() => {
    if (boxRef.current) {
      onNodeResize(id, boxRef.current.getBoundingClientRect())
    }
  }, [boxRef.current])

  const onImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    ;(async () => {
      const files = e.target.files
      if (files) {
        const file = files.item(0)
        if (file) {
          var arrayBufferView = new Uint8Array(await file.arrayBuffer())
          var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
          var urlCreator = window.URL || window.webkitURL;
          var imageUrl = urlCreator.createObjectURL( blob );
          var img = new Image()
          img.src = imageUrl;
          img.onload = () => {
            onInNodeValueChange(id, index, { image: img })
            setImageValue(img)
          }
        }
      }
    })()
  }
  const onImageInputRectClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click()
    }
  }
  return (
    <g
      transform={`translate(${x}, ${y})`}
    >
      <foreignObject
        ref={frameRef}
        width={1}
        height={1}
        className={classnames({
          [style.frame]: true,
          [style.selected]: selected,
        })}
      >
        <div
          className={style.box}
          onMouseDown={onBoxMouseDown}
          ref={boxRef}
        >
          <div className={
            classnames({
              [style.name]: true,
              [style[color]]: true
            })
          }>{name}</div>
          <div className={style.outputs}>
            {outSockets.map((socket, i) => (
              <div
                className={style.row}
                key={i}
              >
                <div>{socket.label}</div>
                <div
                  className={style.socket}
                  data-socket-index={i}
                  data-socket-direction="out"
                  onMouseDown={onSocketMouseDownInternal}
                  onMouseUp={onSocketMouseUpInternal}
                />
              </div>
            ))}
          </div>
          {inNodeInputSlots.length > 0 && (
            <div className={style.inValueSlots}>
              {inNodeInputSlots.map((t, i) => {
                if (t === InNodeInputType.Float) {
                  return (
                    <div className={style.slot}>
                      <input data-index={i} onChange={onFloatValueChange} type="number" onKeyDown={onKeyDownInFloatValueInput}/>
                    </div>
                  )
                }
                if (t === InNodeInputType.Image) {
                  return (
                    <div className={style.slot}>
                      <div className={style.imageInputRect} onClick={onImageInputRectClick}>
                        {imageValue && (
                          <img src={imageValue.src}/>
                        )}
                      </div>
                      <input
                        data-index={i}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={onImageInputChange}
                        ref={imageInputRef}
                        className={style.imageInput}
                      />
                    </div>
                  )
                }
              }).filter(elem => !!elem)}
            </div>
          )}
          <div className={style.inputs}>
            {inSockets.map((socket, i) => (
              <div
                className={style.row}
                key={i}
              >
                <div
                  className={style.socket}
                  data-socket-index={i}
                  data-socket-direction="in"
                  onMouseDown={onSocketMouseDownInternal}
                  onMouseUp={onSocketMouseUpInternal}
                />
                <div>{socket.label}</div>
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
    </g>
  )
})