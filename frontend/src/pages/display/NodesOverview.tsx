import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/data/WebSocketContext";
import { Server, Activity, HardDrive, Box, Container } from "lucide-react";

export default function NodesOverview() {
  const { data, isConnected, error } = useWebSocket();
  
  // Get all nodes from WebSocketContext
  const nodes = data?.nodes || [];

  // Calculate aggregate metrics
  const totalNodes = nodes.length;
  const totalContainers = useMemo(() => {
    return nodes.reduce((sum, node) => sum + node.num_containers, 0);
  }, [nodes]);

  const avgCpuUsage = useMemo(() => {
    if (nodes.length === 0) return 0;
    
    const allEnvironments = nodes.flatMap(node => node.environments || []);
    if (allEnvironments.length === 0) return 0;
    
    const totalCpuUsage = allEnvironments.reduce((sum, env) => sum + env.cpu_percentage, 0);
    return Math.round((totalCpuUsage / allEnvironments.length) * 100) / 100;
  }, [nodes]);

  const avgMemoryUsage = useMemo(() => {
    if (nodes.length === 0) return 0;
    
    return Math.round(
      nodes.reduce((sum, node) => sum + node.mem_percent, 0) / nodes.length
    );
  }, [nodes]);

  if (!isConnected || error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Nodes Overview</h1>
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nodes Overview</h1>
        <p className="text-muted-foreground">
          Monitor and manage your connected nodes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              Connected nodes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Containers</CardTitle>
            <Container className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContainers}</div>
            <p className="text-xs text-muted-foreground">
              Across all nodes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCpuUsage}%</div>
            <p className="text-xs text-muted-foreground">
              Across all containers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMemoryUsage}%</div>
            <p className="text-xs text-muted-foreground">
              Across all nodes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Nodes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nodes.map((node) => {
            const runningContainers = (node.environments || []).filter(env => env.state === 'running').length;
            const nodeStatus = node.mem_percent > 90 ? 'error' : 
                            node.mem_percent > 75 ? 'warning' : 'healthy';
            
            return (
              <Card key={node.node_id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">{node.node_id}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${
                    nodeStatus === 'error' ? 'bg-red-500' : 
                    nodeStatus === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {node.os_name} {node.os_version}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        IP: {node.ip_address}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Memory</p>
                          <p className="text-sm font-medium">{node.mem_percent.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Containers</p>
                          <p className="text-sm font-medium">{node.num_containers} ({runningContainers} running)</p>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link to={`/nodes/${node.node_id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {nodes.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>No nodes connected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}