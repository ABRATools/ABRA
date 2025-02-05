import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Plus } from "lucide-react";

export default function SystemsConfig() {
  // fake data for now
  const systems = [
    {
      id: "sys1",
      name: "Production System",
      nodeCount: 5,
      totalContainers: 15,
      status: "healthy",
    },
    {
      id: "sys2",
      name: "Development System",
      nodeCount: 3,
      totalContainers: 8,
      status: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Systems Configuration</h1>
          <p className="text-muted-foreground">
            Configure your systems and their settings
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add System
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {systems.map((system) => (
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
                  <p className="text-sm text-muted-foreground">
                    Nodes: {system.nodeCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Containers: {system.totalContainers}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {system.status}
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link to={`/config/systems/${system.id}`}>Configure</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}