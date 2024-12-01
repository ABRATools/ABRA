import { ThemeToggle } from "@/components/Theming/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom";
import {
    LogOut,
    // Plus,
    // PlusCircle,
    Settings,
    MessageSquareWarning,
    // User,
    ListChecks,
    Users,
    Menu
  } from "lucide-react"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

function handleLogout() {
  sessionStorage.removeItem("token");
  fetch("/logout", {
    method: "GET",
  }).then(() => {
    window.location.href = "/logout";
  });
}

export default function Navbar() {
  return (
    <div className="place-self-stretch w-full mb-4">
      <div className="flex flex-row dark:bg-background bg-abra-accent py-[30px] px-4 md:px-[20px] w-full justify-between">
        <div className="flex flex-row gap-x-20">
          <h1 className="self-center text-2xl md:text-3xl">
            <Link to="/dashboard">
              ABRA Adminpanel
            </Link>
            </h1>
        </div>
        <div>
          <div className="flex md:hidden lg:hidden xl:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
            <DropdownMenuItem>
                <Users />
                <span>Manage Users</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquareWarning />
                <span>Audit</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                <span>Nodes</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          <div className="hidden md:flex flex-row">
          <Button variant={"ghost"}>
              <Link to="/users">Manage Users</Link>
            </Button>
            <Button variant={"ghost"}>
              <Link to="/audit">Audit ABRA</Link>
            </Button>
            <Button variant={"ghost"}>
              <Link to="/settings">Settings</Link>
            </Button>
            <Button variant={"ghost"}>
              <Link to="/nodes">Nodes</Link>
            </Button>
            <Button variant={"ghost"} onClick={handleLogout}>Logout</Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

