import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Environment } from "@/types/environment"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    accessorKey: "os",
    header: "Type",
  },
  {
    accessorKey: "uptime",
    header: "Uptime",
  },
  {
    accessorKey: "cpu_percent",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          CPU %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "memory",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Memory (GB)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "disk",
    header: "Disk (GB)",
  },
  {
    accessorKey: "max_cpus",
    header: "Max CPU",
  },
  {
    accessorKey: "max_memory",
    header: "Max Memory",
  },
  {
    accessorKey: "max_disk",
    header: "Max Disk",
  },
  {
    accessorKey: "ip",
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
            <DropdownMenuItem onClick={() => {console.log(environment.env_id)}}>
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
