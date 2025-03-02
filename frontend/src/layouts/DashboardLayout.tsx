import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
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
  );
}