import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Package, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const JobWork = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "outward" | "inward">("dashboard");
  const [outwardForm, setOutwardForm] = useState({
    challanNumber: "",
    contractorName: "",
    contractorAddress: "",
    concernedPerson: "",
    contactNumber: "",
    expectedDelivery: undefined as Date | undefined,
    isForCustomerOrder: false,
    salesOrderId: "",
    woodPallet: false,
    paletteCount: 0,
    items: [{
      materialId: "",
      sku: "",
      batchNumber: "",
      quantity: 0,
      currentStock: 0,
      basePrice: 0,
      jobworkDetails: ""
    }]
  });

  const [inwardForm, setInwardForm] = useState({
    outwardChallanNumber: "",
    vendorInvoiceNumber: "",
    items: [{
      originalSku: "",
      newQuantity: 0,
      newSku: "",
      newBatchNumber: "",
      qualityChecked: false,
      newBasePrice: 0,
      wastageQuantity: 0,
      scrapQuantity: 0
    }]
  });

  const addOutwardItem = () => {
    setOutwardForm(prev => ({
      ...prev,
      items: [...prev.items, {
        materialId: "",
        sku: "",
        batchNumber: "",
        quantity: 0,
        currentStock: 0,
        basePrice: 0,
        jobworkDetails: ""
      }]
    }));
  };

  const addInwardItem = () => {
    setInwardForm(prev => ({
      ...prev,
      items: [...prev.items, {
        originalSku: "",
        newQuantity: 0,
        newSku: "",
        newBatchNumber: "",
        qualityChecked: false,
        newBasePrice: 0,
        wastageQuantity: 0,
        scrapQuantity: 0
      }]
    }));
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Work Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView("outward")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Outward Job Work
            </CardTitle>
            <CardDescription>
              Send materials to contractors for processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setActiveView("outward")}>
              Create Outward Entry
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView("inward")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-primary" />
              Inward Job Work
            </CardTitle>
            <CardDescription>
              Receive processed materials from contractors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setActiveView("inward")}>
              Create Inward Entry
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOutwardForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Outward Job Work</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="challan">Delivery Challan Number</Label>
              <Input
                id="challan"
                value={outwardForm.challanNumber}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, challanNumber: e.target.value }))}
                placeholder="Enter challan number"
              />
            </div>
            
            <div>
              <Label htmlFor="contractor">Contractor Name</Label>
              <Input
                id="contractor"
                value={outwardForm.contractorName}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, contractorName: e.target.value }))}
                placeholder="Enter contractor name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Contractor Address</Label>
            <Textarea
              id="address"
              value={outwardForm.contractorAddress}
              onChange={(e) => setOutwardForm(prev => ({ ...prev, contractorAddress: e.target.value }))}
              placeholder="Enter contractor address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="person">Concerned Person</Label>
              <Input
                id="person"
                value={outwardForm.concernedPerson}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, concernedPerson: e.target.value }))}
                placeholder="Enter concerned person name"
              />
            </div>
            
            <div>
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                value={outwardForm.contactNumber}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="Enter contact number"
              />
            </div>
          </div>

          <div>
            <Label>Expected Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !outwardForm.expectedDelivery && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {outwardForm.expectedDelivery ? (
                    format(outwardForm.expectedDelivery, "PPP")
                  ) : (
                    <span>Pick expected delivery date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={outwardForm.expectedDelivery}
                  onSelect={(date) => setOutwardForm(prev => ({ ...prev, expectedDelivery: date }))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="customerOrder"
                checked={outwardForm.isForCustomerOrder}
                onCheckedChange={(checked) => setOutwardForm(prev => ({ ...prev, isForCustomerOrder: !!checked }))}
              />
              <Label htmlFor="customerOrder">Is this for customer's order?</Label>
            </div>

            {outwardForm.isForCustomerOrder && (
              <div>
                <Label htmlFor="salesOrder">Link to Sales Order</Label>
                <Select
                  value={outwardForm.salesOrderId}
                  onValueChange={(value) => setOutwardForm(prev => ({ ...prev, salesOrderId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SO001">SO001 - Customer A</SelectItem>
                    <SelectItem value="SO002">SO002 - Customer B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="woodPallet"
                  checked={outwardForm.woodPallet}
                  onCheckedChange={(checked) => setOutwardForm(prev => ({ ...prev, woodPallet: !!checked }))}
                />
                <Label htmlFor="woodPallet">Did you send wood pallet?</Label>
              </div>

              {outwardForm.woodPallet && (
                <div>
                  <Label htmlFor="paletteCount">Number of Pallets</Label>
                  <Input
                    id="paletteCount"
                    type="number"
                    value={outwardForm.paletteCount}
                    onChange={(e) => setOutwardForm(prev => ({ ...prev, paletteCount: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter number of pallets"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Material Details</CardTitle>
        </CardHeader>
        <CardContent>
          {outwardForm.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
              <h4 className="font-semibold">Item {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={item.sku}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].sku = e.target.value;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter SKU"
                  />
                </div>
                
                <div>
                  <Label>Batch Number</Label>
                  <Input
                    value={item.batchNumber}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].batchNumber = e.target.value;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter batch number"
                  />
                </div>
                
                <div>
                  <Label>Quantity (Current Stock: {item.currentStock})</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].quantity = parseFloat(e.target.value) || 0;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Base Price</Label>
                  <Input
                    type="number"
                    value={item.basePrice}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].basePrice = parseFloat(e.target.value) || 0;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Base price"
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label>Job Work Details</Label>
                  <Input
                    value={item.jobworkDetails}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].jobworkDetails = e.target.value;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter job work details"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button type="button" variant="outline" onClick={addOutwardItem}>
            Add Another Item
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setActiveView("dashboard")}>
          Cancel
        </Button>
        <Button>
          Submit Outward Entry
        </Button>
      </div>
    </div>
  );

  const renderInwardForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Inward Job Work</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reference Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="outwardChallan">Our Delivery Challan Number</Label>
              <Select
                value={inwardForm.outwardChallanNumber}
                onValueChange={(value) => setInwardForm(prev => ({ ...prev, outwardChallanNumber: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outward challan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CH001">CH001 - Contractor A</SelectItem>
                  <SelectItem value="CH002">CH002 - Contractor B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="vendorInvoice">Vendor's Invoice Number</Label>
              <Input
                id="vendorInvoice"
                value={inwardForm.vendorInvoiceNumber}
                onChange={(e) => setInwardForm(prev => ({ ...prev, vendorInvoiceNumber: e.target.value }))}
                placeholder="Enter vendor invoice number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Received Items</CardTitle>
        </CardHeader>
        <CardContent>
          {inwardForm.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
              <h4 className="font-semibold">Item {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Original SKU</Label>
                  <Input
                    value={item.originalSku}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].originalSku = e.target.value;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Original SKU"
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label>New Quantity Received</Label>
                  <Input
                    type="number"
                    value={item.newQuantity}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].newQuantity = parseFloat(e.target.value) || 0;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter received quantity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>New SKU</Label>
                  <Input
                    value={item.newSku}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].newSku = e.target.value;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter new SKU"
                  />
                </div>
                
                <div>
                  <Label>New Batch Number</Label>
                  <Input
                    value={item.newBatchNumber}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].newBatchNumber = e.target.value;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter new batch number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>New Base Price</Label>
                  <Input
                    type="number"
                    value={item.newBasePrice}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].newBasePrice = parseFloat(e.target.value) || 0;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter new base price"
                  />
                </div>
                
                <div>
                  <Label>Wastage Quantity</Label>
                  <Input
                    type="number"
                    value={item.wastageQuantity}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].wastageQuantity = parseFloat(e.target.value) || 0;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Wastage quantity"
                  />
                </div>
                
                <div>
                  <Label>Scrap Quantity</Label>
                  <Input
                    type="number"
                    value={item.scrapQuantity}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].scrapQuantity = parseFloat(e.target.value) || 0;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Scrap quantity"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`quality-${index}`}
                  checked={item.qualityChecked}
                  onCheckedChange={(checked) => {
                    const newItems = [...inwardForm.items];
                    newItems[index].qualityChecked = !!checked;
                    setInwardForm(prev => ({ ...prev, items: newItems }));
                  }}
                />
                <Label htmlFor={`quality-${index}`}>Quality Checked</Label>
              </div>
            </div>
          ))}
          
          <Button type="button" variant="outline" onClick={addInwardItem}>
            Add Another Item
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setActiveView("dashboard")}>
          Cancel
        </Button>
        <Button>
          Submit Inward Entry & Update Inventory
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {activeView === "dashboard" && renderDashboard()}
      {activeView === "outward" && renderOutwardForm()}
      {activeView === "inward" && renderInwardForm()}
    </div>
  );
};

export default JobWork;