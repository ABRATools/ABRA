import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import {
  Users,
  Server,
  Settings,
  Container,
  Database,
  Lock,
  Network,
  FileText,
  ChevronLeft,
  ChevronRight,
  LockIcon,
  ScrollText,
  AlertTriangle
} from "lucide-react";

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