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
import { testData } from "@/lib/test-data";

export default function SystemDetail() {
  const { systemId } = useParams();
  const system = testData.systems.find(s => s.id === systemId);
  
  if (!system) {
    return <div>System not found</div>;
  }

  const systemNodes = system.nodes.map(nodeId => testData.nodes[nodeId]);
  const environments = systemNodes.flatMap(node => 
    node.environments.map(envId => testData.environments[envId])
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{system.name}</h1>
          <p className="text-muted-foreground">{system.description}</p>
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
            <div className="text-2xl font-bold">{system.nodeCount}</div>
            <p className="text-xs text-muted-foreground">Active nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Containers</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{system.totalContainers}</div>
            <p className="text-xs text-muted-foreground">Running containers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{system.cpuUsage}%</div>
            <p className="text-xs text-muted-foreground">Across all nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{system.memoryUsage}%</div>
            <p className="text-xs text-muted-foreground">Across all nodes</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">System Nodes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {systemNodes.map((node) => (
            <Card key={node.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{node.name}</CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  node.status === 'healthy' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {node.status}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">CPU Usage</p>
                      <div className="text-sm">
                        {node.resources.cpu.used}/{node.resources.cpu.total} cores
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Memory</p>
                      <div className="text-sm">
                        {node.resources.memory.used}/{node.resources.memory.total} GB
                      </div>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/display/systems/${systemId}/nodes/${node.id}`}>
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
          {environments.map((env) => (
            <Card key={env.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{env.name}</CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  env.status === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {env.status}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Type: {env.type}</p>
                    <p className="text-sm text-muted-foreground">Image: {env.image}</p>
                    <p className="text-sm text-muted-foreground">
                      Resources: {env.resources.cpu} cores, {env.resources.memory}MB
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/display/systems/${systemId}/nodes/${env.nodeId}/environments/${env.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}