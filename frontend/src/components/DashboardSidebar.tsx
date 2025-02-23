import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

const menuItems = [
  {
    title: "Display",
    items: [
      {
        title: "Systems Overview",
        icon: Network,
        href: "/display/systems",
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "System Config",
        icon: Settings,
        href: "/config/systems",
      },
      {
        title: "Config Profiles",
        icon: FileText,
        href: "/config/profiles",
      },
      {
        title: "Container Image Config",
        icon: Container,
        href: "/config/containers"
      }
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "User Management",
        icon: Users,
        href: "/users",
      },
      {
        title: "Access Management",
        icon: Lock,
        href: "/access",
      },
    ],
  },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1
          className={cn(
            "font-bold transition-all duration-300",
            collapsed ? "scale-0 w-0" : "scale-100"
          )}
        >
          Admin Dashboard
        </h1>
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
        {menuItems.map((section) => (
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
                    location.pathname === item.href
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
        ))}
      </nav>
    </div>
  );
}