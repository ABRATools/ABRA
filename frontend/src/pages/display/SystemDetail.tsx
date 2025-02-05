import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Box } from "lucide-react";

export default function SystemDetail() {

  // use fake data until types can be finalized from API
  const systems = [
    {
      id: "sys1",
      name: "Production System",
      status: "healthy",
      nodes: "5",
      containers: "15",
    },
    {
        id: "sys2",
        name: "Development System",
        status: "healthy",
        nodes: "3",
        containers: "8",
      },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Systems Overview</h1>
          <p className="text-muted-foreground">
            Select a system to view its details and nodes
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {systems.map((system) => (
          <Card key={system.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{system.name}</CardTitle>
              <Box className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Nodes: {system.nodes}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Containers: {system.containers}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {system.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link
                      to={`/display/systems/${system.id}`}
                    >
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link
                      to={`/config/systems/${system.id}`}
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}