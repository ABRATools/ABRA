import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Box, Settings, Container, HardDrive } from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useToast } from "@/hooks/use-toast";

const formatMemory = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export default function NodeConfigDetail() {
  const { systemId, nodeId } = useParams();
  console.log(systemId, nodeId);
  const { data, isConnected, error } = useWebSocket();
  console.log(data, isConnected, error);
  const { toast } = useToast();
  
  const [nodeName, setNodeName] = useState("");
  const [nodeDescription, setNodeDescription] = useState("");
  const [cpuCores, setCpuCores] = useState(4);
  const [memoryGB, setMemoryGB] = useState(16);
  const [storageGB, setStorageGB] = useState(100);
  const [networkMode, setNetworkMode] = useState("bridge");
  const [subnet, setSubnet] = useState("172.17.0.0/16");
  
  const node = useMemo(() => {
    if (!data?.nodes || !nodeId) {
      console.log("node not found or nodeId not set");
      return null;
    }
    console.log(data.nodes.find(n => n.node_id === nodeId));
    return data.nodes.find(n => n.node_id === nodeId);
  }, [data, nodeId]);
  
  const system = useMemo(() => {
    if (!node || !systemId){
      console.log("system not found");
      return null;
    }
    
    // const [osName, osVersion] = systemId.split('-');
    
    // if (node.os_name !== osName || node.os_version !== osVersion) {
    //   return null;
    // }
    
    return {
      id: systemId,
      name: node.node_id
      // name: `${osName} ${osVersion}`
    };
  }, [node, systemId]);
  
  useEffect(() => {
    if (node) {
      setNodeName(node.node_id);
      setNodeDescription(`${node.os_name} ${node.os_version} node`);
      setCpuCores(node.cpu_count || 4);
      
      // memory conversion
      const memGB = node.total_memory ? Math.ceil(node.total_memory / (1024 * 1024 * 1024)) : 16;
      setMemoryGB(memGB);
      
      // assume storage is 5x memory for now (???)
      setStorageGB(memGB * 5);
    }
    else {
      setNodeName("undefined!!!");
      setNodeDescription("");
      setCpuCores(4);
      setMemoryGB(16);
      setStorageGB(100);
    }
  }, [node]);
  
  // handle form submission
  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: "Node configuration has been updated",
    });
  };
  
  const handleUpdateResources = () => {
    toast({
      title: "Resources Updated",
      description: "Node resource configuration has been updated",
    });
  };
  
  const handleUpdateNetwork = () => {
    toast({
      title: "Network Updated",
      description: "Node network configuration has been updated",
    });
  };
  
  if (!isConnected || error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Node Configuration</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              {error ? (
                <div className="text-red-500">
                  <h2 className="text-xl mb-2">Connection Error</h2>
                  <p>{error.message}</p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">Connecting to monitoring service...</h2>
                  <p>Please wait while we establish connection</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log(nodeId, systemId, node, system);
  if (!nodeId || !systemId || !node || !system) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Node Configuration</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <h2 className="text-xl mb-2">Node Not Found</h2>
                <p>The node with ID {nodeId} could not be found in system {systemId}</p>
                <Button className="mt-4" asChild>
                  <Link to={`/config/systems/${systemId}`}>Return to System</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configure Node</h1>
          <p className="text-muted-foreground">
            Configure {node.node_id} in {system.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/display/systems/${systemId}/nodes/${nodeId}`}>
              View Node
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Node Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Node Name</Label>
                <Input
                  id="name"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="Enter node name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={nodeDescription}
                  onChange={(e) => setNodeDescription(e.target.value)}
                  placeholder="Enter node description"
                />
              </div>
            </div>
            <Button type="submit">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateResources(); }}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU Cores</Label>
                <Input
                  id="cpu"
                  type="number"
                  value={cpuCores}
                  onChange={(e) => setCpuCores(parseInt(e.target.value))}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Current: {node.cpu_count || 'Unknown'} cores
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory">Memory (GB)</Label>
                <Input
                  id="memory"
                  type="number"
                  value={memoryGB}
                  onChange={(e) => setMemoryGB(parseInt(e.target.value))}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Current: {formatMemory(node.total_memory)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage (GB)</Label>
                <Input
                  id="storage"
                  type="number"
                  value={storageGB}
                  onChange={(e) => setStorageGB(parseInt(e.target.value))}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Current: {storageGB} GB (estimated)
                </p>
              </div>
            </div>
            <Button type="submit">
              Update Resources
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateNetwork(); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="networkMode">Network Mode</Label>
                <Input
                  id="networkMode"
                  value={networkMode}
                  onChange={(e) => setNetworkMode(e.target.value)}
                  placeholder="Enter network mode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subnet">Subnet</Label>
                <Input
                  id="subnet"
                  value={subnet}
                  onChange={(e) => setSubnet(e.target.value)}
                  placeholder="Enter subnet"
                />
              </div>
            </div>
            <Button type="submit">
              Update Network
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Node Environments</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Environment
          </Button>
        </div>
        {node.environments && node.environments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {node.environments.map((env) => (
              <Card key={env.env_id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {env.names && env.names.length > 0 ? env.names[0] : env.env_id}
                  </CardTitle>
                  <Container className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            env.status === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {env.status}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Image</p>
                          <p className="text-sm">{env.image}</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground">Resources</p>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-sm">CPU: {env.cpu_percentage.toFixed(2)}%</p>
                          <p className="text-sm">Memory: {env.memory_percent.toFixed(2)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/config/systems/${systemId}/nodes/${nodeId}/environments/${env.env_id}`}>
                          Configure
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={`/display/systems/${systemId}/nodes/${nodeId}/environments/${env.env_id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>No environments found on this node</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Environment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}