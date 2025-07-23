import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Receivables() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receivables</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Under Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The Receivables module is currently being set up. Database tables have been created 
            and will be available after the next deployment. This page will be fully functional 
            once the database types are updated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}