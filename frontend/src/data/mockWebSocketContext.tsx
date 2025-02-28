// mockWebSocketContext.js
import { Node } from '@/types/machine';

/**
 * Creates a mock WebSocket data object for testing
 * @param {Object} options - Customization options for the mock data
 * @returns {Object} Mock WebSocket context data
 */
export const getMockWebSocketData = (options = {}) => {
  // Default environment data
  const defaultEnv = {
    env_id: "env1",
    names: ["ENV_VAR_1=value1", "ENV_VAR_2=value2"],
    status: "running",
    image: "ubuntu:latest",
    cpu_percentage: 40,
    memory_percent: 70,
    uptime: 12345,
    started_at: 1609459200,
    ip: "192.168.0.1",
    networks: ["net1", "net2"],
    ports: ["8080", "443"],
    exited: false,
    exit_code: 0,
  };
  
  // Default node data
  const defaultNode = {
    node_id: "node1",
    os_name: "Linux",
    os_version: "1.0",
    environments: [defaultEnv]
  };
  
  // Merge options for environment
  const environment = options.environment 
    ? { ...defaultEnv, ...options.environment }
    : defaultEnv;
  
  // Merge options for node, and ensure environment is set
  const node = options.node 
    ? { ...defaultNode, ...options.node, environments: [environment] }
    : { ...defaultNode, environments: [environment] };
  
  // Create the complete mock data structure
  return {
    data: {
      nodes: [node]
    },
    isConnected: options.isConnected !== undefined ? options.isConnected : true,
    error: options.error || null
  };
};

// Example usage in tests:
// 
// // Default mock data
// const mockData = getMockWebSocketData();
//
// // Mock with custom environment status
// const stoppedEnvMock = getMockWebSocketData({
//   environment: { status: "stopped" }
// });
//
// // Mock with disconnected WebSocket
// const disconnectedMock = getMockWebSocketData({
//   isConnected: false,
//   error: new Error("WebSocket connection failed")
// });