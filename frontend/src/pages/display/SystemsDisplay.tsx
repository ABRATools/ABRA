import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Server, 
  Settings, 
  Activity,
  HardDrive,
  Box,
  Network,
  PlusCircle
} from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useMemo, useState, useEffect } from "react";
import { Node, Environment, System } from "@/types/machine";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const groupNodesBySystems = (nodes : Node[], customSystems: System[] = []) => {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    // Return just the custom systems if they exist, but with zero nodes
    if (customSystems.length > 0) {
      return customSystems.map(system => ({
        ...system,
        nodeCount: 0,
        totalContainers: 0,
        nodes: []
      }));
    }
    return [];
  }
  
  // Start with the "all-nodes" system and any custom systems
  const systemGroups: { [systemId: string] : System; } = {
    'all-nodes': {
      id: 'all-nodes',
      name: 'All Nodes',
      status: 'healthy',
      nodeCount: 0,
      totalContainers: 0,
      nodes: [],
      environments: []
    }
  };
  
  // Add custom systems to the map
  customSystems.forEach(system => {
    systemGroups[system.id] = {
      ...system,
      nodeCount: 0,
      totalContainers: 0,
      nodes: [],
      environments: []
    };
  });

  // First collect all environments from all nodes
  const allEnvironments: Environment[] = [];
  
  nodes.forEach(node => {
    if (!node || !node.environments) return;
    
    // Add node to all-nodes system
    if (!systemGroups['all-nodes'].nodes.includes(node)) {
      systemGroups['all-nodes'].nodes.push(node);
      systemGroups['all-nodes'].nodeCount++;
      systemGroups['all-nodes'].totalContainers += node.num_containers || 0;
    }
    
    // Add environments to the global list
    node.environments.forEach(env => {
      // Add reference to which node this environment is on
      const enhancedEnv = { ...env, sourceNode: node };
      allEnvironments.push(enhancedEnv);
      
      // Add to all-nodes system's environments
      systemGroups['all-nodes'].environments.push(enhancedEnv);
    });
  });
  
  // For custom systems, add matching environments
  Object.values(systemGroups).forEach(system => {
    if (system.id === 'all-nodes' || !system.isCustom) return;
    
    // Custom logic to match environments to this system
    if (system.environments && Array.isArray(system.environments)) {
      // Get both environment IDs and names for matching
      const envIds = system.environments.map(e => e.env_id);
      
      // Get names from either the name property or the names array
      const envNames = [];
      
      system.environments.forEach(e => {
        // Get names from the names array if it exists
        if (e.names && e.names.length > 0) {
          envNames.push(...e.names);
        } 
        // Also use the name property if it exists
        if (e.name) {
          envNames.push(e.name);
        }
      });
      
      // Debug
      console.log(`Custom system ${system.name} is looking for env IDs:`, envIds);
      console.log(`Custom system ${system.name} is looking for env names:`, envNames);
      
      // Match by either environment ID or container name with more flexible matching
      system.environments = allEnvironments.filter(env => {
        // Match by env_id (exact match)
        if (envIds.includes(env.env_id)) {
          console.log(`Matched environment ${env.env_id} by ID in system ${system.name}`);
          return true;
        }
        
        // Match by container name (exact match of any name)
        if (env.names && env.names.length > 0) {
          const hasMatch = env.names.some(name => envNames.includes(name));
          if (hasMatch) {
            console.log(`Matched environment ${env.env_id} by name "${env.names}" in system ${system.name}`);
            return true;
          }
        }
        
        // For environments without explicit matches, try substring matching
        // This helps with partial IDs and name fragments
        if (env.names && env.names.length > 0) {
          // Check if any environment name contains any name from envNames
          const substringMatch = env.names.some(envName => 
            envNames.some(name => 
              // Case insensitive substring match
              envName.toLowerCase().includes(name.toLowerCase()) || 
              name.toLowerCase().includes(envName.toLowerCase())
            )
          );
          
          if (substringMatch) {
            console.log(`Matched environment ${env.env_id} by substring name "${env.names}" in system ${system.name}`);
            return true;
          }
        }
        
        // If env_id is a string (like a hash), check for substring matches
        if (typeof env.env_id === 'string' && env.env_id.length > 10) {
          const idMatch = envIds.some(id => 
            env.env_id.includes(id) || (typeof id === 'string' && id.includes(env.env_id))
          );
          
          if (idMatch) {
            console.log(`Matched environment ${env.env_id} by ID substring in system ${system.name}`);
            return true;
          }
        }
        
        return false;
      });
      
      // Debug the matched environments
      console.log(`Custom system ${system.name} matched environments:`, 
        system.environments.map(e => ({id: e.env_id, names: e.names}))
      );
      
      // Add the source nodes to this system too
      system.environments.forEach(env => {
        // @ts-ignore - sourceNode is added dynamically
        const sourceNode = env.sourceNode;
        if (sourceNode && !system.nodes.some(n => n.node_id === sourceNode.node_id)) {
          system.nodes.push(sourceNode);
          system.nodeCount++;
        }
      });
      
      system.totalContainers = system.environments.length;
    }
  });
  
  // Calculate status for each system
  const processedSystems = Object.values(systemGroups).map(system => {
    // Status based on node health
    let nodeStatus: Status = 'healthy';
    const hasNodeError = system.nodes.some(node => node.mem_percent > 95);
    const hasNodeWarning = system.nodes.some(node => node.mem_percent > 80);
    if (hasNodeError) nodeStatus = 'error';
    else if (hasNodeWarning) nodeStatus = 'warning';
    
    // Status based on environment health
    let envStatus: Status = 'healthy';
    const hasEnvError = system.environments.some(env => env.state === 'error');
    const hasEnvWarning = system.environments.some(env => env.state !== 'running' && env.state !== 'error');
    if (hasEnvError) envStatus = 'error';
    else if (hasEnvWarning) envStatus = 'warning';
    
    // Use the more severe status
    system.status = nodeStatus === 'error' || envStatus === 'error' ? 'error' : 
                    (nodeStatus === 'warning' || envStatus === 'warning' ? 'warning' : 'healthy');
    
    return system;
  });

  return processedSystems;
};


