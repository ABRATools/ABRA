import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import EnvironmentDetail from "./EnvironmentDetail";
import { useWebSocket } from "../../data/WebSocketContext";
import { Node } from '../../types/machine';

// Mocking the WebSocket hook
jest.mock("../../data/WebSocketContext", () => ({
  useWebSocket: jest.fn(),
}));

// Type the mocked function for TypeScript
const mockedUseWebSocket = useWebSocket as jest.MockedFunction<typeof useWebSocket>;

// Create mock data for tests
interface Environment {
  env_id: string;
  names: string[];
  status: string;
  image: string;
  cpu_percentage: number;
  memory_percent: number;
  uptime: number;
  started_at: number;
  ip: string;
  networks: string[];
  ports: string[];
  exited: boolean;
  exit_code: number;
  state?: string;      // Added based on error message
  exited_at?: number;  // Added based on error message
}

interface MockNode {
  node_id: string;
  os_name: string;
  os_version: string;
  environments: Environment[];
}

interface MockOptions {
  environment?: Partial<Environment>;
  node?: Partial<MockNode>;
  isConnected?: boolean;
  error?: Error | null;
}

const getMockWebSocketData = (options: MockOptions = {}) => {
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
      nodes: [node] as unknown as Node[]
    },
    isConnected: options.isConnected !== undefined ? options.isConnected : true,
    error: options.error || null
  };
};

