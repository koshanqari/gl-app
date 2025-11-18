import * as React from "react"

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block text-left">{children}</div>
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = ({
  children,
  align = "end",
  className = "",
}: {
  children: React.ReactNode
  align?: "start" | "end"
  className?: string
}) => {
  return (
    <div
      className={`absolute ${
        align === "end" ? "right-0" : "left-0"
      } mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 ${className}`}
    >
      <div className="py-1" role="menu">
        {children}
      </div>
    </div>
  )
}

const DropdownMenuItem = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) => {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center ${className}`}
      onClick={onClick}
      role="menuitem"
    >
      {children}
    </button>
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }

