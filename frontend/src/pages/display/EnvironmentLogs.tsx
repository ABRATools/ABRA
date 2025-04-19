import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, File, Folder } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  Settings,
  Activity,
  HardDrive,
  Network,
  Terminal,
  RefreshCw,
  Play,
  Square,
  Trash,
  Layers,
  Monitor,
  Clock
} from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// helper to format timestamp
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

type FileTreeItem = string | [string, FileTreeItem[]]

const test_file_data = {
  tree: [
    [
      "app",
      [
        "api",
        ["hello", ["route.ts"]],
        "page.tsx",
        "layout.tsx",
        ["blog", ["page.tsx"]],
      ],
    ],
    [
      "components",
      ["ui", "button.tsx", "card.tsx"],
      "header.tsx",
      "footer.tsx",
    ],
    ["lib", ["util.ts"]],
    ["public", "favicon.ico", "vercel.svg"],
    ".eslintrc.json",
    ".gitignore",
    "next.config.js",
    "tailwind.config.js",
    "package.json",
    "README.md",
  ],
}

function Tree({ item }: { item: string | any[] }) {
  const [name, ...items] = Array.isArray(item) ? item : [item]

  if (!items.length) {
    return (
      <Button
        variant={"ghost"}
        // isActive={name === "button.tsx"}
        className="data-[active=true]:bg-transparent flex items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-muted/10 transition-colors"
      >
        <File />
        {name}
      </Button>
    )
  }

  return (
    <div className="flex flex-col">
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        // defaultOpen={name === "components" || name === "ui"}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-muted/10 transition-colors">
            <ChevronRight className="transition-transform" />
            <Folder />
            {name}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col pl-4">
            {items.map((subItem, index) => (
              <Tree key={index} item={subItem} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default function EnvironmentLogs() {
  const { systemId, nodeId, envId } = useParams();
  const { data, isConnected: wsConnected, error } = useWebSocket();
  const [loadingTree, setLoadingTree] = useState(false);
  const { toast } = useToast();
  
  // load file tree structure at load
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);

  // find the node
  const node = useMemo(() => {
    if (!data?.nodes || !nodeId) return null;
    return data.nodes.find(n => n.node_id === nodeId);
  }, [data, nodeId]);
  
  // find the environment
  const environment = useMemo(() => {
    if (!node || !envId) return null;
    return node.environments?.find(e => e.env_id === envId) || null;
  }, [node, envId]);
  
  // get the system information
  const system = useMemo(() => {
    if (!node || !systemId) return null;
    
    return {
      id: systemId,
      name: node.node_id
    };
  }, [node, systemId]);

  useEffect(() => {
    const loadFileTree = async () => {
      try {
        setLoadingTree(true);
        const response = await fetch('/api/containers/node-log-tree', 
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              "node_id": nodeId,
              "env_name": environment ? environment?.names[0] : "",
              "env_id": envId,
            }),
          }
        ).then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res;
        });
        const data = await response.json();
        setFileTree(data.tree);
      } catch (error) {
        console.error('Error fetching file tree:', error);
        toast({
          title: 'Error',
          description: 'Failed to load file tree structure.',
          variant: 'destructive',
        });
      } finally {
        setLoadingTree(false);
      }
    };
    loadFileTree();
  }, []);

  if (!nodeId || !systemId || !envId || !wsConnected || error || !node || !environment || !system) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Environment Logs</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              {error ? (
                <div className="text-red-500">
                  <h2 className="text-xl mb-2">Connection Error</h2>
                  <p>{error.message}</p>
                </div>
              ) : !wsConnected ? (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">Connecting to monitoring service...</h2>
                  <p>Please wait while we establish connection</p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">Environment Not Found</h2>
                  <p>The environment with ID {envId} could not be found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex items-start justify-start flex-col col-span-1">
        {fileTree.map((item, index) => (
          <Tree key={index} item={item} />
        ))}
      </div>
      <div className="flex items-center justify-between flex-col col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Environment Logs</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            { loadingTree && (
              <div className="text-center py-8">
                <h2 className="text-xl mb-2">Loading file tree...</h2>
                <p>Please wait while we load the file tree structure</p>
              </div>
            )}
            <div className="text-center py-8">
              <h2 className="text-xl mb-2">Logs for Environment {envId}</h2>
              {/* <p>{environment.logs}</p> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}