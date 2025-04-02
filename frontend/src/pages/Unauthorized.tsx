// src/pages/Unauthorized.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Shield, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          
          {user && user.groups && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Your current roles:</p>
              <div className="flex gap-1 flex-wrap justify-center mt-2">
                {user.groups.map((group) => (
                  <div key={group} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {group}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Button asChild className="w-full">
          <Link to="/display/systems">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}