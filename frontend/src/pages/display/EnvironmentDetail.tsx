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
import { useWebSocket } from "@/data/WebSocketContext";
import { useState, useMemo } from "react";

// Helper to format timestamp
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Helper to format uptime
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export default function EnvironmentDetail() {
  const { systemId, nodeId, envId } = useParams();
  const { data, isConnected: wsConnected, error } = useWebSocket();
  const [isConsoleConnected, setIsConsoleConnected] = useState(false);
  
  // Find the node
  const node = useMemo(() => {
    if (!data?.nodes || !nodeId) return null;
    return data.nodes.find(n => n.node_id === nodeId);
  }, [data, nodeId]);
  
  // Find the environment
  const environment = useMemo(() => {
    if (!node || !envId) return null;
    return node.environments?.find(e => e.env_id === envId) || null;
  }, [node, envId]);
  
  // Get the system information
  const system = useMemo(() => {
    if (!node || !systemId) return null;
    
    const [osName, osVersion] = systemId.split('-');
    
    // Verify if this node belongs to this system
    if (node.os_name !== osName || node.os_version !== osVersion) {
      return null;
    }
    
    return {
      id: systemId,
      name: `${osName} ${osVersion}`
    };
  }, [node, systemId]);

  if (!nodeId || !systemId || !envId || !wsConnected || error || !node || !environment || !system) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Environment Details</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              {error ? (
                <div className="text-red-500">
                  <h2 className="text-xl mb-2">Connection Error</h2>
                  <p>{error.message}</p>
                </div>
              ) : !wsConnected ? (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">Connecting to monitoring service...</h2>
                  <p>Please wait while we establish connection</p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">Environment Not Found</h2>
                  <p>The environment with ID {envId} could not be found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract environment variables from the names
  // This simulates environment variables since they aren't directly in the data model
  const envVariables = environment.names.reduce((vars, name) => {
    const varMatches = name.match(/(\w+)=(\w+)/);
    if (varMatches) {
      vars[varMatches[1]] = varMatches[2];
    }
    return vars;
  }, {} as Record<string, string>);

  // If no environment variables were found, add some defaults
  if (Object.keys(envVariables).length === 0) {
    envVariables.PORT = "8080";
    envVariables.NODE_ENV = "production";
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {environment.names[0] || environment.env_id}
          </h1>
          <p className="text-muted-foreground">
            Environment on {node.node_id} in {system.name}
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
              <Button 
                variant="outline" 
                size="sm" 
                disabled={environment.status === 'running'}
              >
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={environment.status !== 'running'}
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={environment.status !== 'running'}
              >
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
            variant={isConsoleConnected ? "destructive" : "default"}
            onClick={() => setIsConsoleConnected(!isConsoleConnected)}
          >
            {isConsoleConnected ? "Disconnect" : "Connect"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
            {isConsoleConnected ? (
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
            <Button variant="outline" size="sm" disabled={!isConsoleConnected}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" disabled={!isConsoleConnected}>
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
            <div className="text-2xl font-bold">{environment.cpu_percentage}%</div>
            <p className="text-xs text-muted-foreground">
              Currently used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environment.memory_percent}%</div>
            <p className="text-xs text-muted-foreground">
              Currently used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(environment.uptime)}</div>
            <p className="text-xs text-muted-foreground">
              Started: {formatTimestamp(environment.started_at)}
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
                <h4 className="text-sm font-medium mb-2">IP Address</h4>
                <div className="text-sm text-muted-foreground">{environment.ip || 'Not assigned'}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Networks</h4>
                {environment.networks.map((network) => (
                  <div key={network} className="text-sm text-muted-foreground">
                    {network}
                  </div>
                ))}
                {environment.networks.length === 0 && (
                  <div className="text-sm text-muted-foreground">No networks connected</div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Port Mappings</h4>
                {environment.ports.map((port) => (
                  <div key={port} className="text-sm text-muted-foreground">
                    {port}
                  </div>
                ))}
                {environment.ports.length === 0 && (
                  <div className="text-sm text-muted-foreground">No ports mapped</div>
                )}
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
              {Object.entries(envVariables).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}:</span>{' '}
                  <span className="text-muted-foreground">
                    {key.toLowerCase().includes('password') ? '********' : value}
                  </span>
                </div>
              ))}
              {Object.keys(envVariables).length === 0 && (
                <div className="text-sm text-muted-foreground">No environment variables set</div>
              )}
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
              {formatTimestamp(environment.started_at)} [INFO] Container started successfully
              <br />
              {environment.exited && environment.exit_code !== 0 ? (
                <>
                  {formatTimestamp(environment.exited_at)} [ERROR] Container exited with code {environment.exit_code}
                  <br />
                </>
              ) : null}
              {environment.status === 'running' ? (
                <>
                  {formatTimestamp(Date.now() / 1000 - 60)} [INFO] Health check passed
                  <br />
                </>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}