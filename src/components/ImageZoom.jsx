import { useState, useRef, useEffect, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize2, X, RotateCcw } from 'lucide-react'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5

export default function ImageZoom({ src, alt, className = '' }) {
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const containerRef = useRef(null)
  const dragStart = useRef(null)
  const lastTouchDist = useRef(null)
  const lastZoom = useRef(1)

  // ── Clamp position within bounds ──────────────────────────
  const clampPos = useCallback((x, y, currentZoom, container) => {
    if (!container || currentZoom <= 1) return { x: 0, y: 0 }
    const maxX = (container.offsetWidth  * (currentZoom - 1)) / 2
    const maxY = (container.offsetHeight * (currentZoom - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }, [])

  // ── Reset ─────────────────────────────────────────────────
  const reset = () => {
    setIsTransitioning(true)
    setZoom(1)
    setPos({ x: 0, y: 0 })
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // ── Click to zoom in/out ───────────────────────────────────
  const handleClick = (e) => {
    if (isDragging) return
    setIsTransitioning(true)
    const newZoom = zoom >= 2 ? 1 : 2
    setZoom(newZoom)
    if (newZoom === 1) setPos({ x: 0, y: 0 })
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // ── Mouse wheel zoom ───────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    setZoom(prev => {
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta))
      if (next === 1) setPos({ x: 0, y: 0 })
      else {
        setPos(p => clampPos(p.x, p.y, next, containerRef.current))
      }
      return next
    })
  }, [clampPos])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // ── Mouse drag ─────────────────────────────────────────────
  const handleMouseDown = (e) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my
    const clamped = clampPos(
      dragStart.current.px + dx,
      dragStart.current.py + dy,
      zoom, containerRef.current
    )
    setPos(clamped)
  }, [isDragging, zoom, clampPos])

  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove])

  // ── Touch pinch-to-zoom + drag ─────────────────────────────
  const getTouchDist = (touches) =>
    Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      lastTouchDist.current = getTouchDist(e.touches)
      lastZoom.current = zoom
    } else if (e.touches.length === 1 && zoom > 1) {
      dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, px: pos.x, py: pos.y }
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 2 && lastTouchDist.current) {
      const dist = getTouchDist(e.touches)
      const scale = dist / lastTouchDist.current
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, lastZoom.current * scale))
      setZoom(next)
      if (next === 1) setPos({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && dragStart.current && zoom > 1) {
      const dx = e.touches[0].clientX - dragStart.current.mx
      const dy = e.touches[0].clientY - dragStart.current.my
      setPos(clampPos(dragStart.current.px + dx, dragStart.current.py + dy, zoom, containerRef.current))
    }
  }

  const handleTouchEnd = () => {
    lastTouchDist.current = null
    dragStart.current = null
  }

  // ── Zoom buttons ───────────────────────────────────────────
  const zoomIn  = () => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(1))))
  const zoomOut = () => {
    const next = Math.max(MIN_ZOOM, parseFloat((zoom - ZOOM_STEP).toFixed(1)))
    setZoom(next)
    if (next <= 1) setPos({ x: 0, y: 0 })
  }

  // ── Shared image style ─────────────────────────────────────
  const imgStyle = {
    transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
    transition: isTransitioning ? 'transform 0.3s ease' : isDragging ? 'none' : 'transform 0.15s ease-out',
    transformOrigin: 'center center',
    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  }

  const ImageContent = ({ inFullscreen = false }) => (
    <div
      ref={inFullscreen ? null : containerRef}
      className={`relative overflow-hidden ${inFullscreen ? 'w-full h-full' : `${className} rounded-2xl`} select-none`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={src}
        alt={alt}
        style={imgStyle}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
        onError={e => e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'}
      />

      {/* Zoom controls overlay */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-xl px-2 py-1.5">
          <button onClick={zoomOut} disabled={zoom <= 1}
            className="p-1 text-white hover:text-yellow-400 disabled:opacity-30 transition-colors" title="Zoom Out">
            <ZoomOut size={14} />
          </button>
          <span className="text-white text-xs font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM}
            className="p-1 text-white hover:text-yellow-400 disabled:opacity-30 transition-colors" title="Zoom In">
            <ZoomIn size={14} />
          </button>
          {zoom > 1 && (
            <button onClick={reset} className="p-1 text-white hover:text-yellow-400 transition-colors" title="Reset">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
        {!inFullscreen && (
          <button onClick={() => setIsFullscreen(true)}
            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-xl text-white hover:text-yellow-400 transition-colors" title="Fullscreen">
            <Maximize2 size={14} />
          </button>
        )}
      </div>

      {/* Hint */}
      {zoom === 1 && !inFullscreen && (
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg pointer-events-none">
          🔍 Click or scroll to zoom
        </div>
      )}
    </div>
  )

  return (
    <>
      <ImageContent />

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}>
          <button onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
            <X size={22} />
          </button>
          <div className="w-full h-full max-w-4xl max-h-[90vh] mx-auto p-4"
            onClick={e => e.stopPropagation()}>
            <ImageContent inFullscreen />
          </div>
        </div>
      )}
    </>
  )
}
