import { useEffect, useMemo, useRef } from "react"
import { ShaderPreview } from "./ShaderPreview";
import style from "./style.module.scss"


export function Preview() {
  const frameRef = useRef<HTMLDivElement>(null)
  const preview = useMemo(() => {
    return new ShaderPreview()
  }, [])
  useEffect(() => {
    if (frameRef.current) {
      preview.start()
      frameRef.current.appendChild(preview.getCanvas())
    }
  }, [frameRef.current])
  return (
    <div
      ref={frameRef}
      className={style.frame}
    >
    </div>
  )
}