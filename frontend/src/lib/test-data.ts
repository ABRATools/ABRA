

export const testData = {
    systems: [
      {
        id: "sys1",
        name: "Production System",
        status: "healthy",
        nodeCount: 2,
        totalContainers: 6,
        cpuUsage: 65,
        memoryUsage: 70,
        networkUsage: {
          incoming: "1.2 GB/s",
          outgoing: "0.8 GB/s"
        },
        nodes: ["node1", "node2"],
        description: "Main production system running critical workloads"
      },
      {
        id: "sys2",
        name: "Development System",
        status: "warning",
        nodeCount: 2,
        totalContainers: 4,
        cpuUsage: 45,
        memoryUsage: 60,
        networkUsage: {
          incoming: "0.6 GB/s",
          outgoing: "0.4 GB/s"
        },
        nodes: ["node3", "node4"],
        description: "Development and testing environment"
      }
    ],
  
    nodes: {
      node1: {
        id: "node1",
        systemId: "sys1",
        name: "Production Node 1",
        status: "healthy",
        resources: {
          cpu: { total: 32, used: 24, available: 8 },
          memory: { total: 64, used: 48, available: 16 },
          storage: { total: 1000, used: 600, available: 400 }
        },
        environments: ["env1", "env2", "env3"],
        uptime: "45 days",
        lastUpdated: "2024-02-06T10:30:00Z"
      },
      node2: {
        id: "node2",
        systemId: "sys1",
        name: "Production Node 2",
        status: "healthy",
        resources: {
          cpu: { total: 32, used: 20, available: 12 },
          memory: { total: 64, used: 40, available: 24 },
          storage: { total: 1000, used: 550, available: 450 }
        },
        environments: ["env4", "env5", "env6"],
        uptime: "30 days",
        lastUpdated: "2024-02-06T10:30:00Z"
      },
      node3: {
        id: "node3",
        systemId: "sys2",
        name: "Development Node 1",
        status: "warning",
        resources: {
          cpu: { total: 16, used: 12, available: 4 },
          memory: { total: 32, used: 28, available: 4 },
          storage: { total: 500, used: 300, available: 200 }
        },
        environments: ["env7", "env8"],
        uptime: "15 days",
        lastUpdated: "2024-02-06T10:30:00Z"
      },
      node4: {
        id: "node4",
        systemId: "sys2",
        name: "Development Node 2",
        status: "healthy",
        resources: {
          cpu: { total: 16, used: 8, available: 8 },
          memory: { total: 32, used: 16, available: 16 },
          storage: { total: 500, used: 250, available: 250 }
        },
        environments: ["env9", "env10"],
        uptime: "20 days",
        lastUpdated: "2024-02-06T10:30:00Z"
      }
    },
  
    environments: {
      env1: {
        id: "env1",
        nodeId: "node1",
        systemId: "sys1",
        name: "Web Server Prod 1",
        status: "running",
        type: "web-server",
        image: "nginx:latest",
        resources: {
          cpu: 4,
          memory: 8192,
          storage: 100
        },
        ports: ["80:80", "443:443"],
        variables: {
          NODE_ENV: "production",
          API_KEY: "xxxxx"
        }
      },
      env2: {
        id: "env2",
        nodeId: "node1",
        systemId: "sys1",
        name: "API Server Prod",
        status: "running",
        type: "api-server",
        image: "node:18",
        resources: {
          cpu: 8,
          memory: 16384,
          storage: 200
        },
        ports: ["3000:3000"],
        variables: {
          NODE_ENV: "production",
          DB_HOST: "db.example.com"
        }
      },
      env3: {
        id: "env3",
        nodeId: "node1",
        systemId: "sys1",
        name: "Redis Cache",
        status: "running",
        type: "cache",
        image: "redis:latest",
        resources: {
          cpu: 2,
          memory: 4096,
          storage: 50
        },
        ports: ["6379:6379"],
        variables: {
          REDIS_PASSWORD: "xxxxx"
        }
      },
      env4: {
        id: "env4",
        nodeId: "node2",
        systemId: "sys2",
        name: "Web Server Prod 2",
        status: "running",
        type: "web-server",
        image: "nginx:latest",
        resources: {
          cpu: 4,
          memory: 8192,
          storage: 100
        },
        ports: ["80:80", "443:443"],
        variables: {
          NODE_ENV: "production",
          API_KEY: "xxxxx"
        }
      },
      env5: {
        id: "env5",
        nodeId: "node2",
        systemId: "sys2",
        name: "API Server Prod 2",
        status: "running",
        type: "api-server",
        image: "node:18",
        resources: {
          cpu: 8,
          memory: 16384,
          storage: 200
        },
        ports: ["3000:3000"],
        variables: {
          NODE_ENV: "production",
          DB_HOST: "db.example.com"
        }
      },
      env6: {
        id: "env6",
        nodeId: "node6",
        systemId: "sys6",
        name: "Redis Cache 2",
        status: "running",
        type: "cache",
        image: "redis:latest",
        resources: {
          cpu: 2,
          memory: 4096,
          storage: 50
        },
        ports: ["6379:6379"],
        variables: {
          REDIS_PASSWORD: "xxxxx"
        }
      },
      env7: {
        id: "env7",
        nodeId: "node3",
        systemId: "sys3",
        name: "Web Server Prod 3",
        status: "running",
        type: "web-server",
        image: "nginx:latest",
        resources: {
          cpu: 4,
          memory: 8192,
          storage: 100
        },
        ports: ["80:80", "443:443"],
        variables: {
          NODE_ENV: "production",
          API_KEY: "xxxxx"
        }
      },
      env8: {
        id: "env8",
        nodeId: "node3",
        systemId: "sys3",
        name: "API Server Prod 3",
        status: "running",
        type: "api-server",
        image: "node:18",
        resources: {
          cpu: 8,
          memory: 16384,
          storage: 200
        },
        ports: ["3000:3000"],
        variables: {
          NODE_ENV: "production",
          DB_HOST: "db.example.com"
        }
      },
      env9: {
        id: "env9",
        nodeId: "node3",
        systemId: "sys3",
        name: "Redis Cache 3",
        status: "running",
        type: "cache",
        image: "redis:latest",
        resources: {
          cpu: 2,
          memory: 4096,
          storage: 50
        },
        ports: ["6379:6379"],
        variables: {
          REDIS_PASSWORD: "xxxxx"
        }
      }
}};