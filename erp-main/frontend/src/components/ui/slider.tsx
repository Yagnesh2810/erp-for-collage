"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    className, 
    value, 
    onValueChange, 
    defaultValue = [0], 
    min = 0, 
    max = 100, 
    step = 1,
    disabled = false,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue
    const sliderValue = currentValue[0] || 0
    
    const handleValueChange = React.useCallback((newValue: number[]) => {
      if (isControlled) {
        onValueChange?.(newValue)
      } else {
        setInternalValue(newValue)
      }
    }, [isControlled, onValueChange])

    const getValueFromPosition = React.useCallback((clientX: number) => {
      if (!sliderRef.current) return sliderValue
      
      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, steppedValue))
    }, [min, max, step, sliderValue])

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
      if (disabled) return
      
      setIsDragging(true)
      const newValue = getValueFromPosition(e.clientX)
      handleValueChange([newValue])
    }, [disabled, getValueFromPosition, handleValueChange])

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
      if (!isDragging || disabled) return
      
      const newValue = getValueFromPosition(e.clientX)
      handleValueChange([newValue])
    }, [isDragging, disabled, getValueFromPosition, handleValueChange])

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(false)
    }, [])

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    const percentage = ((sliderValue - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20 cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          <div 
            className="absolute h-full bg-primary" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          style={{ 
            position: 'absolute',
            left: `calc(${percentage}% - 8px)`,
            pointerEvents: disabled ? 'none' : 'auto'
          }}
          onMouseDown={handleMouseDown}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }