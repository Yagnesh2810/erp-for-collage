"use client"

import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadioGroupContextType {
  value: string
  onValueChange: (value: string) => void
  name: string
}

const RadioGroupContext = React.createContext<RadioGroupContextType | null>(null)

const useRadioGroup = () => {
  const context = React.useContext(RadioGroupContext)
  if (!context) {
    throw new Error("RadioGroup components must be used within a RadioGroup")
  }
  return context
}

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  name?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue = "", name, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const groupName = name || React.useId()
    
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue
    
    const handleValueChange = React.useCallback((newValue: string) => {
      if (isControlled) {
        onValueChange?.(newValue)
      } else {
        setInternalValue(newValue)
      }
    }, [isControlled, onValueChange])

    return (
      <RadioGroupContext.Provider value={{ 
        value: currentValue, 
        onValueChange: handleValueChange,
        name: groupName
      }}>
        <div
          className={cn("grid gap-2", className)}
          {...props}
          ref={ref}
        />
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'name'> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const { value: groupValue, onValueChange, name } = useRadioGroup()
    const isChecked = groupValue === value

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        onValueChange(value)
      }
      onChange?.(e)
    }

    return (
      <div className="relative">
        <input
          type="radio"
          className="sr-only"
          ref={ref}
          name={name}
          value={value}
          checked={isChecked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onClick={() => onValueChange(value)}
        >
          {isChecked && (
            <div className="flex items-center justify-center">
              <Circle className="h-3.5 w-3.5 fill-primary" />
            </div>
          )}
        </div>
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }