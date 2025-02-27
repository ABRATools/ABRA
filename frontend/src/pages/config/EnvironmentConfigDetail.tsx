import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Container,
  Plus,
  Trash,
  Eye,
  Save,
  RefreshCw
} from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useToast } from "@/hooks/use-toast";

export default function EnvironmentConfigDetail() {
  const { systemId, nodeId, envId } = useParams();
  const { data, isConnected, error } = useWebSocket();
  const { toast } = useToast();
  
  // form consts
  const [envName, setEnvName] = useState("");
  const [envImage, setEnvImage] = useState("");
  const [ports, setPorts] = useState<string[]>([]);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [cpuLimit, setCpuLimit] = useState(2);
  const [memoryLimit, setMemoryLimit] = useState(2048);
  const [storageLimit, setStorageLimit] = useState(10);
  const [restartPolicy, setRestartPolicy] = useState("always");
  const [networkMode, setNetworkMode] = useState("bridge");

  // find node
  const node = useMemo(() => {
    if (!data?.nodes || !nodeId) return null;
    return data.nodes.find(n => n.node_id === nodeId);
  }, [data, nodeId]);
  
  // get env
  const environment = useMemo(() => {
    if (!node || !envId) return null;
    if (!node.environments || !Array.isArray(node.environments)) return null;
    return node.environments.find(e => e.env_id === envId);
  }, [node, envId]);
  
  // sys info
  const system = useMemo(() => {
    if (!node || !systemId) return null;
    
    const [osName, osVersion] = systemId.split('-');
    
    // verify
    if (node.os_name !== osName || node.os_version !== osVersion) {
      return null;
    }
    
    return {
      id: systemId,
      name: `${osName} ${osVersion}`
    };
  }, [node, systemId]);

  useEffect(() => {
    if (environment) {
      setEnvName(environment.names && environment.names.length > 0 ? environment.names[0] : environment.env_id);
      setEnvImage(environment.image || "");
      
      setPorts(environment.ports ? environment.ports.map(p => p.toString()) : []);
      
      setCpuLimit(Math.max(1, Math.ceil(environment.cpu_percentage / 25))); // Rough estimate
      setMemoryLimit(Math.ceil((environment.memory_percent / 100) * node.total_memory / (1024 * 1024))); // Convert to MB
      setStorageLimit(10); // Default since we don't have storage info
      
      const extractedVars: Record<string, string> = {};
      if (environment.names && environment.names.length > 0) {
        environment.names.forEach(name => {
          const match = name.match(/(\w+)=(\w+)/);
          if (match) {
            extractedVars[match[1]] = match[2];
          }
        });
      }
      
      if (Object.keys(extractedVars).length === 0) {
        extractedVars.PORT = "8080";
        extractedVars.NODE_ENV = "production";
      }
      
      setEnvVars(extractedVars);
    }
  }, [environment, node]);
  
  // handlers
  const handleSaveBasic = () => {
    toast({
      title: "Changes Saved",
      description: "Basic settings have been updated",
    });
  };
  
  const handleUpdateContainer = () => {
    toast({
      title: "Container Updated",
      description: "Container configuration has been updated",
    });
  };
  
  const handleUpdateResources = () => {
    toast({
      title: "Resources Updated",
      description: "Resource limits have been updated",
    });
  };
  
  const handleUpdateVariables = () => {
    toast({
      title: "Variables Updated",
      description: "Environment variables have been updated",
    });
  };
  
  const handleUpdateOptions = () => {
    toast({
      title: "Options Updated",
      description: "Advanced options have been updated",
    });
  };
  
  const handleDeleteEnvironment = () => {
    toast({
      title: "Environment Deleted",
      description: "Environment has been deleted",
      variant: "destructive",
    });
  };
  
  // port management
  const addPort = () => {
    setPorts([...ports, ""]);
  };
  
  const updatePort = (index: number, value: string) => {
    const newPorts = [...ports];
    newPorts[index] = value;
    setPorts(newPorts);
  };
  
  const removePort = (index: number) => {
    const newPorts = [...ports];
    newPorts.splice(index, 1);
    setPorts(newPorts);
  };
  
  // env variables management
  const addEnvVar = () => {
    const newVars = { ...envVars, "": "" };
    setEnvVars(newVars);
  };
  
  const updateEnvVarKey = (oldKey: string, newKey: string) => {
    const newVars = { ...envVars };
    const value = newVars[oldKey];
    delete newVars[oldKey];
    newVars[newKey] = value;
    setEnvVars(newVars);
  };
  
  const updateEnvVarValue = (key: string, value: string) => {
    const newVars = { ...envVars };
    newVars[key] = value;
    setEnvVars(newVars);
  };
  
  const removeEnvVar = (key: string) => {
    const newVars = { ...envVars };
    delete newVars[key];
    setEnvVars(newVars);
  };

  if (!isConnected || error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Environment Configuration</h1>
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

  if (!nodeId || !systemId || !envId || !node || !environment || !system) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Environment Configuration</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <h2 className="text-xl mb-2">Environment Not Found</h2>
                <p>The environment with ID {envId} could not be found</p>
                <Button className="mt-4" asChild>
                  <Link to={`/config/systems/${systemId}/nodes/${nodeId}`}>Return to Node</Link>
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
          <h1 className="text-3xl font-bold tracking-tight">Configure Environment</h1>
          <p className="text-muted-foreground">
            Configure {environment.names && environment.names.length > 0 ? environment.names[0] : environment.env_id} on {node.node_id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/display/systems/${systemId}/nodes/${nodeId}/environments/${envId}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Environment
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveBasic(); }}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Environment Name</Label>
                <Input
                  id="name"
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                  placeholder="Enter environment name"
                />
              </div>
            </div>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Container Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateContainer(); }}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Container Image</Label>
                <Input
                  id="image"
                  value={envImage}
                  onChange={(e) => setEnvImage(e.target.value)}
                  placeholder="Enter container image"
                />
              </div>
              <div className="space-y-2">
                <Label>Port Mappings</Label>
                <div className="space-y-2">
                  {ports.map((port, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={port}
                        onChange={(e) => updatePort(index, e.target.value)}
                        placeholder="host:container"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        type="button"
                        onClick={() => removePort(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    type="button"
                    onClick={addPort}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Port Mapping
                  </Button>
                </div>
              </div>
            </div>
            <Button type="submit">
              Update Container
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
                  value={cpuLimit}
                  onChange={(e) => setCpuLimit(parseInt(e.target.value))}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Node Available: {node.cpu_count || 'Unknown'} cores
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory">Memory (MB)</Label>
                <Input
                  id="memory"
                  type="number"
                  value={memoryLimit}
                  onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
                  min={512}
                  step={512}
                />
                <p className="text-sm text-muted-foreground">
                  Current Usage: {environment.memory_percent.toFixed(2)}%
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage (GB)</Label>
                <Input
                  id="storage"
                  type="number"
                  value={storageLimit}
                  onChange={(e) => setStorageLimit(parseInt(e.target.value))}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Estimated Storage
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
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateVariables(); }}>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={key}
                    onChange={(e) => updateEnvVarKey(key, e.target.value)}
                    placeholder="Key"
                    className="flex-1"
                  />
                  <Input
                    value={value}
                    onChange={(e) => updateEnvVarValue(key, e.target.value)}
                    placeholder="Value"
                    className="flex-1"
                    type={key.toLowerCase().includes('password') ? 'password' : 'text'}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    type="button"
                    onClick={() => removeEnvVar(key)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                type="button"
                onClick={addEnvVar}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Environment Variable
              </Button>
            </div>
            <Button type="submit">
              Update Variables
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Options</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateOptions(); }}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="restart">Restart Policy</Label>
                <Input
                  id="restart"
                  value={restartPolicy}
                  onChange={(e) => setRestartPolicy(e.target.value)}
                  placeholder="Enter restart policy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="network">Network Mode</Label>
                <Input
                  id="network"
                  value={networkMode}
                  onChange={(e) => setNetworkMode(e.target.value)}
                  placeholder="Enter network mode"
                />
              </div>
            </div>
            <Button type="submit">
              Update Options
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Delete Environment</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this environment and all its data
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={handleDeleteEnvironment}
              >
                Delete Environment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}