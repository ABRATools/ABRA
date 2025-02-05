import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function EnvironmentDetail() {
  const { systemId, nodeId, envId } = useParams();

  // use fake data for now
  const environment = {
    id: envId,
    name: "Production Environment",
    status: "running",
    image: "nginx:latest",
    cpu: "2 cores",
    memory: "4GB",
    network: "bridge",
    ports: ["80:80", "443:443"],
    volumes: ["/data:/data", "/config:/config"],
    envVars: {
      NODE_ENV: "production",
      API_URL: "https://api.example.com",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Environment Details</h1>
          <p className="text-muted-foreground">
            Viewing environment: {environment.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link
            to={`/config/systems/${systemId}/nodes/${nodeId}/environments/${envId}`}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure Environment
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Status: {environment.status}
              </p>
              <p className="text-sm text-muted-foreground">
                Image: {environment.image}
              </p>
              <p className="text-sm text-muted-foreground">
                CPU: {environment.cpu}
              </p>
              <p className="text-sm text-muted-foreground">
                Memory: {environment.memory}
              </p>
              <p className="text-sm text-muted-foreground">
                Network: {environment.network}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Ports</h3>
            <div className="space-y-2">
              {environment.ports.map((port) => (
                <p key={port} className="text-sm text-muted-foreground">
                  {port}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Volumes</h3>
            <div className="space-y-2">
              {environment.volumes.map((volume) => (
                <p key={volume} className="text-sm text-muted-foreground">
                  {volume}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
            <div className="space-y-2">
              {Object.entries(environment.envVars).map(([key, value]) => (
                <p key={key} className="text-sm text-muted-foreground">
                  {key}: {value}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}