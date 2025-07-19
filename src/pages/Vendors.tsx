import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Search, Phone, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("suppliers")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8" />
            Vendors
          </h1>
          <p className="text-muted-foreground">Manage supplier relationships and vendor information</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <Badge variant={supplier.is_active ? "default" : "secondary"}>
                    {supplier.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {supplier.contact_person && (
                  <CardDescription>Contact: {supplier.contact_person}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {supplier.email}
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}
                {supplier.gst_number && (
                  <div className="text-sm">
                    <span className="font-medium">GST:</span> {supplier.gst_number}
                  </div>
                )}
                {supplier.payment_terms && (
                  <div className="text-sm">
                    <span className="font-medium">Terms:</span> {supplier.payment_terms}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {suppliers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Vendors Found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "No vendors match your search criteria." : "Start by adding your first vendor."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Vendors;