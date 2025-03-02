import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";


export function DashboardHeader() {
  function handleLogout() {
    // document.cookie = 'abra-auth=; Max-Age=0; path=/; domain=' + location.hostname;
    fetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (response.status === 200) {
        console.log("Logout successful");
      }
      else {
        throw new Error('Logout failed');
      }
    }).catch((error) => {
      console.error('Logout failed', error);
    });
    
    window.location.href = "/login";
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Container Management System</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}