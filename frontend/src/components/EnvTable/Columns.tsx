import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Course = {
  name: string,
  environments: Environment[],
}

export type Environment = {
  name: string,
  vmid: number,
  status: "running" | "stopped" | "undefined",
  prox_type: string,
  uptime: string,
  maxcpu: number,
  cpu: number,
  maxdisk: string,
  disk: string,
  mem: string,
  maxmem: string,
  ip_address: string,
}

export const columns: ColumnDef<Environment>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "prox_type",
    header: "Type",
  },
  {
    accessorKey: "uptime",
    header: "Uptime",
  },
  {
    accessorKey: "cpu",
    header: "CPU",
  },
  {
    accessorKey: "mem",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Memory
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "disk",
    header: "Disk",
  },
  {
    accessorKey: "maxcpu",
    header: "Max CPU",
  },
  {
    accessorKey: "maxmem",
    header: "Max Memory",
  },
  {
    accessorKey: "maxdisk",
    header: "Max Disk",
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const environment = row.original as Environment
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {console.log(environment.vmid)}}>
              Start
            </DropdownMenuItem>
            <DropdownMenuItem>
              Restart
            </DropdownMenuItem>
            <DropdownMenuItem>
              Stop
            </DropdownMenuItem>
            <DropdownMenuItem>
              Force Stop
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
