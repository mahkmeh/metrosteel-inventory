import { Package, Warehouse, Users, FileText, ShoppingCart, BarChart3, Moon, Sun, Monitor, Truck, Wrench, Receipt, Building, RotateCcw, CreditCard, ChevronDown, MessageCircle, Phone, Calendar } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useTheme } from "@/hooks/use-theme"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

const navigation = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Master Calendar", url: "/calendar", icon: Calendar },
  { title: "Materials", url: "/materials", icon: Package },
]

const leadsNavigation = [
  { title: "Quotations", url: "/leads/quotations", icon: FileText },
  { title: "WhatsApp Chat", url: "/leads/whatsapp", icon: MessageCircle },
  { title: "Phone Calls", url: "/leads/calls", icon: Phone },
]

const salesNavigation = [
  { title: "Sales Order", url: "/sales/orders", icon: ShoppingCart },
  { title: "Sales Invoice", url: "/sales/invoice", icon: Receipt },
  { title: "Customers", url: "/sales/customers", icon: Users },
  { title: "Sales Return", url: "/sales/returns", icon: RotateCcw },
  { title: "Receivables", url: "/sales/receivables", icon: CreditCard },
]

const purchaseNavigation = [
  { title: "Purchase Order", url: "/purchase", icon: Truck },
  { title: "Purchase Invoice", url: "/purchase/invoice", icon: Receipt },
  { title: "Vendors", url: "/vendors", icon: Building },
  { title: "Purchase Return", url: "/purchase/returns", icon: RotateCcw },
  { title: "Payables", url: "/purchase/payables", icon: CreditCard },
]

const jobWorkNavigation = [
  { title: "Inward", url: "/jobwork/inward", icon: Package },
  { title: "Outward", url: "/jobwork/outward", icon: Truck },
  { title: "Contractors", url: "/jobwork/contractors", icon: Users },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [salesExpanded, setSalesExpanded] = useState(
    location.pathname.startsWith("/sales")
  )
  const [leadsExpanded, setLeadsExpanded] = useState(
    location.pathname.startsWith("/leads")
  )
  const [purchaseExpanded, setPurchaseExpanded] = useState(
    location.pathname.startsWith("/purchase")
  )
  const [jobWorkExpanded, setJobWorkExpanded] = useState(
    location.pathname.startsWith("/jobwork")
  )
  
  const isActive = (path: string) => location.pathname === path
  const isSalesActive = location.pathname.startsWith("/sales")
  const isLeadsActive = location.pathname.startsWith("/leads")
  const isPurchaseActive = location.pathname.startsWith("/purchase")
  const isJobWorkActive = location.pathname.startsWith("/jobwork")
  const collapsed = state === "collapsed"

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-2">
          {!collapsed && (
            <h1 className="text-lg font-bold text-sidebar-foreground">METRO STEEL</h1>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Leads Module */}
        <SidebarGroup>
          <Collapsible 
            open={leadsExpanded} 
            onOpenChange={setLeadsExpanded}
            className="w-full"
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <span>LEADS</span>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${leadsExpanded ? 'rotate-180' : ''}`} />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {leadsNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} className="pl-6">
                        <NavLink to={item.url} end>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Sales Module */}
        <SidebarGroup>
          <Collapsible 
            open={salesExpanded} 
            onOpenChange={setSalesExpanded}
            className="w-full"
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <span>SALES</span>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${salesExpanded ? 'rotate-180' : ''}`} />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {salesNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} className="pl-6">
                        <NavLink to={item.url} end>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Job Work Module */}
        <SidebarGroup>
          <Collapsible 
            open={jobWorkExpanded} 
            onOpenChange={setJobWorkExpanded}
            className="w-full"
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <span>JOB WORK</span>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${jobWorkExpanded ? 'rotate-180' : ''}`} />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {jobWorkNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} className="pl-6">
                        <NavLink to={item.url} end>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Purchase Module */}
        <SidebarGroup>
          <Collapsible 
            open={purchaseExpanded} 
            onOpenChange={setPurchaseExpanded}
            className="w-full"
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                <span>PURCHASE</span>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${purchaseExpanded ? 'rotate-180' : ''}`} />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {purchaseNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} className="pl-6">
                        <NavLink to={item.url} end>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
