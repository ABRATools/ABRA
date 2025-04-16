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
import { useMemo, useState, useEffect, useRef } from "react";
import { Node, Environment, System } from "@/types/machine";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Update the groupNodesBySystems function to properly match environments by container ID

const groupNodesBySystems = (nodes: Node[], customSystems: System[] = []) => {
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
  const systemGroups: { [systemId: string]: System; } = {
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
  
  // Add custom systems to the map - PRESERVE THEIR ENVIRONMENTS!
  customSystems.forEach(system => {
    console.log(`Processing system ${system.id} with ${system.environments?.length || 0} environments`);
    
    // Debug environment container IDs
    if (system.environments && system.environments.length > 0) {
      system.environments.forEach(env => {
        if (env.container_id) {
          console.log(`System ${system.id} has environment with container_id: ${env.container_id}`);
        }
      });
    }
    
    systemGroups[system.id] = {
      ...system,
      nodeCount: 0,
      totalContainers: system.environments?.length || 0,
      nodes: [],
      // CRITICAL: Keep the original environments array with container_ids
      environments: system.environments || []
    };
  });

  // First collect all environments from all nodes and map them by container ID
  const allEnvironments: Environment[] = [];
  const environmentsByContainerId: { [containerId: string]: Environment } = {};
  
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
      // Skip if no container ID (env_id)
      if (!env.env_id) return;
      
      // Add reference to which node this environment is on
      const enhancedEnv = { 
        ...env, 
        sourceNode: node,
        // The env_id is the container ID in the WebSocket data
        container_id: env.env_id 
      };
      
      // Add to global list and map by container ID
      allEnvironments.push(enhancedEnv);
      environmentsByContainerId[env.env_id] = enhancedEnv;
      
      // Add to all-nodes system's environments
      systemGroups['all-nodes'].environments.push(enhancedEnv);
    });
  });
  
  // For custom systems, match environments by container ID
  Object.values(systemGroups).forEach(system => {
    if (system.id === 'all-nodes' || !system.isCustom) return;
    
    console.log(`Matching environments for system ${system.id}`);
    
    // Create a list for the matched live environments (from WebSocket)
    const matchedEnvironments: Environment[] = [];
    
    // Track which nodes are used by the environments in this system
    const usedNodeIds = new Set<string>();
    
    // Match environments by container ID
    if (system.environments && Array.isArray(system.environments)) {
      system.environments.forEach(dbEnv => {
        // Skip if no container ID
        if (!dbEnv.container_id) {
          console.log(`Environment in system ${system.id} has no container_id`);
          return;
        }
        
        // Find matching live environment by container ID
        const liveEnv = environmentsByContainerId[dbEnv.container_id];
        
        if (liveEnv) {
          console.log(`MATCH! Found live environment with container_id ${dbEnv.container_id}`);
          matchedEnvironments.push(liveEnv);
          
          // Track the node this environment is on
          if (liveEnv.sourceNode) {
            usedNodeIds.add(liveEnv.sourceNode.node_id);
          }
        } else {
          console.log(`No match found for container_id ${dbEnv.container_id}`);
          
          // Keep the database environment if there's no matching live environment
          // This preserves environments that might be temporarily down
          matchedEnvironments.push(dbEnv);
        }
      });
    }
    
    // Debug the matched environments
    console.log(`System ${system.name} matched ${matchedEnvironments.length} environments`);
    
    // Replace system's environments with matched live environments
    system.environments = matchedEnvironments;
    
    // Build nodes list from the matched environments
    system.nodes = nodes.filter(node => usedNodeIds.has(node.node_id));
    system.nodeCount = system.nodes.length;
    system.totalContainers = matchedEnvironments.length;
  });
  
  // Calculate status for each system based on node and environment health
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
    environmentIds: string[]; // Now contains stringified JSON objects with container and node IDs
  }>({
    name: '',
    environmentIds: []
  });
  
  // Get all available environments for selection but with stable references
  const allEnvironments = useMemo(() => {
    if (!data?.nodes) return [];
    
    // Use a stable key for environments to prevent unnecessary re-renders
    return data.nodes.flatMap(node => 
      (node.environments || []).map(env => ({
        ...env,
        nodeId: node.node_id,
        // Add these properties for stable rendering 
        key: `${node.node_id}-${env.env_id}`
      }))
    );
  }, [data?.nodes?.length, data?.nodes?.map(n => n.node_id).join(',')]);
  
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
        console.log('FULL API RESPONSE:', data);
        
        // Filter out only custom systems from database
        const databaseSystems = data.systems.filter(
          (sys: any) => sys.is_custom && sys.source === 'database'
        );
        console.log('Loaded database systems:', databaseSystems);
        
        // CRITICAL DEBUG: Analyze each database system in detail
        databaseSystems.forEach((sys: any) => {
          console.log(`RAW SYSTEM DATA FOR ${sys.system_id}:`, JSON.stringify(sys, null, 2));
          console.log(`System ${sys.system_id} has environments array:`, 
                     sys.environments ? `YES (${sys.environments.length} items)` : 'NO');
          
          if (sys.environments && sys.environments.length > 0) {
            console.log(`First environment in system ${sys.system_id}:`, sys.environments[0]);
          }
        });
        
        // Map API response to our System type
        console.log("Raw database systems:", databaseSystems);
        
        const mappedSystems = databaseSystems.map((sys: any) => {
          // Special case handling: If no environments, log warning and create empty array
          if (!sys.environments || !Array.isArray(sys.environments) || sys.environments.length === 0) {
            console.warn(`System ${sys.system_id} has no environments!`);
            sys.environments = [];
          }
          
          // Log each raw environment
          console.log(`System ${sys.system_id} raw environments:`, sys.environments);
          
          const mappedEnvironments = sys.environments.map((env: any) => {
            if (!env) {
              console.warn("Found null environment in system", sys.system_id);
              return null;
            }
            
            // Store container_id directly from backend - critical for matching
            const container_id = env.container_id;
            
            // Log any container_id we find with clear identification
            if (container_id) {
              console.log(`IMPORTANT MATCH DATA - container_id in DB: ${container_id} for env_id ${env.env_id}`);
            }
            
            // Create names array for secondary matching
            const names = [];
            // Include actual name
            if (env.name) names.push(env.name);
            // Include env_id as a possible name match
            if (env.env_id) names.push(String(env.env_id));
            
            // Return full environment object with all fields preserved
            return {
              env_id: env.env_id,
              name: env.name,
              status: env.status,
              state: env.status || 'unknown',
              ip: env.ip || '',
              networks: [],
              ports: [],
              image: '',
              names: names,
              started_at: 0,
              exited: false,
              exit_code: 0,
              exited_at: 0,
              cpu_percentage: 0,
              memory_percent: 0,
              uptime: 0,
              container_id: container_id, // Directly use container_id from backend
              sourceNode: {
                node_id: env.node_id,
                name: env.node_name
              }
            };
          }).filter(env => env !== null); // Filter out any null environments
          
          // Build full system object with careful environment handling
          const systemObj = {
            id: sys.system_id,
            name: sys.name,
            description: sys.description || '',
            status: 'healthy',
            nodeCount: 0, // Will be calculated based on nodes
            totalContainers: mappedEnvironments.length,
            environments: mappedEnvironments,
            nodes: [], // Will be populated later
            isCustom: true,
            source: 'database'
          };
          
          console.log(`Created mapped system: ${sys.system_id} with ${mappedEnvironments.length} environments`, 
                     {envIds: mappedEnvironments.map(e => e.env_id),
                      containerIds: mappedEnvironments.map(e => e.container_id)});
                      
          return systemObj;
        });
        
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
      // Create a stable ID format
      const timestamp = Date.now();
      const systemId = `custom-${newSystem.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
      
      // Parse the selected environments with all context intact
      const parsedEnvironments = newSystem.environmentIds.map(item => {
        const envData = JSON.parse(item);
        
        // DEBUG: Log each environment being added
        console.log('Adding environment to system:', envData);
        
        return {
          // CRITICAL: The container_id must match env_id from WebSocket data
          container_id: envData.containerId,
          // Include env_id from WebSocket
          env_id: envData.containerId,
          // Include node context
          node_id: envData.nodeId,
          // Include a friendly name
          name: envData.name || `Container-${envData.containerId.substring(0, 8)}`,
          // Default values for other required fields
          ip: "",
          os: "undefined",
          status: "pending"
        };
      });
      
      console.log("Full environment data to send to API:", parsedEnvironments);
      
      // Make API call with the container ID-based environment data
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
          // Send the complete environment objects
          environments: parsedEnvironments
        })
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "System created successfully",
          variant: "default"
        });
        
        // Clear the form and close dialog
        setNewSystem({
          name: '',
          environmentIds: []
        });
        setNewSystemDialogOpen(false);
        
        // Refresh systems list
        refreshSystems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create system');
      }
    } catch (error) {
      console.error('Error creating system:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create system',
        variant: "destructive"
      });
    }
  };
  
  // Update the EnvironmentSelector component to make environment selection more robust
  const EnvironmentSelector = () => {
    // Organize environments by node for better display
    const nodeGroups = {};
    
    allEnvironments.forEach(env => {
      const nodeId = env.nodeId || 'unknown';
      if (!nodeGroups[nodeId]) {
        nodeGroups[nodeId] = [];
      }
      nodeGroups[nodeId].push(env);
    });
    
    return (
      <div 
        className="overflow-y-auto pr-2 border rounded-md"
        style={{ height: '300px' }}
      >
        {Object.entries(nodeGroups).map(([nodeId, environments]) => (
          <div key={nodeId} className="mb-4 p-2">
            <h3 className="font-medium mb-2">Node: {nodeId}</h3>
            <div className="space-y-2">
              {environments.map(env => {
                // IMPORTANT: Use container ID (env_id) as the primary identifier
                const containerId = env.env_id;
                // Create a display value that shows the node and environment name
                const displayName = `${env.names?.[0] || 'unnamed'} (${nodeId})`;
                
                // DEBUG: Log environment details
                console.log(`Environment selection option: ${displayName}, containerId=${containerId}`);
                
                return (
                  <div key={`${nodeId}-${containerId}`} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${nodeId}-${containerId}`}
                      name="environment"
                      // Store both container ID and node ID
                      value={JSON.stringify({
                        containerId,
                        nodeId,
                        name: env.names?.[0] || 'unnamed'
                      })}
                      checked={newSystem.environmentIds.some(
                        item => JSON.parse(item).containerId === containerId && 
                               JSON.parse(item).nodeId === nodeId
                      )}
                      onChange={(e) => {
                        const valueObj = JSON.parse(e.target.value);
                        
                        if (e.target.checked) {
                          // DEBUG: Log when environment is selected
                          console.log('Selected environment:', valueObj);
                          
                          setNewSystem(prev => ({
                            ...prev,
                            environmentIds: [...prev.environmentIds, e.target.value]
                          }));
                        } else {
                          // DEBUG: Log when environment is deselected
                          console.log('Deselected environment:', valueObj);
                          
                          setNewSystem(prev => ({
                            ...prev,
                            environmentIds: prev.environmentIds.filter(item => {
                              const itemObj = JSON.parse(item);
                              return !(itemObj.containerId === valueObj.containerId && 
                                      itemObj.nodeId === valueObj.nodeId);
                            })
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`${nodeId}-${containerId}`} className="text-sm flex-1">
                      {displayName} ({env.image || 'unknown'})
                    </label>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      env.state === 'running' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {env.state || 'unknown'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
              </div>
            </div>
            {/* Add the submit buttons here */}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setNewSystemDialogOpen(false)}>
                Cancel
              </Button>
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
          
          // Calculate total containers from environments if available, otherwise from nodes
          const totalContainers = system.isCustom && system.environments.length > 0 
            ? system.environments.length 
            : system.nodes.reduce((acc, node) => acc + node.num_containers, 0);
            
          // For CPU usage, use direct environment data for custom systems
          let avgCpuUsage = 0;
          if (system.isCustom && system.environments.length > 0) {
            // Calculate directly from system environments
            const totalCpuPercentage = system.environments.reduce((sum, env) => 
              sum + (env.cpu_percentage || 0), 0);
            avgCpuUsage = Math.round(totalCpuPercentage / system.environments.length);
          } else {
            // Use node-based calculation for auto-generated systems
            avgCpuUsage = Math.round(
              system.nodes.reduce((sum, node) => {
                const nodeEnvs = node.environments || [];
                const nodeCpuSum = nodeEnvs.reduce((envSum, env) => envSum + (env.cpu_percentage || 0), 0);
                return sum + (nodeEnvs.length > 0 ? nodeCpuSum / nodeEnvs.length : 0);
              }, 0) / (system.nodes.length || 1)
            );
          }
          
          // Calculate memory usage - use average of node memory percents if available
          const avgMemoryUsage = system.nodes.length > 0
            ? Math.round(
                system.nodes.reduce((sum, node) => sum + (node.mem_percent || 0), 0) / 
                system.nodes.length
              )
            : 0;

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