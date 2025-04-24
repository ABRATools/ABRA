import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { RBACNavigationSidebar } from "@/components/DashboardSidebar";
import { useAuth } from "@/auth/AuthContext";

export function DashboardLayout({ hideSidebar }) {
  const { checkingPermissions } = useAuth();
  const location = useLocation();
  
  // Use hideSidebar function if provided (used to hide the node sidebar on node pages)
  const shouldHideSidebar = hideSidebar ? hideSidebar(location) : false;
  
  return (
    <div className="min-h-screen flex">
      {/* Always show the main navigation sidebar */}
      <RBACNavigationSidebar />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <div className="flex-1">
          <main className="flex-1 p-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}