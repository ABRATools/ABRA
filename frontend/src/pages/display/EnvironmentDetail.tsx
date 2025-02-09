import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings,
  Activity,
  HardDrive,
  Network,
  Terminal,
  RefreshCw,
  Play,
  Square,
  RefreshCcw,
  Layers,
  Monitor
} from "lucide-react";
import { testData } from "@/lib/test-data";
import { useState } from "react";

export default function EnvironmentDetail() {
  const { systemId, nodeId, envId } = useParams();
  const environment = testData.environments[envId || ''];
  const node = testData.nodes[nodeId || ''];
  const system = testData.systems.find(s => s.id === systemId);
  const [isConnected, setIsConnected] = useState(false);
  
  if (!environment || !node || !system) {
    return <div>Environment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{environment.name}</h1>
          <p className="text-muted-foreground">
            Environment on {node.name} in {system.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/config/systems/${systemId}/nodes/${nodeId}/environments/${envId}`}>
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                environment.status === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {environment.status}
              </div>
              <p className="text-sm text-muted-foreground">
                Image: {environment.image}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
              <Button variant="outline" size="sm">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Restart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Console Access
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Direct console access to the environment
            </p>
          </div>
          <Button 
            variant={isConnected ? "destructive" : "default"}
            onClick={() => setIsConnected(!isConnected)}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
            {isConnected ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src="about:blank"  // This would be replaced with actual VNC URL
                title="VNC Console"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Click Connect to start console session
                </p>
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" disabled={!isConnected}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" disabled={!isConnected}>
              Full Screen
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environment.resources.cpu} cores</div>
            <p className="text-xs text-muted-foreground">
              Allocated CPU resources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environment.resources.memory} MB</div>
            <p className="text-xs text-muted-foreground">
              Allocated memory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environment.resources.storage} GB</div>
            <p className="text-xs text-muted-foreground">
              Allocated storage
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Network Configuration</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Port Mappings</h4>
                {environment.ports.map((port) => (
                  <div key={port} className="text-sm text-muted-foreground">
                    {port}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Environment Variables</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(environment.variables).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}:</span>{' '}
                  <span className="text-muted-foreground">
                    {key.toLowerCase().includes('password') ? '********' : value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Container Logs</CardTitle>
          <Terminal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md font-mono text-sm h-48 overflow-auto">
            <div className="text-muted-foreground">
              2024-02-06 10:30:15 [INFO] Container started successfully
              <br />
              2024-02-06 10:30:16 [INFO] Initializing application...
              <br />
              2024-02-06 10:30:17 [INFO] Application ready
              <br />
              2024-02-06 10:35:22 [INFO] Health check passed
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}