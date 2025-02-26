import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Server, 
  Settings, 
  Activity,
  HardDrive,
  Box,
  Network 
} from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useMemo } from "react";
import { Node, Environment } from "@/types/machine";

// function to group nodes by systems
const groupNodesBySystems = (nodes: Node[]) => {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    console.warn("No nodes data available for grouping");
    return [];
  }

  console.log("Grouping nodes:", nodes);
  
  const systemGroups: Record<string, {
    id: string;
    name: string;
    status: 'healthy' | 'warning' | 'error';
    nodes: Node[];
  }> = {};

  nodes.forEach(node => {
    // check if node has required properties
    if (!node || !node.os_name) {
      console.warn("Invalid node data:", node);
      return; // skip this node
    }
    
    const osName = node.os_name || 'Unknown';
    const osVersion = node.os_version || 'Unknown';
    const systemId = `${osName}-${osVersion}`;
    
    if (!systemGroups[systemId]) {
      systemGroups[systemId] = {
        id: systemId,
        name: `${osName} ${osVersion}`,
        status: 'healthy',
        nodes: []
      };
    }
    
    systemGroups[systemId].nodes.push(node);
  });

  const processedSystems = Object.values(systemGroups).map(system => {
    const hasError = system.nodes.some(node => node.mem_percent > 95);
    const hasWarning = system.nodes.some(node => node.mem_percent > 80);
    
    system.status = hasError ? 'error' : (hasWarning ? 'warning' : 'healthy');
    
    return system;
  });

  console.log("Grouped systems:", processedSystems);
  return processedSystems;
};


export default function SystemsDisplay() {
  const { data, isConnected, error } = useWebSocket();
  
  const systems = useMemo(() => {
    if (!data || !data.nodes) return [];
    return groupNodesBySystems(data.nodes);
  }, [data]);

  // calculate aggregate metrics
  const totalNodes = useMemo(() => data?.nodes?.length || 0, [data]);
  const totalContainers = useMemo(() => {
    if (!data?.nodes) return 0;
    return data.nodes.reduce((acc, node) => acc + node.num_containers, 0);
  }, [data]);

  const avgCpuUsage = useMemo(() => {
    if (!data?.nodes || data.nodes.length === 0) return 0;
    
    const allEnvironments = data.nodes.flatMap(node => node.environments || []);
    if (allEnvironments.length === 0) return 0;
    
    const totalCpuUsage = allEnvironments.reduce((sum, env) => sum + env.cpu_percentage, 0);
    return Math.round(totalCpuUsage / allEnvironments.length);
  }, [data]);

  const avgMemoryUsage = useMemo(() => {
    if (!data?.nodes || data.nodes.length === 0) return 0;
    
    // get average memory usage per node
    return Math.round(
      data.nodes.reduce((sum, node) => sum + node.mem_percent, 0) / data.nodes.length
    );
  }, [data]);

  if (!isConnected || error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Systems Overview</h1>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Systems Overview</h1>
          <p className="text-muted-foreground">
            Monitor and manage your container systems
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Systems</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systems.length}</div>
            <p className="text-xs text-muted-foreground">
              Active systems
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              Active nodes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Containers</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContainers}</div>
            <p className="text-xs text-muted-foreground">
              Running containers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Resource Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCpuUsage}% CPU</div>
            <p className="text-xs text-muted-foreground">
              {avgMemoryUsage}% Memory
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {systems.map((system) => {
          // calculate system-specific metrics
          const nodeCount = system.nodes.length;
          const totalContainers = system.nodes.reduce((acc, node) => acc + node.num_containers, 0);
          const avgCpuUsage = Math.round(
            system.nodes.reduce((sum, node) => {
              const nodeEnvs = node.environments || [];
              const nodeCpuSum = nodeEnvs.reduce((envSum, env) => envSum + env.cpu_percentage, 0);
              return sum + (nodeEnvs.length > 0 ? nodeCpuSum / nodeEnvs.length : 0);
            }, 0) / (system.nodes.length || 1)
          );
          const avgMemoryUsage = Math.round(
            system.nodes.reduce((sum, node) => sum + node.mem_percent, 0) / system.nodes.length
          );

          return (
            <Card key={system.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {system.name}
                </CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  system.status === 'healthy' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {system.status}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nodes</p>
                        <p className="text-sm font-medium">{nodeCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Containers</p>
                        <p className="text-sm font-medium">{totalContainers}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">CPU Usage</p>
                        <p className="text-sm font-medium">{avgCpuUsage}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Memory Usage</p>
                        <p className="text-sm font-medium">{avgMemoryUsage}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/display/systems/${system.id}`}>View Details</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/config/systems/${system.id}`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}