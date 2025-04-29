import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import { useWebSocket } from "@/data/WebSocketContext";
import {
  Users,
  Server,
  Bell,
  Lock,
  Network,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  AlertTriangle,
  PlusCircle,
  HardDrive,
  Trash2,
  Activity,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// define all menu items with their required permissions
const allMenuItems = [
  {
    title: "Display",
    items: [
      {
        title: "Systems Overview",
        icon: Network,
        href: "/display/systems",
        permission: "view:systems"
      },
      {
        title: "Node Overview",
        icon: HardDrive,
        href: "/nodes",
        permission: "view:systems"
      },
    ],
  },
  // {
  //   title: "Configuration",
  //   items: [
  //     {
  //       title: "System Config",
  //       icon: Settings,
  //       href: "/config/systems",
  //       permission: "config:systems"
  //     },
  //     {
  //       title: "Config Profiles",
  //       icon: FileText,
  //       href: "/config/profiles",
  //       permission: "config:profiles"
  //     },
  //     {
  //       title: "Container Image Config",
  //       icon: Container,
  //       href: "/config/containers",
  //       permission: "config:containers"
  //     }
  //   ],
  // },
  {
    title: "Management",
    items: [
      {
        title: "User Management",
        icon: Users,
        href: "/users",
        permission: "admin:users"
      },
      {
        title: "Access Management",
        icon: Lock,
        href: "/access",
        permission: "admin:access"
      },
      {
        title: "Abra Logs",
        icon: ScrollText,
        href: "/audit",
        permission: "admin:audit"
      },
      {
        title: "Alert Configuration",
        icon: Bell,
        href: "/alerts",
        permission: "admin:audit"
      },
      {
        title: "Connection Strings",
        icon: LinkIcon,
        href: "/conn-strs",
        permission: "admin:audit"
      }
    ],
  },
  {
    title: "Debug",
    items: [
      {
        title: "WebSocket Debug",
        icon: Server,
        href: "/debug/websocket",
        permission: "admin:debug"
      }
    ]
  }
];

// Node sidebar component
export function NodeSidebar() {
  const [collapsed, setCollapsed] = useState(true);  // Default to collapsed for better UI when dual sidebars
  const [addNodeDialogOpen, setAddNodeDialogOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeIp, setNewNodeIp] = useState("");
  const location = useLocation();
  const { data, isConnected } = useWebSocket();

  // Get all nodes from WebSocketContext
  const nodes = data?.nodes || [];

  const handleAddNode = () => {
    // This would connect to an actual API in the final implementation
    console.log("Adding node:", { name: newNodeName, ip: newNodeIp });
    setAddNodeDialogOpen(false);
    setNewNodeName("");
    setNewNodeIp("");
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-14" : "w-52" // Smaller width for secondary sidebar
      )}
    >
      <div className="flex items-center justify-between p-2 border-b border-border">
        <h2 className={cn("text-xs font-semibold", collapsed && "sr-only")}>Nodes</h2>
        <div className="flex items-center">
          <Dialog open={addNodeDialogOpen} onOpenChange={setAddNodeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 mr-1">
                <PlusCircle className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Node</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nodeName">Node Name</Label>
                  <Input 
                    id="nodeName" 
                    value={newNodeName} 
                    onChange={(e) => setNewNodeName(e.target.value)} 
                    placeholder="Enter node name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nodeIp">IP Address</Label>
                  <Input 
                    id="nodeIp" 
                    value={newNodeIp} 
                    onChange={(e) => setNewNodeIp(e.target.value)} 
                    placeholder="Enter IP address"
                  />
                </div>
              </div>
              <Button onClick={handleAddNode}>Add Node</Button>
            </DialogContent>
          </Dialog>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-accent rounded-lg"
          >
            {collapsed ? (
              <ChevronLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {!isConnected ? (
          <div className={cn("flex flex-col items-center text-center p-2 text-xs text-muted-foreground",
                         collapsed && "hidden")}>
            <Activity className="h-5 w-5 mb-1 text-amber-500 animate-pulse" />
            <p className="text-xs">Connecting...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className={cn("flex flex-col items-center text-center p-2 text-xs text-muted-foreground",
                         collapsed && "hidden")}>
            <AlertTriangle className="h-5 w-5 mb-1 text-amber-500" />
            <p className="text-xs">No nodes</p>
          </div>
        ) : (
          <div className="space-y-1">
            {nodes.map((node) => {
              const nodeStatus = node.mem_percent > 90 ? 'error' : 
                            node.mem_percent > 75 ? 'warning' : 'healthy';
              const statusColor = nodeStatus === 'error' ? 'text-red-500' : 
                               nodeStatus === 'warning' ? 'text-yellow-500' : 
                               'text-green-500';
              
              return (
                <div key={node.node_id} className="mb-1.5">
                  <Link
                    to={`/nodes/${node.node_id}`}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors",
                      location.pathname === `/nodes/${node.node_id}` 
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3.5 w-3.5" />
                      <span className={cn("transition-all duration-300 text-xs", collapsed && "hidden")}>
                        {node.node_id}
                      </span>
                      {!collapsed && (
                        <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></div>
                      )}
                    </div>
                    
                    {!collapsed && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Remove node:", node.node_id);
                        }}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    )}
                  </Link>
                  
                  {!collapsed && (
                    <div className="px-2 text-xs text-muted-foreground mt-0.5">
                      <div className="flex justify-between text-xs">
                        <span>Containers:</span>
                        <span>{node.num_containers}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Memory:</span>
                        <span>{node.mem_percent.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
}

export function RBACNavigationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasPermission, permissions, checkingPermissions } = useAuth();

  // filter menu items based on user permissions
  const filterMenuItems = () => {
    if (!permissions) return [];
    
    // if user has admin:all permission, show everything
    const hasAdminAll = permissions.permissions.includes("admin:all");
    
    return allMenuItems.map(section => {
      // filter items in this section based on permissions
      const filteredItems = section.items.filter(item => 
        hasAdminAll || !item.permission || hasPermission(item.permission)
      );
      
      // only return sections that have at least one visible item
      return filteredItems.length > 0 
        ? { ...section, items: filteredItems } 
        : null;
    }).filter(Boolean);
  };

  const menuItems = filterMenuItems();

  if (checkingPermissions) {
    return (
      <div className="flex flex-col border-r border-border bg-card transition-all duration-300 w-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm mt-2">Loading navigation...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link to="/display/systems" className="padding-2">
          <h1
            className={cn("font-bold transition-all duration-300", collapsed ? "scale-0 w-0" : "scale-100")}>
            Admin Dashboard
          </h1>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-accent rounded-lg"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {menuItems.length === 0 ? (
          <div className={cn("flex flex-col items-center text-center p-4 text-sm text-muted-foreground",
                           collapsed && "hidden")}>
            <AlertTriangle className="h-8 w-8 mb-2 text-amber-500" />
            <p>No accessible navigation items</p>
          </div>
        ) : (
          menuItems.map((section) => (
            <div key={section.title} className="mb-4">
              <h2
                className={cn(
                  "text-sm font-semibold text-muted-foreground mb-2 px-2",
                  collapsed && "sr-only"
                )}
              >
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors",
                      location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50",
                      collapsed && "justify-center"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span
                      className={cn(
                        "transition-all duration-300",
                        collapsed && "hidden"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </nav>
    </div>
  );
}