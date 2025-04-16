import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
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
  MonitorUp,
  Code
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { containersService, ContainerCreateParams, ContainerActionParams } from "@/lib/containers-service";
import CreateNewContainer from "./CreateNewContainer";

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
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [ebpfModules, setEbpfModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState({
    images: false,
    ebpfModules: false,
    containerAction: false
  });
  const [newContainer, setNewContainer] = useState({
    name: "",
    image: "",
    useStaticIp: false,
    ip: "",
    selectedModules: [] as string[]
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

  // Load eBPF modules when dialog opens
  useEffect(() => {
    if (newContainerDialogOpen) {
      // Fetch available images for this node
      if (node) {
        setIsLoading(prev => ({ ...prev, images: true }));
        containersService.listImages(node.ip_address)
          .then(images => {
            const imagesList = Array.isArray(images) ? images : [];
            setAvailableImages(imagesList);
          })
          .catch(error => {
            console.error("Error fetching images:", error);
            toast({
              title: "Error fetching container images",
              description: error.message || "Could not load available images",
              variant: "destructive"
            });
            // Fallback images
            setAvailableImages([
              "localhost/podman-debian:latest",
              "localhost/working:latest",
              "localhost/ubuntu:latest"
            ]);
          })
          .finally(() => {
            setIsLoading(prev => ({ ...prev, images: false }));
          });
      
        // Fetch available eBPF modules
        setIsLoading(prev => ({ ...prev, ebpfModules: true }));
        containersService.getEbpfModuleNames()
          .then(modules => {
            // Ensure we have an array of modules
            const modulesList = Array.isArray(modules) ? modules : [];
            setEbpfModules(modulesList);
          })
          .catch(error => {
            console.error("Error fetching eBPF modules:", error);
            toast({
              title: "Error fetching eBPF modules",
              description: error.message || "Could not load eBPF modules",
              variant: "destructive"
            });
            // Reset to empty array on error
            setEbpfModules([]);
          })
          .finally(() => {
            setIsLoading(prev => ({ ...prev, ebpfModules: false }));
          });
      }
    } else {
      // Reset container form when dialog closes
      setNewContainer({
        name: "",
        image: "",
        useStaticIp: false,
        ip: "",
        selectedModules: []
      });
    }
  }, [newContainerDialogOpen, node, toast]);

  const handleCreateContainer = async () => {
    if (!node) return;
    
    if (!newContainer.name || !newContainer.image) {
      toast({
        title: "Error",
        description: "Container name and image are required",
        variant: "destructive"
      });
      return;
    }

    // Validate IP if static IP is selected
    if (newContainer.useStaticIp && !newContainer.ip) {
      toast({
        title: "Error",
        description: "IP address is required when using static IP",
        variant: "destructive"
      });
      return;
    }

    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (newContainer.useStaticIp && !ipRegex.test(newContainer.ip)) {
      toast({
        title: "Error",
        description: "Please enter a valid IP address",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, containerAction: true }));
      
      const containerParams: ContainerCreateParams = {
        target_ip: node.ip_address,
        name: newContainer.name,
        image: newContainer.image,
        ip: newContainer.useStaticIp ? newContainer.ip : undefined,
        ebpf_modules: newContainer.selectedModules.length > 0 ? newContainer.selectedModules : undefined
      };

      await containersService.createContainer(containerParams);
      
      toast({
        title: "Container created",
        description: `Container ${newContainer.name} has been created successfully`
      });
      
      // Reset form and close dialog
      setNewContainerDialogOpen(false);
      setNewContainer({
        name: "",
        image: "",
        useStaticIp: false,
        ip: "",
        selectedModules: []
      });
    } catch (error: any) {
      toast({
        title: "Error creating container",
        description: error.message || "Failed to create container",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, containerAction: false }));
    }
  };

  const handleContainerAction = async (envId: string, action: 'start' | 'stop' | 'delete') => {
    if (!node) return;

    try {
      setIsLoading(prev => ({ ...prev, containerAction: true }));
      
      const params: ContainerActionParams = {
        env_id: envId,
        target_ip: node.ip_address
      };

      let result;
      switch (action) {
        case 'start':
          result = await containersService.startContainer(params);
          break;
        case 'stop':
          result = await containersService.stopContainer(params);
          break;
        case 'delete':
          result = await containersService.deleteContainer(params);
          break;
      }

      toast({
        title: `Container ${action} successful`,
        description: `Container has been ${action}${action === 'delete' ? 'd' : 'ed'} successfully`
      });
    } catch (error: any) {
      toast({
        title: `Error ${action}ing container`,
        description: error.message || `Failed to ${action} container`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, containerAction: false }));
    }
  };

  const toggleEbpfModule = (module: string, checked: boolean) => {
    setNewContainer(prev => {
      if (checked) {
        return {
          ...prev,
          selectedModules: [...prev.selectedModules, module]
        };
      } else {
        return {
          ...prev,
          selectedModules: prev.selectedModules.filter(m => m !== module)
        };
      }
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
          <CreateNewContainer ipAddress={node.ip_address} />
          {/* <Button onClick={() => setNewContainerDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Container
          </Button> */}
        </div>
        
        Simple Modal for Container Creation - avoids nested dialogs
        {newContainerDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50"
              onClick={() => setNewContainerDialogOpen(false)}
            />
            
            {/* Dialog */}
            <div 
              className="relative max-w-md w-full max-h-[85vh] overflow-auto bg-white rounded-lg shadow-lg p-4 z-50"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Create New Container</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => setNewContainerDialogOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </div>
              
              {/* Content */}
              <div className="grid gap-4 py-4">
                {/* Container Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Container Name</Label>
                  <Input 
                    id="name" 
                    value={newContainer.name}
                    onChange={(e) => setNewContainer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter container name"
                  />
                </div>
                
                {/* Container Image */}
                <div className="grid gap-2">
                  <Label htmlFor="image">Container Image</Label>
                  {isLoading.images ? (
                    <div className="flex items-center h-10 px-3 border rounded-md text-sm text-muted-foreground">
                      Loading images...
                    </div>
                  ) : (
                    <select
                      id="image"
                      value={newContainer.image || ""}
                      onChange={(e) => setNewContainer(prev => ({ ...prev, image: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="" disabled>Select container image</option>
                      {availableImages.length === 0 ? (
                        <option value="no-images" disabled>No images available</option>
                      ) : (
                        availableImages.map(image => (
                          <option key={image} value={image}>{image}</option>
                        ))
                      )}
                    </select>
                  )}
                </div>
                
                {/* Static IP Option */}
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="useStaticIp" 
                      checked={newContainer.useStaticIp} 
                      onChange={(e) => setNewContainer(prev => ({ 
                        ...prev, 
                        useStaticIp: e.target.checked 
                      }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="useStaticIp">Use Static IP</Label>
                  </div>
                  {newContainer.useStaticIp && (
                    <Input 
                      id="ip" 
                      value={newContainer.ip}
                      onChange={(e) => setNewContainer(prev => ({ ...prev, ip: e.target.value }))}
                      placeholder="Enter IP address (e.g. 192.168.1.100)"
                    />
                  )}
                </div>
                
                {/* eBPF Modules */}
                <div className="grid gap-2">
                  <Label>eBPF Modules</Label>
                  <div className="grid gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                    {isLoading.ebpfModules ? (
                      <div className="text-sm text-muted-foreground">Loading modules...</div>
                    ) : ebpfModules.length > 0 ? (
                      ebpfModules.map(module => (
                        <div key={module} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`module-${module}`} 
                            checked={newContainer.selectedModules.includes(module)}
                            onChange={(e) => toggleEbpfModule(module, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label htmlFor={`module-${module}`} className="text-sm cursor-pointer flex items-center">
                            <Code className="mr-2 h-3.5 w-3.5" />
                            {module}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No eBPF modules available</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Create Button */}
              <Button 
                onClick={handleCreateContainer} 
                disabled={isLoading.containerAction || !newContainer.name || !newContainer.image}
                className="w-full"
              >
                {isLoading.containerAction ? "Creating..." : "Create Container"}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
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
                        disabled={isLoading.containerAction}
                      >
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleContainerAction(env.env_id, 'start')}
                        disabled={isLoading.containerAction}
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
                      disabled={isLoading.containerAction}
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