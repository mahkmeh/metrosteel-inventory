import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface StatusWorkflowProps {
  currentStatus: string
  onStatusChange?: (newStatus: string) => void
}

const statusWorkflow = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
}

const statusLabels = {
  pending: "Pending",
  processing: "Processing", 
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
}

const statusColors = {
  pending: "secondary",
  processing: "outline",
  shipped: "default",
  delivered: "default", 
  completed: "default",
  cancelled: "destructive",
} as const

export function StatusWorkflow({ currentStatus, onStatusChange }: StatusWorkflowProps) {
  const allowedTransitions = statusWorkflow[currentStatus as keyof typeof statusWorkflow] || []

  if (allowedTransitions.length === 0) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium">Status Workflow</h4>
        <div className="flex items-center space-x-2">
          <Badge variant={statusColors[currentStatus as keyof typeof statusColors]}>
            {statusLabels[currentStatus as keyof typeof statusLabels]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentStatus === "completed" ? "Order is complete" : "No further transitions available"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Status Workflow</h4>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Badge variant={statusColors[currentStatus as keyof typeof statusColors]}>
            {statusLabels[currentStatus as keyof typeof statusLabels]}
          </Badge>
          <span className="text-sm text-muted-foreground">Current Status</span>
        </div>
        
        {allowedTransitions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Available transitions:</p>
            <div className="space-y-2">
              {allowedTransitions.map((nextStatus) => (
                <div key={nextStatus} className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {statusLabels[currentStatus as keyof typeof statusLabels]}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => onStatusChange?.(nextStatus)}
                  >
                    {statusLabels[nextStatus as keyof typeof statusLabels]}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}