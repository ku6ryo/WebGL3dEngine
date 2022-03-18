import { useCallback, useMemo, useState } from "react"
import style from "./style.module.scss"
import {
  MdKeyboardArrowRight as RightArrowIcon,
  MdKeyboardArrowLeft as LeftArrowIcon
} from "react-icons/md"
import classNames from "classnames"


type Props = {
  label?: string
}

export function FloatInput({
  label,
}: Props) {
  const [typing, setTyping] = useState(false)
  const [value, setValue] = useState(0)
  const [operatingGuage, setOperatingGuage] = useState(false)
  const onArrowClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = Number(e.currentTarget.dataset.value)
    setValue(value + v)
  }, [value])
  const valueStr = useMemo(() => {
    return value.toFixed(3)
  }, [value])
  const onMouseDownGuage = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setOperatingGuage(true)
  }, [])
  const onMouseUpGuage = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setOperatingGuage(false)
  }, [])
  const onMouseMoveGuage = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (operatingGuage && e.button === 0) {
      setValue(value + Math.sign(e.movementX) * 0.1)
    }
  }, [value, operatingGuage])
  const onMouseLeaveGuage = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setOperatingGuage(false)
  }, [])
  return (
    <div className={style.frame}>
      {!typing && (
        <div
          className={style.guage}
          onMouseMove={onMouseMoveGuage}
          onMouseLeave={onMouseLeaveGuage}
          onMouseUp={onMouseUpGuage}
        >
          <div
            className={classNames(style.arrow, style.left)}
            data-value={-0.1}
            onClick={onArrowClick}
          >
            <LeftArrowIcon />
          </div>
          <div
            className={style.text}
            onMouseDown={onMouseDownGuage}
          >
            <span>{label}</span>
            <span>{valueStr}</span>
          </div>
          <div
            className={classNames(style.arrow, style.right)}
            data-value={0.1}
            onClick={onArrowClick}
          >
            <RightArrowIcon />
          </div>
        </div>
      )}
      {typing && (
        <div>
          <input value={value}/>
        </div>
      )}
    </div>
  )
}