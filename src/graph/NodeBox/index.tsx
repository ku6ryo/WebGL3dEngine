import { MouseEventHandler, MouseEvent, useRef, useState } from "react"
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
}

function extractInfoFromCircle(e: MouseEvent<SVGCircleElement>, x: number, y: number) {
  const i = Number(e.currentTarget.dataset.socketIndex)
  const dir = e.currentTarget.dataset.socketDirection
  const cx = e.currentTarget.cx.baseVal.value
  const cy = e.currentTarget.cy.baseVal.value
  // global coordinates
  const gx = x + cx
  const gy = y + cy
  return {
    i,
    dir: dir as SocketDirection,
    x: gx,
    y: gy,
  }
}

export function NodeBox({
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
}: Props) {
  const width = 150
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [imageValue, setImageValue] = useState<HTMLImageElement | null>(null)
  const onSocketMouseUpInternal: MouseEventHandler<SVGCircleElement> = (e) => {
    const info = extractInfoFromCircle(e, x, y)
    onSocketMouseUp(id, info.dir, info.i, info.x, info.y)
  }
  const onSocketMouseDownInternal: MouseEventHandler<SVGCircleElement> = (e) => {
    const info = extractInfoFromCircle(e, x, y)
    console.log(info)
    onSocketMouseDown(id, info.dir, info.i, info.x, info.y)
  }
  const onBoxMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    onDragStart(id, e.clientX, e.clientY)
  }
  const onFloatValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    onInNodeValueChange(id, index, { float: Number(e.currentTarget.value) })
  }
  const onKeyDownInFloatValueInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
  }
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
        width={1}
        height={1}
        className={classnames({
          [style.frame]: true,
          [style.selected]: selected,
        })}
      >
        <div className={style.box}
          onMouseDown={onBoxMouseDown}
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
                <div>{socket.label}</div>
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
      {inSockets.map((_, i) => (
        <circle
          key={i}
          data-socket-index={i}
          data-socket-direction="in"
          className={style.socket}
          cx={0}
          cy={78 + outSockets.length * 20 + (i - 1) * 20}
          r={4}
          onMouseDown={onSocketMouseDownInternal}
          onMouseUp={onSocketMouseUpInternal}
        />
      ))}
      {outSockets.map((_, i) => (
        <circle
          key={i}
          data-socket-index={i}
          data-socket-direction="out"
          className={style.socket}
          cx={width}
          cy={40 + i * 20}
          r={4}
          onMouseDown={onSocketMouseDownInternal}
          onMouseUp={onSocketMouseUpInternal}
        />
      ))}
    </g>
  )
}