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
import { testData } from "@/lib/test-data";

export default function SystemsDisplay() {
  const { systems } = testData;
  const totalContainers = systems.reduce((acc, sys) => acc + sys.totalContainers, 0);
  const totalNodes = systems.reduce((acc, sys) => acc + sys.nodeCount, 0);
  const avgCpuUsage = Math.round(
    systems.reduce((acc, sys) => acc + sys.cpuUsage, 0) / systems.length
  );
  const avgMemoryUsage = Math.round(
    systems.reduce((acc, sys) => acc + sys.memoryUsage, 0) / systems.length
  );

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
        {systems.map((system) => (
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
                      <p className="text-sm font-medium">{system.nodeCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Containers</p>
                      <p className="text-sm font-medium">{system.totalContainers}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">CPU Usage</p>
                      <p className="text-sm font-medium">{system.cpuUsage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Memory Usage</p>
                      <p className="text-sm font-medium">{system.memoryUsage}%</p>
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
        ))}
      </div>
    </div>
  );
}