import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Server, Settings, HardDrive } from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useToast } from "@/hooks/use-toast";

export default function SystemConfigDetail() {
  const { systemId } = useParams();
  const { data, isConnected, error } = useWebSocket();
  const { toast } = useToast();
  
  // form state
  const [systemName, setSystemName] = useState("");
  const [systemDescription, setSystemDescription] = useState("");
  const [maxNodes, setMaxNodes] = useState(10);
  const [maxContainers, setMaxContainers] = useState(50);
  
  // get system nodes
  const systemNodes = useMemo(() => {
    if (!data?.nodes || !systemId) return [];
    
    // the systemId
    const [osName, osVersion] = systemId.split('-');
    
    return data.nodes.filter(
      node => node.os_name === osName && node.os_version === osVersion
    );
  }, [data, systemId]);
  
  // get system information
  const system = useMemo(() => {
    if (!systemNodes.length || !systemId) return null;
    
    const [osName, osVersion] = systemId.split('-');
    
    return {
      id: systemId,
      name: `${osName} ${osVersion}`,
      description: `${osName} ${osVersion} system`,
      nodeCount: systemNodes.length,
      totalContainers: systemNodes.reduce((acc, node) => acc + (node.num_containers || 0), 0)
    };
  }, [systemNodes, systemId]);
  
  useMemo(() => {
    if (system) {
      setSystemName(system.name);
      setSystemDescription(system.description || "");
    }
  }, [system]);
  
  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: "System configuration has been updated",
    });
  };
  
  const handleUpdateLimits = () => {
    toast({
      title: "Limits Updated",
      description: "System resource limits have been updated",
    });
  };
  
  if (!isConnected || error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Configure System</h1>
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
  
  if (!system) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Configure System</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <h2 className="text-xl mb-2">System Not Found</h2>
              <p>The system with ID {systemId} could not be found</p>
              <Button className="mt-4" asChild>
                <Link to="/config/systems">Return to Systems</Link>
              </Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Configure System</h1>
          <p className="text-muted-foreground">
            Configure {system.name} settings and resources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/display/systems/${systemId}`}>
              View System
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">System Name</Label>
                <Input
                  id="name"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="Enter system name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={systemDescription}
                  onChange={(e) => setSystemDescription(e.target.value)}
                  placeholder="Enter system description"
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
          <CardTitle>Resource Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateLimits(); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxNodes">Maximum Nodes</Label>
                <Input
                  id="maxNodes"
                  type="number"
                  value={maxNodes}
                  onChange={(e) => setMaxNodes(parseInt(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxContainers">Maximum Containers</Label>
                <Input
                  id="maxContainers"
                  type="number"
                  value={maxContainers}
                  onChange={(e) => setMaxContainers(parseInt(e.target.value))}
                  min={1}
                />
              </div>
            </div>
            <Button type="submit">
              Update Limits
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">System Nodes</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </Button>
        </div>
        {systemNodes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemNodes.map((node) => (
              <Card key={node.node_id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">{node.node_id}</CardTitle>
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            node.mem_percent < 80 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {node.mem_percent < 80 ? 'healthy' : 'warning'}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Containers</p>
                          <p className="text-sm">{node.num_containers || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/config/systems/${systemId}/nodes/${node.node_id}`}>
                          Configure Node
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={`/display/systems/${systemId}/nodes/${node.node_id}`}>
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
                <p>No nodes found in this system.</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Node
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}