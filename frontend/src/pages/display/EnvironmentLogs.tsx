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
import { LogFileView } from "@/components/LogViewer";

type FileTreeItem = string | [string, FileTreeItem[]]

function Tree({ item }: { item: string | any[] }) {
  if (Array.isArray(item) && item.length === 1 && Array.isArray(item[0])) {
    return <Tree item={item[0]} />
  }

  if (typeof item === 'string') {
    return (
      <Button
        variant="ghost"
        className="data-[active=true]:bg-transparent flex items-start gap-2 p-2 text-sm text-muted-foreground hover:bg-muted/10 transition-colors max-w-fit"
      >
        <File />
        {item}
      </Button>
    )
  }

  if (
    Array.isArray(item) &&
    item.length === 2 &&
    typeof item[0] === 'string' &&
    Array.isArray(item[1])
  ) {
    const [name, children] = item
    if (children.length === 0) return null

    return (
      <div className="flex flex-col">
        <Collapsible className="group/collapsible [&[data-state=open]>div>svg:first-child]:rotate-90">
          <CollapsibleTrigger asChild>
            <div className="flex items-start gap-2 p-2 text-sm text-muted-foreground hover:bg-muted/10 transition-colors max-w-min">
              <ChevronRight className="transition-transform" />
              <Folder />
              {name}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col pl-4">
              {children.map((subItem, i) => (
                <Tree key={i} item={subItem} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  if (Array.isArray(item)) {
    return (
      <>
        {item.map((subItem, i) => (
          <Tree key={i} item={subItem} />
        ))}
      </>
    )
  }

  return null
}

export default function EnvironmentLogs() {
  const { systemId, nodeId, envId } = useParams();
  const { data, isConnected: wsConnected, error } = useWebSocket();
  const [loadingTree, setLoadingTree] = useState(false);
  const { toast } = useToast();
  
  // load file tree structure at load
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const logEndpoint = "/api/stream_audit_log";

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
    <div className="grid grid-cols-6 gap-4">
      <div className="flex items-start justify-start flex-col col-span-1 min-w-[200px]">
        {fileTree.map((item, index) => (
          <Tree key={index} item={item} />
        ))}
      </div>
      <div className="flex items-center justify-between flex-col col-span-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Environment Logs</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            { loadingTree && (
              <div className="text-center py-8">
                <h2 className="text-xl mb-2">Loading file tree...</h2>
                <p>Please wait while we load the file tree structure</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex-grow flex gap-4 min-w-md min-h-md">
                <div className="relative flex-1 min-w-md min-h-md">
                  <LogFileView endpoint={logEndpoint} streaming={true} scrolling={true}/>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}