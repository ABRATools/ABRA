import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, File, Folder } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  Trash,
} from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { LogFileView } from "@/components/LogViewer";

type FileTreeItem = string | [string, FileTreeItem[]]

export default function EnvironmentLogs() {
  const { systemId, nodeId, envId } = useParams();
  const { data, isConnected: wsConnected, error } = useWebSocket();
  const [loadingTree, setLoadingTree] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
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

  const LogFetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      "node_id": nodeId,
      "env_name": environment ? environment?.names[0] : "",
      "log_path": selectedFile,
    }),
  };

  const handleFileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const filePath = e.currentTarget.getAttribute('data-file-path');
    if (filePath) {
      setSelectedFile(null);
      setTimeout(() => {
        setSelectedFile(filePath);
      }, 200);
      // setTimeout is used to allow the button to update before setting the file
    }
  };

  const getBaseName = (p: string) => {
    // works with both / and \ paths
    const parts = p.split(/[\\/]/);
    return parts[parts.length - 1];
  };

  const Tree = ({ item }: { item: string | any[] }) => {
    if (Array.isArray(item) && item.length === 1 && Array.isArray(item[0])) {
      return <Tree item={item[0]} />
    }
  
    if (typeof item === 'string') {
      const name = getBaseName(item);
      return (
        <Button
          variant={selectedFile === item ? "default" : "ghost"}
          data-file-path={item}
          className="flex items-start gap-2 p-2 text-sm text-muted-foreground transition-colors max-w-fit"
          onClick={handleFileClick}
        >
          <File />
          {name}
        </Button>
      )
    }
  
    if (
      Array.isArray(item) &&
      item.length === 2 &&
      typeof item[0] === 'string' &&
      Array.isArray(item[1])
    ) {
      const [rawname, children] = item
      if (children.length === 0) return null
      const name = getBaseName(rawname);
  
      return (
        <div className="flex flex-col">
          <Collapsible defaultOpen={true} className="group/collapsible [&[data-state=open]>div>svg:first-child]:rotate-90">
            <CollapsibleTrigger asChild>
              <div className="flex items-start gap-2 p-2 text-sm text-muted-foreground transition-colors max-w-min">
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
            <CardTitle>Environment logs for {environment ? environment?.names[0] : ""} on {nodeId}</CardTitle>
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
                  {selectedFile ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between">
                      <Button variant="outline" className="absolute top-4 right-4 self-end" onClick={() => setSelectedFile(null)}>
                        <Trash className="mr-2" />
                        Close
                      </Button>
                      </div>
                      <h2 className="text-xl mb-2">{getBaseName(selectedFile)}</h2>
                      { !!selectedFile && (
                        <LogFileView endpoint={"/api/containers/node-log-file"} streaming={true} scrolling={true} fetchOptions={LogFetchOptions} height={600}/>
                      )}
                    </div>
                  ) : 
                    <div className="text-center py-8">
                      <h2 className="text-xl mb-2">Select a file to view logs</h2>
                    </div>
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}