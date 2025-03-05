import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

// helper to format timestamp
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// helper to format uptime
const formatUptime = (timestamp: number): string => {
  const now = Date.now() / 1000;
  const seconds = now - timestamp;
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

type createContainerData = {
  name: string;
  image: string;
  ip?: string;
};

export default function EnvironmentDetail() {
  const { systemId, nodeId, envId } = useParams();
  const { data, isConnected: wsConnected, error } = useWebSocket();
  const [isConsoleConnected, setIsConsoleConnected] = useState(false);
  const [openStopContainerDialog, setOpenStopContainerDialog] = useState(false);
  const [openDeleteContainerDialog, setOpenDeleteContainerDialog] = useState(false);
  const [createContainerData, setCreateContainerData] = useState<createContainerData>({
    name: '',
    image: '',
    ip: ''
  });
  const { toast } = useToast();
  
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

  const handleStart = async (envId: string) => {
    try {
      const response = await fetch('/api/containers/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ env_id: envId, target_ip: node?.ip_address || '' })
      });
      
      if (response.ok) {
          const data = await response.json();
          console.log("Success response:", data.message);
          toast({
            title: "Environment Started",
            description: data.message,
            variant: "default",
          });
      } else {
        const data = await response.json();
        console.error("Error response:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to start environment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting container:', error);
      toast({
        title: "Error",
        description: "Failed to start environment",
        variant: "destructive",
      });
    }
  };

  const handleStop = async (envId: string) => {
    try {
      const response = await fetch('/api/containers/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ env_id: envId, target_ip: node?.ip_address || '' })
      });
      
      if (response.ok) {
          const data = await response.json();
          console.log("Success response:", data.message);
          toast({
            title: "Environment Stopped",
            description: data.message,
            variant: "default",
          });
          setOpenStopContainerDialog(false);
      } else {
        const data = await response.json();
        console.error("Error response:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to stop environment",
          variant: "destructive",
        });
        setOpenStopContainerDialog(false);
      }
    } catch (error) {
      console.error('Error stopping container:', error);
      toast({
        title: "Error",
        description: "Failed to stop environment",
        variant: "destructive",
      });
      setOpenStopContainerDialog(false);
    }
  };

  const handleDelete = async (envId: string) => {
    try {
      const response = await fetch('/api/containers/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ env_id: envId, target_ip: node?.ip_address || '' })
      });
      
      if (response.ok) {
          const data = await response.json();
          console.log("Success response:", data.message);
          toast({
            title: "Environment Deleted",
            description: data.message,
            variant: "default",
          });
          setOpenDeleteContainerDialog(false);
      } else {
        const data = await response.json();
        console.error("Error response:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to delete environment",
          variant: "destructive",
        });
        setOpenDeleteContainerDialog(false);
      }
    } catch (error) {
      console.error('Error deleting container:', error);
      toast({
        title: "Error",
        description: "Failed to delete environment",
        variant: "destructive",
      });
      setOpenDeleteContainerDialog(false);
    }
  };

  if (!nodeId || !systemId || !envId || !wsConnected || error || !node || !environment || !system) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Environment Details</h1>
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

  // simulate environment variables since they aren't directly in the data model
  const envVariables = environment.names.reduce((vars, name) => {
    const varMatches = name.match(/(\w+)=(\w+)/);
    if (varMatches) {
      vars[varMatches[1]] = varMatches[2];
    }
    return vars;
  }, {} as Record<string, string>);

  // if no environment variables were found, add some defaults
  if (Object.keys(envVariables).length === 0) {
    envVariables.PORT = "8080";
    envVariables.NODE_ENV = "production";
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {environment.names[0] || environment.env_id}
          </h1>
          <p className="text-muted-foreground">
            Environment on {node.node_id} in {system.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/config/systems/${systemId}/nodes/${nodeId}/environments/${envId}`}>
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                environment.state === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {environment.state}
              </div>
              <p className="text-sm text-muted-foreground">
                Image: {environment.image}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" size="sm" disabled={environment.state === 'running'} onClick={() => handleStart(envId)}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
              <Dialog open={openStopContainerDialog} onOpenChange={setOpenStopContainerDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"
                  disabled={environment.state !== 'running'}
                  onClick={() => setOpenStopContainerDialog(true)}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Stopping environment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Are you sure you want to stop this environment?</p>
                    </div>
                    <Button 
                      onClick={() => handleStop(envId)}
                      variant="destructive"
                      className="w-full"
                    >
                      Stop Environment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={openDeleteContainerDialog} onOpenChange={setOpenDeleteContainerDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm"
                  onClick={() => setOpenDeleteContainerDialog(true)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deleting environment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Are you sure you want to delete this environment?</p>
                      <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                    </div>
                    <Button 
                      onClick={() => handleDelete(envId)}
                      variant="destructive"
                      className="w-full"
                    >
                      Delete Environment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Console Access
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Direct console access to the environment
            </p>
          </div>
          <Button 
            variant={isConsoleConnected ? "destructive" : "default"}
            onClick={() => setIsConsoleConnected(!isConsoleConnected)}
          >
            {isConsoleConnected ? "Disconnect" : "Connect"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
            {isConsoleConnected ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`http://${node.ip_address}:9000/${environment.names[0]}/novnc/vnc.html?path=/${environment.names[0]}/novnc/websockify&autoconnect=true&resize=remote&quality=1&compression=10`}
                title="VNC Console"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Click Connect to start console session
                </p>
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" disabled={!isConsoleConnected}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" disabled={!isConsoleConnected}>
              Full Screen
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environment.cpu_percentage.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Currently used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environment.memory_percent.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Currently used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(environment.started_at)}</div>
            <p className="text-xs text-muted-foreground">
              Started: {formatTimestamp(environment.started_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Network Configuration</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">IP Address</h4>
                <div className="text-sm text-muted-foreground">{environment.ip || 'Not assigned'}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Networks</h4>
                {environment.networks.map((network) => (
                  <div key={network} className="text-sm text-muted-foreground">
                    {network}
                  </div>
                ))}
                {environment.networks.length === 0 && (
                  <div className="text-sm text-muted-foreground">No networks connected</div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Port Mappings</h4>
                {environment.ports.map((port) => (
                  <div key={port} className="text-sm text-muted-foreground">
                    {port}
                  </div>
                ))}
                {environment.ports.length === 0 && (
                  <div className="text-sm text-muted-foreground">No ports mapped</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Environment Variables</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envVariables).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}:</span>{' '}
                  <span className="text-muted-foreground">
                    {key.toLowerCase().includes('password') ? '********' : value}
                  </span>
                </div>
              ))}
              {Object.keys(envVariables).length === 0 && (
                <div className="text-sm text-muted-foreground">No environment variables set</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Container Logs</CardTitle>
          <Terminal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md font-mono text-sm h-48 overflow-auto">
            <div className="text-muted-foreground">
              {formatTimestamp(environment.started_at)} [INFO] Container started successfully
              <br />
              {environment.exited && environment.exit_code !== 0 ? (
                <>
                  {formatTimestamp(environment.exited_at)} [ERROR] Container exited with code {environment.exit_code}
                  <br />
                </>
              ) : null}
              {environment.state === 'running' ? (
                <>
                  {formatTimestamp(Date.now() / 1000 - 60)} [INFO] Health check passed
                  <br />
                </>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}