describe("EnvironmentDetail Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Use the default mock data for most tests
    mockedUseWebSocket.mockReturnValue(getMockWebSocketData());
  });

  test("renders EnvironmentDetail component with mock data", async () => {
    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if environment name and details are rendered
    expect(screen.getByText("ENV_VAR_1=value1")).toBeInTheDocument();
    expect(screen.getByText("Environment on node1 in Linux 1.0")).toBeInTheDocument();
    expect(screen.getByText("Image: ubuntu:latest")).toBeInTheDocument();
    expect(screen.getByText("CPU Usage")).toBeInTheDocument();

    // Check if the environment's status is shown as running
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  test("handles WebSocket connection error", async () => {
    // Use our mock helper to create a disconnected state with error
    mockedUseWebSocket.mockReturnValue(
      getMockWebSocketData({
        isConnected: false,
        error: new Error("WebSocket connection failed")
      })
    );

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if error message is displayed when WebSocket is not connected
    expect(screen.getByText("Connection Error")).toBeInTheDocument();
  });

  test("button disables when environment is running", () => {
    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if Start button is disabled when the environment is already running
    const startButton = screen.getByRole("button", { name: /start/i });
    expect(startButton).toBeDisabled();
  });

  test("button enables when environment is not running", () => {
    // Use our mock helper to create a stopped environment state
    mockedUseWebSocket.mockReturnValue(
      getMockWebSocketData({
        environment: { status: "stopped" }
      })
    );

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if Start button is enabled when the environment is not running
    const startButton = screen.getByRole("button", { name: /start/i });
    expect(startButton).toBeEnabled();
  });

  test("console access button toggles connection state", async () => {
    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    const consoleButton = screen.getByRole("button", { name: /connect/i });

    // Check the initial state (should be "Connect")
    expect(consoleButton).toHaveTextContent("Connect");

    // Simulate button click to toggle the connection state
    fireEvent.click(consoleButton);

    // Check if the button text changes to "Disconnect"
    expect(consoleButton).toHaveTextContent("Disconnect");
  });

  test("renders correct environment variables", async () => {
    // You can customize environment variables if needed
    mockedUseWebSocket.mockReturnValue(
      getMockWebSocketData({
        environment: {
          names: ["CUSTOM_VAR=custom_value", "DEBUG=true"]
        }
      })
    );

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if custom environment variables are displayed
    expect(screen.getByText("CUSTOM_VAR: custom_value")).toBeInTheDocument();
    expect(screen.getByText("DEBUG: true")).toBeInTheDocument();
  });
  
  test("handles multiple environments in a node", () => {
    // Create mock with multiple environments in one node
    const multiEnvMock = {
      data: {
        nodes: [{
          node_id: "node1",
          os_name: "Linux",
          os_version: "1.0",
          environments: [
            {
              env_id: "env1",
              names: ["ENV_VAR_1=value1"],
              status: "running",
              image: "ubuntu:latest"
            },
            {
              env_id: "env2",
              names: ["ENV_VAR_3=value3"],
              status: "stopped",
              image: "nginx:latest"
            }
          ]
        }] as unknown as Node[]
      },
      isConnected: true,
      error: null
    };
    
    mockedUseWebSocket.mockReturnValue(multiEnvMock);
    
    // Your test assertions for multiple environments
    // ...
  });
  
  test("handles empty nodes array", () => {
    // Mock an empty nodes array
    mockedUseWebSocket.mockReturnValue({
      data: { nodes: [] as unknown as Node[] },
      isConnected: true,
      error: null
    });

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Should show no environments message
    expect(screen.getByText("No environments found")).toBeInTheDocument();
  });

  test("displays environment metrics correctly", () => {
    // Mock with specific metrics
    mockedUseWebSocket.mockReturnValue(
      getMockWebSocketData({
        environment: {
          cpu_percentage: 75.5,
          memory_percent: 88.2
        }
      })
    );

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if metrics are displayed correctly
    expect(screen.getByText("75.5%")).toBeInTheDocument(); // CPU
    expect(screen.getByText("88.2%")).toBeInTheDocument(); // Memory
  });

  test("handles environment with exit code", () => {
    // Mock an exited environment
    mockedUseWebSocket.mockReturnValue(
      getMockWebSocketData({
        environment: {
          status: "exited",
          exited: true,
          exit_code: 137
        }
      })
    );

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if exit code is displayed
    expect(screen.getByText("Exit Code: 137")).toBeInTheDocument();
  });

  test("renders network and port information", () => {
    // Mock with specific network and port data
    mockedUseWebSocket.mockReturnValue(
      getMockWebSocketData({
        environment: {
          networks: ["frontend", "backend", "database"],
          ports: ["80:80", "443:443", "8080:8080"]
        }
      })
    );

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if networks are displayed
    expect(screen.getByText("Networks:")).toBeInTheDocument();
    expect(screen.getByText("frontend")).toBeInTheDocument();
    expect(screen.getByText("backend")).toBeInTheDocument();
    expect(screen.getByText("database")).toBeInTheDocument();

    // Check if ports are displayed
    expect(screen.getByText("Ports:")).toBeInTheDocument();
    expect(screen.getByText("80:80")).toBeInTheDocument();
    expect(screen.getByText("443:443")).toBeInTheDocument();
    expect(screen.getByText("8080:8080")).toBeInTheDocument();
  });

  test("formats uptime correctly", () => {
    // Mock with specific uptime
    mockedUseWebSocket.mockReturnValue(
      getMockWebSocketData({
        environment: {
          uptime: 86400 * 2 + 3600 * 5 + 60 * 30 + 15 // 2 days, 5 hours, 30 minutes, 15 seconds
        }
      })
    );

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if uptime is formatted correctly
    expect(screen.getByText("2d 5h 30m 15s")).toBeInTheDocument();
  });

  test("shows loading state when data is null", () => {
    // Mock null data state
    mockedUseWebSocket.mockReturnValue({
      data: null,
      isConnected: true,
      error: null
    });

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if loading indicator is displayed
    expect(screen.getByText("Loading environment data...")).toBeInTheDocument();
  });

  // If your component doesn't accept an onRestart prop, remove this test
  // or modify it to match your component's actual API
  /* 
  test("handles environment restart action", () => {
    const mockRestartFn = jest.fn();
    
    // Add restart function to component props or context
    render(
      <Router>
        <EnvironmentDetail onRestart={mockRestartFn} />
      </Router>
    );

    // Find and click restart button
    const restartButton = screen.getByRole("button", { name: /restart/i });
    fireEvent.click(restartButton);

    // Check if restart function was called
    expect(mockRestartFn).toHaveBeenCalledWith("env1");
  });
  */

  test("displays environment creation time", () => {
    // Mock with specific timestamp
    const timestamp = 1609459200; // 2021-01-01 00:00:00 UTC
    
    mockedUseWebSocket.mockReturnValue(
      getMockWebSocketData({
        environment: {
          started_at: timestamp
        }
      })
    );

    render(
      <Router>
        <EnvironmentDetail />
      </Router>
    );

    // Check if date is formatted correctly
    // You'll need to adjust this test based on how your component formats dates
    expect(screen.getByText(/Created: 01 Jan 2021/)).toBeInTheDocument();
  });
});