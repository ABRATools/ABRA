import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Settings, 
  Activity,
  HardDrive,
  Network,
  Clock,
  Box
} from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useMemo } from "react";
import { Node, Environment } from "@/types/machine";

const formatMemory = (bytes: number): string => {
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export default function SystemDetail() {
  const { systemId } = useParams();
  const { data, isConnected, error } = useWebSocket();
  
  // filter nodes that belong to this system
  const systemNodes = useMemo(() => {
    if (!data?.nodes || !systemId) return [];
    
    // if the system ID is 'all-nodes', return all nodes
    if (systemId === 'all-nodes') return data.nodes;

    // the systemId
    const [osName, osVersion] = systemId.split('-');
    
    return data.nodes.filter(

      node => node.os_name === osName && node.os_version === osVersion
    );
  }, [data, systemId]);
  
  // get all environments across all nodes in this system
  const environments = useMemo(() => {
    if (!systemNodes.length) return [];
    return systemNodes.flatMap(node => node.environments || []);
  }, [systemNodes]);
  
  const systemMetrics = useMemo(() => {
    if (!systemNodes.length) return null;
    
    const totalNodes = systemNodes.length;
    const totalContainers = systemNodes.reduce((acc, node) => acc + node.num_containers, 0);
    
    const avgCpuUsage = environments.length 
      ? Math.round(environments.reduce((sum, env) => sum + env.cpu_percentage, 0) / environments.length)
      : 0;
    const avgMemoryUsage = Math.round(
      systemNodes.reduce((sum, node) => sum + node.mem_percent, 0) / totalNodes
    );
    
    return {
      totalNodes,
      totalContainers,
      avgCpuUsage,
      avgMemoryUsage
    };
  }, [systemNodes, environments]);
  
  if (!systemId || !isConnected || error || !data || !systemMetrics) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">System Details</h1>
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
                  <h2 className="text-xl mb-2">System Not Found</h2>
                  <p>The system with ID {systemId} could not be found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // extract the name from the system ID for display
  const [osName, osVersion] = systemId.split('-');
  const systemName = `${osName} ${osVersion}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{systemName}</h1>
          <p className="text-muted-foreground">Operating System: {osName} {osVersion}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/config/systems/${systemId}`}>
            <Settings className="mr-2 h-4 w-4" />
            Configure System
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalNodes}</div>
            <p className="text-xs text-muted-foreground">Active nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Containers</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalContainers}</div>
            <p className="text-xs text-muted-foreground">Running containers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.avgCpuUsage}%</div>
            <p className="text-xs text-muted-foreground">Across all nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.avgMemoryUsage}%</div>
            <p className="text-xs text-muted-foreground">Across all nodes</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">System Nodes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {systemNodes.map((node) => (
            <Card key={node.node_id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{node.node_id}</CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  node.mem_percent < 90 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {node.mem_percent < 90 ? 'healthy' : 'warning'}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">CPU Usage</p>
                      <div className="text-sm">
                        {node.cpu_count} cores
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Memory</p>
                      <div className="text-sm">
                        {formatMemory(node.total_memory * node.mem_percent / 100)}/{formatMemory(node.total_memory)}
                      </div>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/display/systems/${systemId}/nodes/${node.node_id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">System Environments</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {environments.map((env) => {
            // find the node this environment belongs to
            const parentNode = systemNodes.find(node => 
              node.environments?.some(e => e.env_id === env.env_id)
            );
            
            return (
              <Card key={env.env_id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">{env.names[0] || env.env_id}</CardTitle>
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
                      <p className="text-sm text-muted-foreground">Node: {parentNode?.node_id || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        Resources: CPU {env.cpu_percentage.toFixed(2)}%, Memory {env.memory_percent.toFixed(2)}%
                      </p>
                    </div>
                    {parentNode && (
                      <Button asChild className="w-full">
                        <Link to={`/display/systems/${systemId}/nodes/${parentNode.node_id}/environments/${env.env_id}`}>
                          View Details
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}