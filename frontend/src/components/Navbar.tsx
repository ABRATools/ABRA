import { ThemeToggle } from "@/components/Theming/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom";
import {
    LogOut,
    Activity,
    Settings,
    Boxes,
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
    window.location.href = "/login";
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
                <Link to="/users">Manage Users</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Activity />
                <Link to="/audit">Audit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Boxes />
                <Link to="/nodes">Nodes</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut />
                <Button variant={"ghost"} onClick={handleLogout}>Logout</Button>
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

