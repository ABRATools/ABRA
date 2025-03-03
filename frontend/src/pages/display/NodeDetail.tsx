import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/data/WebSocketContext";
import {Settings, Activity, HardDrive, Clock, Box, RefreshCw} from "lucide-react";

import CreateNewContainer from "@/pages/display/CreateNewContainer";

const formatMemory = (bytes: number): string => {
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatUptime = (timestamp: number): string => {
  const now = Date.now() / 1000;
  const seconds = now - timestamp;
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

export default function NodeDetail() {
  const { systemId, nodeId } = useParams();
  const { data, isConnected, error } = useWebSocket();

  // find the node that matches the nodeId
  const node = useMemo(() => {
    if (!data?.nodes || !nodeId) return null;
    return data.nodes.find(n => n.node_id === nodeId);
  }, [data, nodeId]);

  // get the system information
  const system = useMemo(() => {
    if (!node || !systemId) return null;
    
    return {
      id: systemId,
      name: node.node_id,
    };
  }, [node, systemId]);

  // get environments for this node
  const nodeEnvironments = useMemo(() => {
    if (!node) return [];
    return node.environments || [];
  }, [node]);

  if (!nodeId || !systemId || !isConnected || error || !node || !system) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Node Details</h1>
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
                  <h2 className="text-xl mb-2">Node Not Found</h2>
                  <p>The node with ID {nodeId} could not be found in system {systemId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cpuUsagePercent = nodeEnvironments.length
    ? Math.round(nodeEnvironments.reduce((sum, env) => sum + env.cpu_percentage, 0) / nodeEnvironments.length)
    : 0;
  
  const um = node.total_memory * (node.mem_percent / 100);
  const usedMemory = parseFloat(um.toFixed(2));
  const tm = node.total_memory;
  const totalMemory = parseFloat(tm.toFixed(2));
  
  // This is a placeholder, real implementation would depend on actual data available
  const storageUsed = 100; // GB
  const storageTotal = 500; // GB
  const storagePercent = Math.round((storageUsed / storageTotal) * 100);

  const avgUptime = nodeEnvironments.length
    ? Math.round(nodeEnvironments.reduce((sum, env) => sum + env.started_at, 0) / nodeEnvironments.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{node.node_id}</h1>
          <p className="text-muted-foreground">
            Node in {system.id}
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
              {cpuUsagePercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {node.cpu_count} cores available
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
              {node.mem_percent.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatMemory(usedMemory)}/{formatMemory(totalMemory)}
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
              {storagePercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {storageUsed}/{storageTotal} GB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(avgUptime)}</div>
            <p className="text-xs text-muted-foreground">
              Average container uptime
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Environments</h2>
          <CreateNewContainer />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nodeEnvironments.map((env) => (
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
                    <p className="text-sm text-muted-foreground">
                      Networks: {env.networks.join(', ') || 'None'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">CPU</p>
                        <p className="text-sm">{env.cpu_percentage.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Memory</p>
                        <p className="text-sm">{env.memory_percent.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/display/systems/${systemId}/nodes/${nodeId}/environments/${env.env_id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/config/systems/${systemId}/nodes/${nodeId}/environments/${env.env_id}`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {nodeEnvironments.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>No environments found on this node</p>
              <Button variant="outline" className="mt-4">
                <Box className="mr-2 h-4 w-4" />
                Add First Environment
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">System Information</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Hardware</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">CPU Cores:</span>
                    <span className="text-sm font-medium">{node.cpu_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Memory:</span>
                    <span className="text-sm font-medium">{formatMemory(node.total_memory)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Containers:</span>
                    <span className="text-sm font-medium">{node.num_containers}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Operating System</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">OS:</span>
                    <span className="text-sm font-medium">{node.os_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Version:</span>
                    <span className="text-sm font-medium">{node.os_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Node ID:</span>
                    <span className="text-sm font-medium">{node.node_id}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}