import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Package, Truck, Home } from "lucide-react"

interface OrderTimelineProps {
  status: string
  orderDate: string
  deliveryDate?: string
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
  { key: "completed", label: "Completed", icon: CheckCircle },
]

const statusOrder: { [key: string]: number } = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  completed: 4,
}

export function OrderTimeline({ status, orderDate, deliveryDate }: OrderTimelineProps) {
  const currentStatusIndex = statusOrder[status] ?? 0

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStatusIndex) return "completed"
    if (stepIndex === currentStatusIndex) return "current"
    return "upcoming"
  }

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case "completed":
        return "text-green-600 border-green-600 bg-green-50"
      case "current":
        return "text-blue-600 border-blue-600 bg-blue-50"
      default:
        return "text-muted-foreground border-border bg-muted"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Order Timeline</h4>
        <Badge variant={status === "completed" ? "default" : "secondary"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        {statusSteps.map((step, index) => {
          const stepStatus = getStepStatus(index)
          const Icon = step.icon
          
          return (
            <div key={step.key} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusColor(
                    stepStatus
                  )}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs text-center">
                  <div className="font-medium">{step.label}</div>
                  {stepStatus === "current" && index === 0 && (
                    <div className="text-muted-foreground">
                      {new Date(orderDate).toLocaleDateString()}
                    </div>
                  )}
                  {stepStatus === "current" && index === 3 && deliveryDate && (
                    <div className="text-muted-foreground">
                      {new Date(deliveryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              {index < statusSteps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 ${
                    stepStatus === "completed" ? "bg-green-600" : "bg-border"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}