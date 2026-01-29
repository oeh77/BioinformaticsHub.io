
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const AccordionContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  collapsible?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

// Simplified Single Accordion implementation
const Accordion = ({
  children,
  className,
  value: controlledValue,
  defaultValue,
  onValueChange,
  ...props
}: AccordionProps) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    const updatedValue = newValue === value ? "" : newValue;
    setUncontrolledValue(updatedValue);
    onValueChange?.(updatedValue);
  };

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    data-value={value}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value, onValueChange } = React.useContext(AccordionContext);
  // Find the parent item value
  // In a real radix implementation this is done via context but here we cheat a bit or need a wrapper
  // For simplicity, we assume AccordionItem wraps this and we need to pass the value down manually or use a context for Item
  // To keep it simple without too much Context nesting:
  // We will actually need an ItemContext to know "who am I"
  return (
    <ItemContext.Consumer>
      {(itemValue) => (
        <div className="flex">
          <button
            ref={ref}
            onClick={() => onValueChange?.(itemValue || "")}
            className={cn(
              "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
              className
            )}
            data-state={value === itemValue ? "open" : "closed"}
            {...props}
          >
            {children}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </button>
        </div>
      )}
    </ItemContext.Consumer>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { value } = React.useContext(AccordionContext);
  
  return (
    <ItemContext.Consumer>
      {(itemValue) => {
        const isOpen = value === itemValue;
        return (
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  ref={ref}
                  className={cn("pb-4 pt-0", className)}
                  {...props}
                >
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      }}
    </ItemContext.Consumer>
  );
});
AccordionContent.displayName = "AccordionContent";

// Helper context for Item
const ItemContext = React.createContext<string>("");

// Re-wrap AccordionItem to provide context
const AccordionItemWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ value, children, ...props }, ref) => (
  <ItemContext.Provider value={value}>
    <AccordionItem ref={ref} value={value} {...props}>
      {children}
    </AccordionItem>
  </ItemContext.Provider>
));
AccordionItemWrapper.displayName = "AccordionItem";

export { Accordion, AccordionItemWrapper as AccordionItem, AccordionTrigger, AccordionContent };
