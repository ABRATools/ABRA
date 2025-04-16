import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Settings, 
  Activity,
  HardDrive,
  Network,
  Clock,
  Box,
  AlertCircle,
  Trash2,
  Play,
  StopCircle,
  MonitorUp
} from "lucide-react";
import { useWebSocket } from "@/data/WebSocketContext";
import { useMemo, useState, useEffect } from "react";
import { Node, Environment, System } from "@/types/machine";
import { SystemsApi } from "@/lib/apis/systems";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Delete system dialog component
interface DeleteSystemDialogProps {
  systemId: string;
  systemName: string;
}

function DeleteSystemDialog({ systemId, systemName }: DeleteSystemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!systemId) return;
    
    try {
      setIsDeleting(true);
      
      // Call API to delete the system
      await SystemsApi.delete(systemId);
      
      toast({
        title: "System deleted",
        description: `Successfully deleted system "${systemName}"`,
      });
      
      // Close dialog and navigate back to systems list
      setIsOpen(false);
      navigate('/display/systems');
    } catch (error: any) {
      console.error('Error deleting system:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete system. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete System
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete System</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the system "{systemName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete System"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import AddNewNode from "@/pages/display/AddNewNode";

const formatMemory = (bytes: number): string => {
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatUptime = (nanoseconds: number): string => {
  // Convert nanoseconds to seconds
  const seconds = nanoseconds / 1_000_000_000;
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `<1m`;
};

export default function SystemDetail() {
  const { systemId } = useParams();
  const { data, isConnected: wsConnected, error: wsError } = useWebSocket();
  const [system, setSystem] = useState<System | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleContainerAction = (envId: string, action: 'start' | 'stop' | 'delete') => {
    console.log(`${action} container:`, envId);
    toast({
      title: "Action requested",
      description: `${action.charAt(0).toUpperCase() + action.slice(1)}ing container ${envId}`
    });
  };
  
  // Fetch the specific system directly from the API
  useEffect(() => {
    let isFirstLoad = true;
    
    const fetchSystem = async () => {
      if (!systemId) return;
      
      try {
        if (isFirstLoad) {
          setLoading(true);
          setError(null);
        }
        console.log(`Trying to fetch system with ID: ${systemId}`);
        
        // Try to fetch the specific system directly from the system endpoint first
        try {
          const directResponse = await fetch(`/api/system/${systemId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('Got system directly from API:', directData);
            
            if (directData.system) {
              // Convert to our System type
              const mappedSystem = {
                id: directData.system.system_id,
                name: directData.system.name,
                description: directData.system.description || '',
                status: 'healthy' as const,
                nodeCount: 0, // Will calculate from nodes
                totalContainers: directData.system.environments?.length || 0,
                environments: directData.system.environments?.map((env: any) => ({
                  env_id: env.env_id,
                  name: env.name,
                  status: env.status,
                  state: env.status || 'unknown',
                  ip: env.ip || '',
                  networks: env.networks || [],
                  ports: env.ports || [],
                  image: env.image || 'N/A',
                  names: [env.name],
                  started_at: env.started_at || 0,
                  exited: env.exited || false,
                  exit_code: env.exit_code || 0,
                  exited_at: env.exited_at || 0,
                  cpu_percentage: env.cpu_percentage || 0,
                  memory_percent: env.memory_percent || 0,
                  uptime: env.uptime || 0,
                  sourceNode: {
                    node_id: env.node_id,
                    name: env.node_name
                  }
                })) || [],
                nodes: [], // Will populate later
                isCustom: directData.system.is_custom,
                source: 'database'
              };
              
              if (isFirstLoad || !system) {
                console.log('Mapped direct system:', mappedSystem);
                setSystem(mappedSystem);
                setLoading(false);
                isFirstLoad = false;
                return;
              }
              
              // Only update if there's a significant difference
              const currentEnvCount = system.environments?.length || 0;
              const newEnvCount = mappedSystem.environments?.length || 0;
              if (Math.abs(currentEnvCount - newEnvCount) > 1) {
                console.log('System changed significantly, updating');
                setSystem(mappedSystem);
              }
              return;
            }
          }
        } catch (directError) {
          console.error('Error fetching specific system:', directError);
          // Continue to fallback methods
        }
        
        // Only proceed with additional lookups on first load or if system is null
        if (!isFirstLoad && system) return;
        
        // Try to fetch the system from the systems list endpoint
        const response = await fetch('/api/systems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Got systems from API:', data);
          
          // Try both system_id and id for matching to handle different formats
          const matchingSystem = data.systems.find((sys: any) => 
            sys.system_id === systemId || sys.id === systemId
          );
          
          if (matchingSystem) {
            console.log('Found matching system in systems list:', matchingSystem);
            
            // Convert to our System type
            const mappedSystem = {
              id: matchingSystem.system_id || matchingSystem.id,
              name: matchingSystem.name,
              description: matchingSystem.description || '',
              status: 'healthy' as const,
              nodeCount: 0, // Will calculate from nodes
              totalContainers: matchingSystem.environments?.length || 0,
              environments: matchingSystem.environments?.map((env: any) => ({
                env_id: env.env_id,
                name: env.name,
                status: env.status,
                state: env.status || 'unknown',
                ip: env.ip || '',
                networks: env.networks || [],
                ports: env.ports || [],
                image: env.image || 'N/A',
                names: [env.name],
                started_at: env.started_at || 0,
                exited: env.exited || false,
                exit_code: env.exit_code || 0,
                exited_at: env.exited_at || 0,
                cpu_percentage: env.cpu_percentage || 0,
                memory_percent: env.memory_percent || 0,
                uptime: env.uptime || 0,
                sourceNode: {
                  node_id: env.node_id,
                  name: env.node_name
                }
              })) || [],
              nodes: [], // Will populate later
              isCustom: matchingSystem.is_custom,
              source: matchingSystem.source
            };
            
            console.log('Mapped system from list:', mappedSystem);
            setSystem(mappedSystem);
            setLoading(false);
            isFirstLoad = false;
            return;
          }
        }
        
        // If we still don't have the system, and we have nodes data from WebSocket,
        // try to build it from the data we have
        if (data?.nodes) {
          // Handle auto-generated systems
          if (systemId === 'all-nodes') {
            // Get all environments from all nodes, with sourceNode attached
            console.log("Building allEnvironments for all-nodes system");
            const allEnvironments = [];
            
            data.nodes.forEach(node => {
              console.log(`Processing node ${node.node_id} with ${node.environments?.length || 0} environments`);
              if (!node.environments) return;
              
              // Add sourceNode reference to each environment
              node.environments.forEach(env => {
                console.log(`Adding environment from node ${node.node_id}:`, env.env_id, env.names);
                allEnvironments.push({
                  ...env,
                  sourceNode: {
                    node_id: node.node_id,
                    name: node.node_id,
                    ip_address: node.ip_address,
                    os_name: node.os_name,
                    os_version: node.os_version
                  }
                });
              });
            });
            
            // Process environments to ensure all have proper values
            const processedEnvironments = [];
            
            // Process all environments to ensure they have proper values
            for (const env of allEnvironments) {
              console.log('Processing env from WebSocket:', JSON.stringify(env).substring(0, 200));
              
              // Ensure we have valid names and ID
              const envNames = env.names && env.names.length > 0 ? env.names : [`Container-${env.env_id}`];
              
              // Create a properly formatted environment with all required fields
              const processedEnv = {
                ...env,
                env_id: env.env_id,
                state: env.state || 'unknown',
                image: env.image || 'N/A',
                names: envNames,
                // Make sure to access the correct properties - case sensitive!
                cpu_percentage: typeof env.cpu_percentage === 'number' ? env.cpu_percentage : 0,
                memory_percent: typeof env.memory_percent === 'number' ? env.memory_percent : 0,
                // Add proper fallbacks for all essential fields
                ip: env.ip || 'Not assigned',
                networks: env.networks || [],
                ports: env.ports || [],
                started_at: typeof env.started_at === 'number' ? env.started_at : 0,
                exited: Boolean(env.exited),
                exit_code: typeof env.exit_code === 'number' ? env.exit_code : 0,
                exited_at: typeof env.exited_at === 'number' ? env.exited_at : 0,
                uptime: typeof env.uptime === 'number' ? env.uptime : 0
              };
              
              processedEnvironments.push(processedEnv);
              console.log('Added processed environment:', processedEnv.env_id, processedEnv.names);
            }
            
            console.log(`Processed ${processedEnvironments.length} total environments`);
            
            const allNodesSystem = {
              id: 'all-nodes',
              name: 'All Nodes',
              status: 'healthy' as const,
              nodeCount: data.nodes.length,
              totalContainers: processedEnvironments.length,
              nodes: data.nodes,
              environments: processedEnvironments,
              source: 'auto-generated' as const
            };
            
            console.log('Created all-nodes system from WebSocket data:', allNodesSystem);
            setSystem(allNodesSystem);
            setLoading(false);
            isFirstLoad = false;
            return;
          }
          
          // For OS-based systems (format: osName-osVersion)
          const [osName, osVersion] = systemId.split('-');
          if (osName && osVersion) {
            const matchingNodes = data.nodes.filter(
              node => node.os_name === osName && node.os_version === osVersion
            );
            
            if (matchingNodes.length > 0) {
              // Get all environments from matching nodes, with sourceNode attached
              const osEnvironments = matchingNodes.flatMap(node => {
                if (!node.environments) return [];
                
                // Add sourceNode reference to each environment
                return node.environments.map(env => ({
                  ...env,
                  sourceNode: {
                    node_id: node.node_id,
                    name: node.node_id,
                    ip_address: node.ip_address,
                    os_name: node.os_name,
                    os_version: node.os_version
                  }
                }));
              });
              
              // Process environments to ensure all have proper values
              const processedEnvironments = osEnvironments.map(env => {
                console.log('Processing OS env from WebSocket:', JSON.stringify(env).substring(0, 200));
                return {
                  ...env,
                  state: env.state || 'unknown',
                  image: env.image || 'N/A',
                  names: env.names && env.names.length > 0 ? env.names : [`Container-${env.env_id}`],
                  // Make sure to access the correct properties - case sensitive!
                  cpu_percentage: typeof env.cpu_percentage === 'number' ? env.cpu_percentage : 0,
                  memory_percent: typeof env.memory_percent === 'number' ? env.memory_percent : 0,
                  // Add proper fallbacks for all essential fields
                  ip: env.ip || 'Not assigned',
                  networks: env.networks || [],
                  ports: env.ports || [],
                  started_at: typeof env.started_at === 'number' ? env.started_at : 0,
                  exited: Boolean(env.exited),
                  exit_code: typeof env.exit_code === 'number' ? env.exit_code : 0,
                  exited_at: typeof env.exited_at === 'number' ? env.exited_at : 0,
                  uptime: typeof env.uptime === 'number' ? env.uptime : 0
                };
              });
              
              const osSystem = {
                id: systemId,
                name: `${osName} ${osVersion}`,
                status: 'healthy' as const,
                nodeCount: matchingNodes.length,
                totalContainers: processedEnvironments.length,
                nodes: matchingNodes,
                environments: processedEnvironments,
                source: 'auto-generated' as const
              };
              
              console.log('Created OS-based system from WebSocket data:', osSystem);
              setSystem(osSystem);
              setLoading(false);
              isFirstLoad = false;
              return;
            }
          }
          
          // For custom systems starting with "custom-"
          if (systemId.startsWith('custom-')) {
            // Try to get the system name from the ID format: custom-name-timestamp
            const nameParts = systemId.split('-');
            if (nameParts.length >= 3) {
              const customSystemName = nameParts.slice(1, -1).join('-');
              console.log(`Looking for custom system with name: ${customSystemName}`);
              
              // Custom system not found by direct lookup, but could still exist
              // in the database with a slight mismatch in ID format
              setError(`System with ID ${systemId} could not be found. Refresh the systems list or try again.`);
              setLoading(false);
              isFirstLoad = false;
              return;
            }
          }
        }
        
        // If we get here, we couldn't find the system (only show error on first load)
        if (isFirstLoad) {
          setError(`System with ID ${systemId} could not be found`);
          setLoading(false);
          isFirstLoad = false;
        }
      } catch (err: any) {
        console.error('Error fetching system:', err);
        if (isFirstLoad) {
          setError(err.message || 'Failed to load system details');
          setLoading(false);
          isFirstLoad = false;
        }
      }
    };
    
    fetchSystem();
    
    // Only refresh WebSocket-based node data, not the whole system
    const refreshInterval = setInterval(() => {
      if (system && data?.nodes && system.source === 'database') {
        // Don't do a full reload, just update the metrics silently
      }
    }, 5000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [systemId]);
  
  // Merge database system information with WebSocket data for nodes
  const systemNodes = useMemo(() => {
    if (!system) return [];
    if (!data?.nodes) return system.nodes || [];
    
    console.log(`Getting nodes for system: ${system.id}, isCustom: ${system.isCustom}, source: ${system.source}`);
    console.log('Available WebSocket data nodes:', data.nodes.map(n => n.node_id));
    
    // For database/custom systems, update nodes and environments from live data
    if (system.source === 'database' && system.isCustom) {
      console.log('Updating custom system with WebSocket data');
      
      // DEBUG: Log the system environments we need to match
      console.log('System environments from database:', system.environments.map(e => ({
        env_id: e.env_id,
        container_id: e.container_id,
        name: e.names?.[0] || 'unnamed'
      })));
      
      // Create lookups for environments by various attributes for faster matching
      const envByName = new Map<string, Environment>();
      const envById = new Map<string, Environment>();
      const envByContainerId = new Map<string, Environment>();
      
      // Process all environments from all nodes and create lookups
      data.nodes.forEach(node => {
        if (!node.environments) return;
        
        // DEBUG: Log the environments from this node
        console.log(`Node ${node.node_id} environments:`, node.environments.map(e => ({
          env_id: e.env_id,
          names: e.names
        })));
        
        node.environments.forEach(env => {
          // In WebSocket data, env_id IS the container_id!
          envById.set(env.env_id, {...env, sourceNode: node});
          
          // IMPORTANT: Also map by env_id as container_id for direct matching
          envByContainerId.set(env.env_id, {...env, sourceNode: node});
          
          // Add lookup by each name
          if (env.names && env.names.length > 0) {
            env.names.forEach(name => {
              envByName.set(name, {...env, sourceNode: node});
            });
          }
        });
      });
      
      // Now look for matching environments using container_id as the primary key
      const matchedEnvironments: Environment[] = [];
      const nodeIds = new Set<string>();
      
      system.environments.forEach(sysEnv => {
        let matchedEnv: Environment | undefined;
        
        // IMPORTANT: Try to match by container_id first (most reliable)
        if (sysEnv.container_id && envByContainerId.has(sysEnv.container_id)) {
          matchedEnv = envByContainerId.get(sysEnv.container_id);
          console.log(`MATCH FOUND by container_id: ${sysEnv.container_id}`);
        } 
        // Then try to match by env_id
        else if (envById.has(sysEnv.env_id)) {
          matchedEnv = envById.get(sysEnv.env_id);
          console.log(`MATCH FOUND by env_id: ${sysEnv.env_id}`);
        }
        // Then try to match by name
        else if (sysEnv.names && sysEnv.names.length > 0) {
          for (const name of sysEnv.names) {
            if (envByName.has(name)) {
              matchedEnv = envByName.get(name);
              console.log(`MATCH FOUND by name: ${name}`);
              break;
            }
          }
        }
        
        // If we found a match, add it and track its node
        if (matchedEnv) {
          matchedEnvironments.push(matchedEnv);
          
          // Record the node ID
          // @ts-ignore - sourceNode is added dynamically
          if (matchedEnv.sourceNode?.node_id) {
            // @ts-ignore - sourceNode is added dynamically
            nodeIds.add(matchedEnv.sourceNode.node_id);
          }
        } else {
          // DEBUG: Log when no match is found
          console.warn(`NO MATCH FOUND for environment: env_id=${sysEnv.env_id}, container_id=${sysEnv.container_id}, names=${sysEnv.names}`);
          
          // Keep the original environment if no match found
          matchedEnvironments.push(sysEnv);
          
          // Record the original node ID if available
          if (sysEnv.sourceNode?.node_id) {
            nodeIds.add(sysEnv.sourceNode.node_id);
          }
        }
      });
      
      // Update the system's environments - we do this for custom systems only
      if (system.isCustom && matchedEnvironments.length > 0) {
        console.log('Updating system environments:',
          matchedEnvironments.map(e => ({id: e.env_id, names: e.names, state: e.state})));
        system.environments = matchedEnvironments;
        system.totalContainers = matchedEnvironments.length;
      }
      
      // Find the actual nodes from WebSocket data
      const matchingNodes = data.nodes.filter(node => 
        nodeIds.has(node.node_id)
      );
      
      console.log(`Found ${matchingNodes.length} matching nodes for system ${system.id}`);
      
      // Always return fresh nodes for custom systems to ensure we have current data
      return matchingNodes;
    }
    
    // For non-custom systems (like all-nodes), always use the latest data directly from WebSocket
    if (system.id === 'all-nodes' && data.nodes) {
      console.log('Using latest WebSocket data for all-nodes system');
      return data.nodes;
    }
    
    // For OS-based systems, filter the latest nodes by OS
    if (system.id && system.id.includes('-') && !system.isCustom && data.nodes) {
      const [osName, osVersion] = system.id.split('-');
      if (osName && osVersion) {
        console.log(`Filtering nodes for OS ${osName} ${osVersion}`);
        const filteredNodes = data.nodes.filter(
          node => node.os_name === osName && node.os_version === osVersion
        );
        if (filteredNodes.length > 0) {
          return filteredNodes;
        }
      }
    }
    
    // For custom systems with no significant changes, keep current nodes to prevent re-renders
    if (system.nodes && system.nodes.length > 0 && system.isCustom) {
      const nodeCountDiff = Math.abs(system.nodes.length - data.nodes.length);
      if (nodeCountDiff <= 1) {
        return system.nodes;
      }
    }
    
    // Otherwise, use the nodes from system or websocket
    return system.nodes || [];
  }, [system, data]);
  
  // Get environments from the system object
  // In the SystemDetail component, update the useMemo hook for 'environments'
  const environments = useMemo(() => {
    if (!system?.environments) return [];
    
    console.log('Processing final environments:', system.environments.length);
    
    // For all-nodes system, collect all environments directly from websocket data
    if (systemId === 'all-nodes' && data?.nodes) {
      // For all-nodes, we should directly use the latest data from websocket
      // rather than using system.environments which might be stale
      const allNodeEnvironments = [];
      
      // Collect all environments from all nodes with sourceNode attached
      data.nodes.forEach(node => {
        if (!node.environments) return;
        
        node.environments.forEach(env => {
          allNodeEnvironments.push({
            ...env,
            // Add these properties for consistent access
            env_id: env.env_id,
            state: env.state || 'unknown',
            ip: env.ip || 'Not assigned',
            image: env.image || 'N/A',
            names: env.names && env.names.length > 0 ? env.names : [`Container-${env.env_id}`],
            started_at: typeof env.started_at === 'number' ? env.started_at : 0,
            exited: Boolean(env.exited),
            exit_code: typeof env.exit_code === 'number' ? env.exit_code : 0,
            exited_at: typeof env.exited_at === 'number' ? env.exited_at : 0,
            cpu_percentage: typeof env.cpu_percentage === 'number' ? env.cpu_percentage : 0,
            memory_percent: typeof env.memory_percent === 'number' ? env.memory_percent : 0,
            uptime: typeof env.uptime === 'number' ? env.uptime : 0,
            networks: Array.isArray(env.networks) ? env.networks : [],
            ports: Array.isArray(env.ports) ? env.ports : [],
            // Add sourceNode reference
            sourceNode: {
              node_id: node.node_id,
              name: node.node_id
            }
          });
        });
      });
      
      console.log(`All-nodes system: Collected ${allNodeEnvironments.length} environments directly from websocket data`);
      return allNodeEnvironments;
    }
    
    // For all other systems, use the existing logic
    return system.environments.map(env => {
      // Log a sample of raw data to see the exact structure
      if (Math.random() < 0.2) { // Only log ~20% to avoid console spam
        console.log('Environment raw data (sample):', JSON.stringify(env).substring(0, 300));
      }
      
      // Get data from WebSocket if available
      let enhancedEnv = { ...env };
      
      return {
        ...enhancedEnv,
        // Provide fallbacks for all possibly missing values
        env_id: enhancedEnv.env_id || `unknown-${Math.random().toString(36).substring(7)}`,
        state: enhancedEnv.state || 'unknown',
        ip: enhancedEnv.ip || 'Not assigned',
        image: enhancedEnv.image || 'N/A',
        names: enhancedEnv.names && enhancedEnv.names.length > 0 ? enhancedEnv.names : [`Container-${enhancedEnv.env_id?.substring(0, 8) || 'unknown'}`],
        started_at: typeof enhancedEnv.started_at === 'number' ? enhancedEnv.started_at : 0,
        exited: Boolean(enhancedEnv.exited),
        exit_code: typeof enhancedEnv.exit_code === 'number' ? enhancedEnv.exit_code : 0,
        exited_at: typeof enhancedEnv.exited_at === 'number' ? enhancedEnv.exited_at : 0,
        cpu_percentage: typeof enhancedEnv.cpu_percentage === 'number' ? enhancedEnv.cpu_percentage : 0,
        memory_percent: typeof enhancedEnv.memory_percent === 'number' ? enhancedEnv.memory_percent : 0,
        uptime: typeof enhancedEnv.uptime === 'number' ? enhancedEnv.uptime : 0,
        networks: Array.isArray(enhancedEnv.networks) ? enhancedEnv.networks : [],
        ports: Array.isArray(enhancedEnv.ports) ? enhancedEnv.ports : [],
        // Ensure sourceNode exists
        sourceNode: enhancedEnv.sourceNode || { node_id: 'unknown', name: 'Unknown Node' }
      };
    });
  }, [system, data, systemId]);
  
  const systemMetrics = useMemo(() => {
    // Default metrics if we can't calculate from nodes
    let metrics = {
      totalNodes: systemNodes.length || 0,
      totalContainers: 0,
      avgCpuUsage: 0,
      avgMemoryUsage: 0
    };
    
    // Calculate total containers - simply use the environment count
    try {
      // For the total container count, ALWAYS use the environment length
      // as this is the most accurate representation for a system
      metrics.totalContainers = environments.length;
      
      // Debug info
      console.log(`Setting totalContainers to ${environments.length} (environments.length)`);
    } catch (error) {
      console.error('Error calculating totalContainers:', error);
      metrics.totalContainers = environments.length; // Fallback
    }
    
    // Try to calculate average CPU usage
    try {
      if (environments.length > 0) {
        metrics.avgCpuUsage = Math.round(
          environments.reduce((sum, env) => sum + (env.cpu_percentage || 0), 0) / environments.length
        );
      }
    } catch (error) {
      console.error('Error calculating avgCpuUsage:', error);
    }
    
    // Try to calculate average memory usage
    try {
      if (environments.length > 0) {
        metrics.avgMemoryUsage = Math.round(
          environments.reduce((sum, env) => sum + (env.memory_percent || 0), 0) / environments.length
        );
      }
    } catch (error) {
      console.error('Error calculating avgMemoryUsage:', error);
    }
    
    return metrics;
  }, [systemNodes, environments]);
  
  if (!systemId || loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">System Details</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <h2 className="text-xl mb-2">Loading system details...</h2>
                <p>Please wait</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !wsConnected || wsError || !data || !system) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">System Details</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              {error ? (
                <div className="text-red-500">
                  <h2 className="text-xl mb-2">System Error</h2>
                  <p>{error}</p>
                </div>
              ) : wsError ? (
                <div className="text-red-500">
                  <h2 className="text-xl mb-2">Connection Error</h2>
                  <p>{wsError.message}</p>
                </div>
              ) : !wsConnected ? (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">Connecting to monitoring service...</h2>
                  <p>Please wait while we establish connection</p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <h2 className="text-xl mb-2">System Not Found</h2>
                  <p>The system with ID {systemId} could not be found</p>
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
          <h1 className="text-3xl font-bold tracking-tight">{system.name}</h1>
          <p className="text-muted-foreground">
            {system.isCustom 
              ? `Custom System with ${environments.length} environments` 
              : systemId === 'all-nodes'
                ? `All environments in the network (${environments.length})`
                : `System Type: ${systemId.split('-').join(' ')} with ${environments.length} environments`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {system.isCustom && (
            <DeleteSystemDialog systemId={system.id} systemName={system.name} />
          )}
          <Button variant="outline" asChild>
            <Link to={`/config/systems/${systemId}`}>
              <Settings className="mr-2 h-4 w-4" />
              Configure System
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalNodes}</div>
            <p className="text-xs text-muted-foreground">Source nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Containers</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalContainers}</div>
            <p className="text-xs text-muted-foreground">Total environments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.avgCpuUsage}%</div>
            <p className="text-xs text-muted-foreground">Average across environments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.avgMemoryUsage}%</div>
            <p className="text-xs text-muted-foreground">Average across environments</p>
          </CardContent>
        </Card>
      </div>


      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Environments</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {environments.map((env) => {
            // find the parent node this environment belongs to
            const parentNode = systemNodes.find(node => 
              node.environments?.some(e => e.env_id === env.env_id)
            );
            
            return (
              <Card key={env.env_id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold truncate" title={env.names?.[0] || env.env_id}>
                    {(env.names && env.names[0]) || (env.env_id ? env.env_id.substring(0, 12) + '...' : 'Environment')}
                  </CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    env.state === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {env.state || 'unknown'}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Image: {env.image || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">IP: {env.ip || 'Not assigned'}</p>
                      <p className="text-sm text-muted-foreground">Node: {parentNode?.node_id || env.sourceNode?.node_id || 'Unknown'}</p>
                      {env.state === 'running' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-muted-foreground">CPU</p>
                              <p className="text-sm">
                                {typeof env.cpu_percentage === 'number' 
                                  ? (env.cpu_percentage * 100 < 0.01 
                                      ? '< 0.01' 
                                      : env.cpu_percentage.toFixed(2)) 
                                  : '0'}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Memory</p>
                              <p className="text-sm">
                                {typeof env.memory_percent === 'number' 
                                  ? (env.memory_percent * 100 < 0.01 
                                      ? '< 0.01' 
                                      : env.memory_percent.toFixed(2)) 
                                  : '0'}%
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Uptime: {env.uptime ? formatUptime(env.uptime) : 'N/A'}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {/* Start/Stop button */}
                      {env.state === 'running' ? (
                        <Button 
                          variant="outline"
                          className="flex-1" 
                          onClick={() => handleContainerAction(env.env_id, 'stop')}
                        >
                          <StopCircle className="mr-2 h-4 w-4" />
                          Stop
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleContainerAction(env.env_id, 'start')}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </Button>
                      )}
                      
                      {/* Container Details Button */}
                      <Button 
                        variant="outline" 
                        size="icon"
                        asChild
                      >
                        <Link to={`/display/systems/${systemId}/nodes/${parentNode?.node_id || env.sourceNode?.node_id || 'unknown'}/environments/${env.env_id}`}>
                          <MonitorUp className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* Delete button */}
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleContainerAction(env.env_id, 'delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {environments.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>No environments found in this system</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}