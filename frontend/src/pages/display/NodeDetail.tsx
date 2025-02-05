import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Box } from "lucide-react";

export default function NodeDetail() {
  const { systemId, nodeId } = useParams();

  // use fake data until types can be finalized from API
  const environments = [
    {
      id: "env1",
      name: "Production Environment",
      status: "running",
      image: "nginx:latest",
      cpu: "2 cores",
      memory: "4GB",
    },
    {
      id: "env2",
      name: "Staging Environment",
      status: "running",
      image: "nginx:latest",
      cpu: "1 core",
      memory: "2GB",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Node Details</h1>
          <p className="text-muted-foreground">
            Viewing environments for node: {nodeId}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/config/systems/${systemId}/nodes/${nodeId}`}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Node
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {environments.map((env) => (
          <Card key={env.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{env.name}</CardTitle>
              <Box className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Status: {env.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Image: {env.image}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CPU: {env.cpu}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Memory: {env.memory}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link
                      to={`/display/systems/${systemId}/nodes/${nodeId}/environments/${env.id}`}
                    >
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link
                      to={`/config/systems/${systemId}/nodes/${nodeId}/environments/${env.id}`}
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