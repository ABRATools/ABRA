import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/data/WebSocketContext";
import {
  Settings, 
  Activity, 
  HardDrive, 
  Clock, 
  Box, 
  RefreshCw, 
  PlusCircle, 
  Play, 
  StopCircle, 
  Trash,
  ExternalLink,
  MonitorUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formatMemory = (bytes: number): string => {
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatUptime = (nanoseconds: number): string => {
  // Convert nanoseconds to seconds
  const seconds = nanoseconds / 1_000_000_000;
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `<1m`;
};

export default function NodeDetail() {
  const { nodeId } = useParams();
  const { data, isConnected, error } = useWebSocket();
  const { toast } = useToast();
  const [newContainerDialogOpen, setNewContainerDialogOpen] = useState(false);
  const [newContainer, setNewContainer] = useState({
    name: "",
    image: "",
  });

  // find the node that matches the nodeId
  const node = useMemo(() => {
    if (!data?.nodes || !nodeId) return null;
    return data.nodes.find(n => n.node_id === nodeId);
  }, [data, nodeId]);

  // get environments for this node
  const nodeEnvironments = useMemo(() => {
    if (!node) return [];
    return node.environments || [];
  }, [node]);

  const handleCreateContainer = () => {
    if (!newContainer.name || !newContainer.image) {
      toast({
        title: "Error",
        description: "Container name and image are required",
        variant: "destructive"
      });
      return;
    }

    console.log("Creating container:", newContainer);
    toast({
      title: "Container creation requested",
      description: `Creating new container: ${newContainer.name}`
    });
    
    setNewContainerDialogOpen(false);
    setNewContainer({ name: "", image: "" });
  };

  const handleContainerAction = (envId: string, action: 'start' | 'stop' | 'delete') => {
    console.log(`${action} container:`, envId);
    toast({
      title: "Action requested",
      description: `${action.charAt(0).toUpperCase() + action.slice(1)}ing container ${envId}`
    });
  };

  if (!nodeId || !isConnected || error || !node) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Node Details</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              {error ? (
                <div className="text-red-500">
                  <h2 className="text-xl mb-2">Connection Error</h2>
                  <p>{error.message}</p>
                </div>
              ) : !isConnected ? (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">Connecting to monitoring service...</h2>
                  <p>Please wait while we establish connection</p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">Node Not Found</h2>
                  <p>The node with ID {nodeId} could not be found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cpuUsagePercent = nodeEnvironments.length
    ? Math.round(nodeEnvironments.reduce((sum, env) => sum + env.cpu_percentage, 0) * 100) / 100
    : 0;
  
  const usedMemory = node.total_memory * (node.mem_percent / 100);
  
  // This is a placeholder, real implementation would depend on actual data available
  const storageUsed = 100; // GB
  const storageTotal = 500; // GB
  const storagePercent = Math.round((storageUsed / storageTotal) * 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{node.node_id}</h1>
          <p className="text-muted-foreground">
            IP: {node.ip_address} | OS: {node.os_name} {node.os_version}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Metrics
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cpuUsagePercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {node.cpu_count} cores available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {node.mem_percent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatMemory(usedMemory)}/{formatMemory(node.total_memory)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storagePercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {storageUsed}/{storageTotal} GB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Containers</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{node.num_containers}</div>
            <p className="text-xs text-muted-foreground">
              {nodeEnvironments.filter(env => env.state === 'running').length} running
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Containers</h2>
          <Dialog open={newContainerDialogOpen} onOpenChange={setNewContainerDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Container
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Container</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Container Name</Label>
                  <Input 
                    id="name" 
                    value={newContainer.name}
                    onChange={(e) => setNewContainer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter container name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Container Image</Label>
                  <Select 
                    onValueChange={(value) => setNewContainer(prev => ({ ...prev, image: value }))}
                    value={newContainer.image}
                  >
                    <SelectTrigger id="image">
                      <SelectValue placeholder="Select container image" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="localhost/podman-debian:latest">Debian</SelectItem>
                      <SelectItem value="localhost/working:latest">Working</SelectItem>
                      <SelectItem value="localhost/ubuntu:latest">Ubuntu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateContainer}>Create Container</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nodeEnvironments.map((env) => (
            <Card key={env.env_id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{env.names[0] || 'Unnamed'}</CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  env.state === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {env.state}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Image: {env.image}</p>
                    <p className="text-sm text-muted-foreground">
                      IP: {env.ip || 'Not assigned'}
                    </p>
                    {env.state === 'running' && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">CPU</p>
                            <p className="text-sm">{env.cpu_percentage.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Memory</p>
                            <p className="text-sm">{env.memory_percent.toFixed(2)}%</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {formatUptime(env.uptime)}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {/* Start/Stop button */}
                    {env.state === 'running' ? (
                      <Button 
                        variant="outline"
                        className="flex-1" 
                        onClick={() => handleContainerAction(env.env_id, 'stop')}
                      >
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleContainerAction(env.env_id, 'start')}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    )}
                    
                    {/* Container Details Button */}
                    <Button 
                      variant="outline" 
                      size="icon"
                      asChild
                    >
                      <Link to={`/display/systems/all-nodes/nodes/${node.node_id}/environments/${env.env_id}`}>
                        <MonitorUp className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    {/* Delete button */}
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleContainerAction(env.env_id, 'delete')}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {nodeEnvironments.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>No containers found on this node</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setNewContainerDialogOpen(true)}
              >
                <Box className="mr-2 h-4 w-4" />
                Add First Container
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">System Information</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Hardware</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">CPU Cores:</span>
                    <span className="text-sm font-medium">{node.cpu_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Memory:</span>
                    <span className="text-sm font-medium">{formatMemory(node.total_memory)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Node ID:</span>
                    <span className="text-sm font-medium">{node.node_id}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Operating System</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">OS:</span>
                    <span className="text-sm font-medium">{node.os_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Version:</span>
                    <span className="text-sm font-medium">{node.os_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">IP Address:</span>
                    <span className="text-sm font-medium">{node.ip_address}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}