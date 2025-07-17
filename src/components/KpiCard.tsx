import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  status: "critical" | "warning" | "good" | "info";
  icon: LucideIcon;
  actionLabel: string;
  onAction: () => void;
  details?: string;
}

export const KpiCard = ({ 
  title, 
  value, 
  subtitle, 
  status, 
  icon: Icon, 
  actionLabel, 
  onAction,
  details 
}: KpiCardProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "critical":
        return {
          border: "border-l-4 border-l-destructive border-t border-r border-b border-destructive/30",
          bg: "bg-destructive/5",
          text: "text-destructive",
          badge: "bg-destructive text-destructive-foreground"
        };
      case "warning":
        return {
          border: "border-l-4 border-l-yellow-500 border-t border-r border-b border-yellow-200 dark:border-yellow-800",
          bg: "bg-yellow-50 dark:bg-yellow-950/20",
          text: "text-yellow-600 dark:text-yellow-400",
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        };
      case "good":
        return {
          border: "border-l-4 border-l-green-500 border-t border-r border-b border-green-200 dark:border-green-800",
          bg: "bg-green-50 dark:bg-green-950/20",
          text: "text-green-600 dark:text-green-400",
          badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        };
      default:
        return {
          border: "border-l-4 border-l-blue-500 border-t border-r border-b border-blue-200 dark:border-blue-800",
          bg: "bg-blue-50 dark:bg-blue-950/20",
          text: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <Card className={`${styles.border} ${styles.bg} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-background/50 ${styles.text}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onAction}
            className="text-xs h-8 flex-1"
          >
            {actionLabel}
          </Button>
          <Badge variant="secondary" className={`text-xs ${styles.badge}`}>
            {status.toUpperCase()}
          </Badge>
        </div>
        
        {details && (
          <p className="text-xs text-muted-foreground italic">
            {details}
          </p>
        )}
      </CardContent>
    </Card>
  );
};