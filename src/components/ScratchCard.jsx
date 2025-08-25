'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Interactive scratch card component
 * @param {{
 *   width?: number,
 *   height?: number,
 *   brushSize?: number,
 *   revealedContent: React.ReactNode,
 *   onReveal?: (percentage: number) => void,
 *   className?: string
 * }} props
 */
export default function ScratchCard({
  width = 300,
  height = 200,
  brushSize = 20,
  revealedContent,
  onReveal,
  className = ''
}) {
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [revealPercentage, setRevealPercentage] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Create gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#4F46E5')
    gradient.addColorStop(0.5, '#7C3AED')
    gradient.addColorStop(1, '#EC4899')

    // Fill canvas with gradient
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add "scratch to reveal" text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🎯 Scratch to Reveal', width / 2, height / 2 - 10)
    ctx.fillText('Match Details', width / 2, height / 2 + 15)

    // Add scratching cursor
    canvas.style.cursor = 'grab'
  }, [width, height])

  const calculateRevealPercentage = () => {
    const canvas = canvasRef.current
    if (!canvas) return 0

    const ctx = canvas.getContext('2d')
    if (!ctx) return 0

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparentPixels = 0

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) { // Alpha channel less than 50%
        transparentPixels++
      }
    }

    const totalPixels = canvas.width * canvas.height
    const percentage = (transparentPixels / totalPixels) * 100
    
    return Math.min(100, Math.max(0, percentage))
  }

  const scratch = (e) => {
    const canvas = canvasRef.current
    if (!canvas || !isDrawingRef.current) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if (e.touches) {
      x = e.touches.clientX - rect.left
      y = e.touches.clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    // Set composite operation to "destination-out" for erasing
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI)
    ctx.fill()

    // Calculate reveal percentage
    const percentage = calculateRevealPercentage()
    setRevealPercentage(percentage)
    
    if (onReveal) {
      onReveal(percentage)
    }

    // Auto-reveal if more than 60% is scratched
    if (percentage > 60 && !isRevealed) {
      setIsRevealed(true)
      // Clear the entire canvas with animation
      setTimeout(() => {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }, 300)
    }
  }

  const handleMouseDown = (e) => {
    isDrawingRef.current = true
    scratch(e)
  }

  const handleMouseMove = (e) => {
    if (isDrawingRef.current) {
      scratch(e)
    }
  }

  const handleMouseUp = () => {
    isDrawingRef.current = false
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    isDrawingRef.current = true
    scratch(e)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (isDrawingRef.current) {
      scratch(e)
    }
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    isDrawingRef.current = false
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {/* Background content */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        {revealedContent}
      </div>

      {/* Scratch overlay */}
      <motion.canvas
        ref={canvasRef}
        className="absolute inset-0 rounded-lg cursor-grab active:cursor-grabbing"
        style={{
          width: '100%',
          height: '100%',
          zIndex: isRevealed ? -1 : 10
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        animate={{
          opacity: isRevealed ? 0 : 1
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Progress indicator */}
      {revealPercentage > 0 && revealPercentage < 60 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium"
        >
          {Math.round(revealPercentage)}%
        </motion.div>
      )}
    </motion.div>
  )
}