export default function SystemsDisplay() {
  const { data, isConnected, error } = useWebSocket();
  const { toast } = useToast();
  const [customSystems, setCustomSystems] = useState<System[]>([]);
  const [newSystemDialogOpen, setNewSystemDialogOpen] = useState(false);
  const [newSystem, setNewSystem] = useState<{
    name: string;
    environmentIds: string[];
  }>({
    name: '',
    environmentIds: []
  });
  
  // Get all available environments for selection
  const allEnvironments = useMemo(() => {
    if (!data?.nodes) return [];
    return data.nodes.flatMap(node => 
      (node.environments || []).map(env => ({
        ...env,
        nodeId: node.node_id
      }))
    );
  }, [data]);
  
  // Load custom systems on initial render and whenever location changes
  const fetchCustomSystems = async () => {
    try {
      console.log('Fetching custom systems from API');
      // Fetch systems from API
      const systemsResponse = await fetch('/api/systems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (systemsResponse.ok) {
        const data = await systemsResponse.json();
        // Filter out only custom systems from database
        const databaseSystems = data.systems.filter(
          (sys: any) => sys.is_custom && sys.source === 'database'
        );
        console.log('Loaded database systems:', databaseSystems);
        
        // Map API response to our System type
        const mappedSystems = databaseSystems.map((sys: any) => ({
          id: sys.system_id,
          name: sys.name,
          description: sys.description || '',
          status: 'healthy',
          nodeCount: 0, // Will be calculated based on nodes
          totalContainers: sys.environments.length,
          environments: sys.environments.map((env: any) => ({
            env_id: env.env_id,
            name: env.name,
            status: env.status,
            state: env.status || 'unknown',
            ip: env.ip || '',
            networks: [],
            ports: [],
            image: '',
            names: [env.name],
            started_at: 0,
            exited: false,
            exit_code: 0,
            exited_at: 0,
            cpu_percentage: 0,
            memory_percent: 0,
            uptime: 0,
            sourceNode: {
              node_id: env.node_id,
              name: env.node_name
            }
          })),
          nodes: [], // Will be populated later
          isCustom: true,
          source: 'database'
        }));
        
        // Update state
        setCustomSystems(mappedSystems);
      }
    } catch (error) {
      console.error('Error fetching systems:', error);
    }
  };
  
  // Load custom systems on initial render
  useEffect(() => {
    fetchCustomSystems();
    
    // Setup refresh interval - poll every 30 seconds to ensure systems stay in sync
    const refreshInterval = setInterval(() => {
      fetchCustomSystems();
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Define a function to refresh systems that can be called after operations
  const refreshSystems = () => {
    fetchCustomSystems();
  };
  
  const systems = useMemo(() => {
    if (!data || !data.nodes) return [];
    const processedSystems = groupNodesBySystems(data.nodes, customSystems);
    return processedSystems;
  }, [data, customSystems]);

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
  
  const handleCreateSystem = async () => {
    if (!newSystem.name) {
      toast({
        title: "Error",
        description: "System name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (newSystem.environmentIds.length === 0) {
      toast({
        title: "Error",
        description: "At least one environment must be selected",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Call backend API to create the system
      // Create a stable, predictable ID format based on name and timestamp
      const timestamp = Date.now();
      const systemId = `custom-${newSystem.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
      
      // Make API call to create system
      const response = await fetch('/api/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_id: systemId,
          name: newSystem.name,
          description: '',
          is_custom: true,
          // Send as-is, backend will handle finding correct environments
          environment_ids: newSystem.environmentIds
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create system');
      }
      
      // Get the system from API response
      const responseData = await response.json();
      
      // get environments for immediate ui display
      // Include the complete environment objects for matching later
      const selectedEnvironments = allEnvironments.filter(env => 
        newSystem.environmentIds.includes(env.env_id)
      );
      
      // create system object for local state update with proper source
      const newCustomSystem: System = {
        id: systemId,
        name: newSystem.name,
        description: '',
        status: 'healthy',
        nodeCount: 0,
        totalContainers: selectedEnvironments.length,
        nodes: [],
        environments: selectedEnvironments,
        isCustom: true,
        source: 'database'
      };
      
      // Get the ID from the response if available, otherwise use our generated one
      const createdSystemId = responseData?.system_id || systemId;
      
      // Use our refreshSystems function to get the latest data
      refreshSystems();
      
      // Add a slight delay to ensure the backend has time to process
      setTimeout(() => {
        refreshSystems();
      }, 500); // 500ms should be enough for most backend operations
      
      setNewSystemDialogOpen(false);
      setNewSystem({ name: '', environmentIds: [] });
      
      toast({
        title: "Success",
        description: `Created new system "${newSystem.name}" with ${selectedEnvironments.length} environments`,
      });
    } catch (error: any) {
      console.error('Error creating system:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create system',
        variant: "destructive"
      });
    }
  };

  // Environment selection component for the dialog
  const EnvironmentSelector = () => {
    // Group environments by their source node for better organization
    const groupedEnvironments = useMemo(() => {
      const groups: Record<string, typeof allEnvironments> = {};
      
      allEnvironments.forEach(env => {
        const nodeId = env.nodeId || 'unknown';
        if (!groups[nodeId]) {
          groups[nodeId] = [];
        }
        groups[nodeId].push(env);
      });
      
      return groups;
    }, [allEnvironments]);
    
    const toggleEnvironment = (envId: string) => {
      if (newSystem.environmentIds.includes(envId)) {
        setNewSystem(prev => ({
          ...prev,
          environmentIds: prev.environmentIds.filter(id => id !== envId)
        }));
      } else {
        setNewSystem(prev => ({
          ...prev,
          environmentIds: [...prev.environmentIds, envId]
        }));
      }
    };
    
    return (
      <div className="max-h-[300px] overflow-y-auto pr-2">
        {Object.entries(groupedEnvironments).map(([nodeId, environments]) => (
          <div key={nodeId} className="mb-4">
            <h3 className="font-medium mb-2">Node: {nodeId}</h3>
            <div className="space-y-2">
              {environments.map(env => (
                <div key={env.env_id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={env.env_id}
                    checked={newSystem.environmentIds.includes(env.env_id)}
                    onChange={() => toggleEnvironment(env.env_id)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={env.env_id} className="text-sm flex-1">
                    {env.names[0] || env.env_id} ({env.image})
                  </label>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    env.state === 'running' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {env.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedEnvironments).length === 0 && (
          <p className="text-sm text-muted-foreground">No environments available</p>
        )}
      </div>
    );
  };

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
        {/* Add New System Button */}
        <Dialog open={newSystemDialogOpen} onOpenChange={setNewSystemDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New System
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New System</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">System Name</Label>
                <Input
                  id="name"
                  value={newSystem.name}
                  onChange={(e) => setNewSystem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter system name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Select Environments</Label>
                <EnvironmentSelector />
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {newSystem.environmentIds.length} environments
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateSystem}>
                Create System
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* md:grid-cols-2 lg:grid-cols-3 */}
      <div className="grid gap-6">
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