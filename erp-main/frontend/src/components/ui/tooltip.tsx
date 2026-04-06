"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface TooltipContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextType | null>(null)

const useTooltip = () => {
  const context = React.useContext(TooltipContext)
  if (!context) {
    throw new Error("Tooltip components must be used within a Tooltip")
  }
  return context
}

const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)

interface TooltipProps {
  children: React.ReactNode
  delayDuration?: number
}

const Tooltip = ({ children, delayDuration = 700 }: TooltipProps) => {
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const onOpenChange = React.useCallback((newOpen: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (newOpen) {
      timeoutRef.current = setTimeout(() => {
        setOpen(true)
      }, delayDuration)
    } else {
      setOpen(false)
    }
  }, [delayDuration])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <TooltipContext.Provider value={{ open, onOpenChange }}>
      {children}
    </TooltipContext.Provider>
  )
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ className, asChild = false, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const { onOpenChange } = useTooltip()

    const handleMouseEnter = (e: React.MouseEvent) => {
      onOpenChange(true)
      onMouseEnter?.(e as any)
    }

    const handleMouseLeave = (e: React.MouseEvent) => {
      onOpenChange(false)
      onMouseLeave?.(e as any)
    }

    if (asChild) {
      return React.cloneElement(
        React.Children.only(props.children as React.ReactElement<any>),
        {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          ref,
          ...props
        }
      )
    }

    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => {
    const { open } = useTooltip()

    if (!open) return null

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />,
      document.body
    )
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }