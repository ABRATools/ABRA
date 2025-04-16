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
  
  // Add custom systems to the map - PRESERVE THEIR ENVIRONMENTS!
  customSystems.forEach(system => {
    // Log the environment data being preserved
    console.log(`System ${system.id} has ${system.environments?.length || 0} environments with container IDs:`, 
      system.environments?.map(env => env.container_id) || []);
    
    systemGroups[system.id] = {
      ...system,
      nodeCount: 0,
      totalContainers: system.environments?.length || 0,
      nodes: [],
      // CRITICAL: Keep the original environments array with container_ids
      environments: system.environments || []
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
      // Also add container_id accessibility since we need it for matching
      const enhancedEnv = { 
        ...env, 
        sourceNode: node,
        // Use env_id as container_id since WebSocket data has container hash as env_id
        container_id: env.env_id
      };
      
      // Log this enhancement for debugging
      console.log(`Enhanced env ${env.env_id}: node=${node.node_id}, container_id=${enhancedEnv.container_id}`);
      
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
      // Print raw environment data to inspect actual structure
      console.log("RAW ENVIRONMENT DATA:", JSON.stringify(system.environments, null, 2));
      
      // Get environment IDs and container IDs
      const envIds = [];
      const containerIds = [];
      
      // Robust environment processing
      if (system.environments && Array.isArray(system.environments)) {
        system.environments.forEach(env => {
          try {
            // Check for direct env_id property
            if (env && env.env_id) {
              envIds.push(String(env.env_id));
            }
            
            // Check for direct container_id property
            if (env && env.container_id) {
              containerIds.push(env.container_id);
              console.log(`Found container_id in system: ${env.container_id}`);
            }
          } catch (e) {
            console.error("Error processing environment:", e);
          }
        });
      }
      
      console.log(`System ${system.name} env IDs:`, envIds);
      console.log(`System ${system.name} container IDs:`, containerIds);
      
      // Get environment names for additional matching
      const envNames = [];
      
      system.environments.forEach(env => {
        // Add direct name property
        if (env.name) {
          envNames.push(env.name);
        }
        
        // Add environment ID as a possible name match
        if (env.env_id) {
          envNames.push(String(env.env_id));
        }
      });
      
      // Summary of what we're looking for
      console.log(`System ${system.name} is looking for matches with:`, {
        envIds,
        containerIds,
        envNames
      });
      
      // Add debugging to inspect WebSocket data structure
      console.log("All available environments:", allEnvironments.map(e => 
        ({ env_id: e.env_id, names: e.names, node: e.sourceNode?.node_id })
      ));

      // Direct comparison between WebSocket and database environments
      const matchedEnvironments = allEnvironments.filter(wsEnv => {
        // Try each environment in the system
        for (const dbEnv of system.environments) {
          // MATCH TYPE 1: WebSocket env_id matches a database container_id
          if (dbEnv.container_id && dbEnv.container_id === wsEnv.env_id) {
            console.log(`MATCH! WebSocket env_id ${wsEnv.env_id} matches DB container_id`);
            return true;
          }
          
          // MATCH TYPE 2: WebSocket name matches a database env_id
          if (wsEnv.names && wsEnv.names.length > 0) {
            for (const name of wsEnv.names) {
              if (String(dbEnv.env_id) === String(name)) {
                console.log(`MATCH! WebSocket name ${name} matches DB env_id ${dbEnv.env_id}`);
                return true;
              }
            }
          }
        }
        
        return false;
      });
      
      // Debug the matched environments
      console.log(`Custom system ${system.name} matched environments:`, 
        matchedEnvironments.map(e => ({id: e.env_id, names: e.names}))
      );
      
      // Replace system's environments with matched live environments
      system.environments = matchedEnvironments;
      
      // Clear existing nodes and build fresh node collection from matched environments
      system.nodes = [];
      system.nodeCount = 0;
      
      // Add source nodes to this system and track which ones we've added
      const addedNodeIds = new Set();
      matchedEnvironments.forEach(env => {
        // @ts-ignore - sourceNode is added dynamically
        const sourceNode = env.sourceNode;
        if (sourceNode && !addedNodeIds.has(sourceNode.node_id)) {
          system.nodes.push(sourceNode);
          system.nodeCount++;
          addedNodeIds.add(sourceNode.node_id);
        }
      });
      
      system.totalContainers = matchedEnvironments.length;
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
      // Call backend API to create the system
      // Create a stable, predictable ID format based on name and timestamp
      const timestamp = Date.now();
      const systemId = `custom-${newSystem.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
      
      console.log(`Creating system with environment IDs:`, newSystem.environmentIds);
      
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
          // Send the raw environment IDs directly - backend will handle the processing
          environment_ids: newSystem.environmentIds
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create system');
      }
      
      // Get the system from API response
      const responseData = await response.json();
      console.log("System created response:", responseData);
      
      setNewSystemDialogOpen(false);
      setNewSystem({ name: '', environmentIds: [] });
      
      toast({
        title: "Success",
        description: responseData.message || `Created new system "${newSystem.name}"`,
      });
      
      // Refresh systems list to show the new system
      setTimeout(() => {
        refreshSystems();
      }, 1000);
    } catch (error: any) {
      console.error('Error creating system:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create system',
        variant: "destructive"
      });
    }
  };

  // A completely separate component for environment selection
  // that doesn't depend on any parent state that might change
  // A stable environment selector component that maintains scroll position
  // A completely isolated environment selector component
  // A completely static environment selector component 
  const EnvironmentSelector = () => {
    // Create a checkbox change handler that directly updates the parent state
    const handleCheckboxChange = (envId, checked) => {
      if (checked) {
        // Add the environment ID
        setNewSystem(prev => ({
          ...prev,
          environmentIds: [...prev.environmentIds, envId]
        }));
      } else {
        // Remove the environment ID
        setNewSystem(prev => ({
          ...prev,
          environmentIds: prev.environmentIds.filter(id => id !== envId)
        }));
      }
    };
    
    // Organize environments by node
    const nodeEnvironments = {};
    allEnvironments.forEach(env => {
      const nodeId = env.nodeId || 'unknown';
      if (!nodeEnvironments[nodeId]) {
        nodeEnvironments[nodeId] = [];
      }
      nodeEnvironments[nodeId].push(env);
    });
    
    return (
      <div className="overflow-y-auto pr-2 border rounded-md" style={{ height: '300px' }}>
        {Object.entries(nodeEnvironments).map(([nodeId, environments]) => (
          <div key={nodeId} className="mb-4 p-2">
            <h3 className="font-medium mb-2">Node: {nodeId}</h3>
            <div className="space-y-2">
              {environments.map(env => (
                <div key={env.env_id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`env-${env.env_id}`}
                    defaultChecked={newSystem.environmentIds.includes(env.env_id)}
                    onChange={(e) => handleCheckboxChange(env.env_id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label 
                    htmlFor={`env-${env.env_id}`} 
                    className="text-sm flex-1 cursor-pointer"
                    onClick={() => {
                      // This creates an additional way to toggle the checkbox
                      const isChecked = newSystem.environmentIds.includes(env.env_id);
                      handleCheckboxChange(env.env_id, !isChecked);
                      // Find and update the checkbox element
                      const checkbox = document.getElementById(`env-${env.env_id}`);
                      if (checkbox) {
                        checkbox.checked = !isChecked;
                      }
                    }}
                  >
                    {env.names?.[0] || env.env_id} ({env.image || 'unknown'})
                  </label>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    env.state === 'running' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {env.state || 'unknown'}
                  </span>
                </div>
              ))}
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
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleCreateSystem}
                disabled={!newSystem.name || newSystem.environmentIds.length === 0}
              >
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