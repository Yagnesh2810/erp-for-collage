"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextType {
  value: string[]
  onValueChange: (value: string[]) => void
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextType | null>(null)

const useAccordion = () => {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion")
  }
  return context
}

interface AccordionProps {
  type: "single" | "multiple"
  value?: string[]
  onValueChange?: (value: string[]) => void
  defaultValue?: string[]
  children: React.ReactNode
  className?: string
}

const Accordion = ({ 
  type, 
  value, 
  onValueChange, 
  defaultValue = [], 
  children, 
  className 
}: AccordionProps) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue)
  
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  
  const handleValueChange = React.useCallback((newValue: string[]) => {
    if (isControlled) {
      onValueChange?.(newValue)
    } else {
      setInternalValue(newValue)
    }
  }, [isControlled, onValueChange])

  return (
    <AccordionContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange, 
      type 
    }}>
      <div className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-b", className)}
      data-value={value}
      {...props}
    />
  )
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: openValues, onValueChange, type } = useAccordion()
    const isOpen = openValues.includes(value)
    
    const handleClick = () => {
      let newValue: string[]
      
      if (type === "single") {
        newValue = isOpen ? [] : [value]
      } else {
        newValue = isOpen 
          ? openValues.filter(v => v !== value)
          : [...openValues, value]
      }
      
      onValueChange(newValue)
    }

    return (
      <button
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick={handleClick}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: openValues } = useAccordion()
    const isOpen = openValues.includes(value)
    const contentRef = React.useRef<HTMLDivElement>(null)
    
    React.useEffect(() => {
      if (contentRef.current) {
        const element = contentRef.current
        if (isOpen) {
          element.style.setProperty('--accordion-content-height', `${element.scrollHeight}px`)
        } else {
          element.style.setProperty('--accordion-content-height', '0px')
        }
      }
    }, [isOpen])

    return (
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
          className
        )}
        data-state={isOpen ? "open" : "closed"}
        style={{
          height: isOpen ? 'var(--accordion-content-height)' : '0'
        }}
        {...props}
      >
        <div ref={ref} className="pb-4 pt-0">
          {children}
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }