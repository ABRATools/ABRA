import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings,
  Activity,
  HardDrive,
  Clock,
  Box,
  RefreshCw
} from "lucide-react";
import { testData } from "@/lib/test-data";

export default function NodeDetail() {
  const { systemId, nodeId } = useParams();
  const node = testData.nodes[nodeId || ''];
  const system = testData.systems.find(s => s.id === systemId);
  
  if (!node || !system) {
    return <div>Node not found</div>;
  }

  const nodeEnvironments = node.environments.map(envId => testData.environments[envId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{node.name}</h1>
          <p className="text-muted-foreground">
            Node in {system.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Metrics
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/config/systems/${systemId}/nodes/${nodeId}`}>
              <Settings className="mr-2 h-4 w-4" />
              Configure Node
            </Link>
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
              {Math.round((node.resources.cpu.used / node.resources.cpu.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {node.resources.cpu.used}/{node.resources.cpu.total} cores
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
              {Math.round((node.resources.memory.used / node.resources.memory.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {node.resources.memory.used}/{node.resources.memory.total} GB
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
              {Math.round((node.resources.storage.used / node.resources.storage.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {node.resources.storage.used}/{node.resources.storage.total} GB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{node.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(node.lastUpdated).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Environments</h2>
          <Button variant="outline">
            <Box className="mr-2 h-4 w-4" />
            Add Environment
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nodeEnvironments.map((env) => (
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
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">CPU</p>
                        <p className="text-sm">{env.resources.cpu} cores</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Memory</p>
                        <p className="text-sm">{env.resources.memory} MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/display/systems/${systemId}/nodes/${nodeId}/environments/${env.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/config/systems/${systemId}/nodes/${nodeId}/environments/${env.id}`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}