import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Server, Settings } from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { Node, System } from "@/types/machine";

// helper for goruping nodes
const groupNodesBySystems = (nodes : Node[]) => {
  const [sysIds, setSysIds] = useState<string[]>([]);
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return [];
  }
  // default 'all' system
  const systemGroups: { [systemId: string] : System; } = {
    'all': {
      id: 'all',
      name: 'All Systems',
      status: 'healthy',
      nodeCount: 0,
      totalContainers: 0,
      nodes: []
    }
  };

  nodes.forEach(node => {
    if (!node || !node.os_name) return;
    
    const osName = node.os_name || 'Unknown';
    const osVersion = node.os_version || 'Unknown';
    const systemId = `${osName}-${osVersion}`;
    
    sysIds.forEach(sysid => {
      if (!systemGroups[sysid]) {
        systemGroups[sysid] = {
          id: systemId,
          name: `${osName} ${osVersion}`,
          status: 'healthy',
          nodeCount: 0,
          totalContainers: 0,
          nodes: []
        };
      }
    });
    
    var allSystemNodeList = systemGroups['all'].nodes;
    if (!allSystemNodeList.includes(node)) {
      allSystemNodeList.push(node);
      systemGroups['all'].nodeCount++;
      systemGroups['all'].totalContainers += node.num_containers || 0;
      if (node.mem_percent > 90) {
        systemGroups['all'].status = 'warning';
      }
    }
  });

  console.log(systemGroups);
  return Object.values(systemGroups);
};

export default function SystemsConfig() {
  const { data, isConnected, error } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState("");
  
  // group nodes
  const systems = useMemo(() => {
    if (!data || !data.nodes) return [];
    return groupNodesBySystems(data.nodes);
  }, [data]);

  // filter systems by search
  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return systems;
    
    return systems.filter(system => 
      system.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [systems, searchQuery]);
  
  if (!isConnected || error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Systems Configuration</h1>
            <p className="text-muted-foreground">
              Configure and manage your systems
            </p>
          </div>
        </div>
        
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
          <h1 className="text-3xl font-bold tracking-tight">Systems Configuration</h1>
          <p className="text-muted-foreground">
            Configure and manage your systems
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add System
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search systems..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredSystems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSystems.map((system) => (
            <Card key={system.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {system.name}
                </CardTitle>
                <Server className="h-5 w-5 text-muted-foreground" />
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
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          system.status === 'healthy' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {system.status}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/config/systems/${system.id}`}>Configure System</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/display/systems/${system.id}`}>
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
              {searchQuery ? (
                <p>No systems found matching your search.</p>
              ) : (
                <p>No systems found. Add a new system to get started.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}