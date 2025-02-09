import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Container,
  Plus,
  Trash,
  Eye,
  Save,
  RefreshCw
} from "lucide-react";
import { testData } from "@/lib/test-data";

export default function EnvironmentConfigDetail() {
  const { systemId, nodeId, envId } = useParams();
  const environment = testData.environments[envId || ''];
  const node = testData.nodes[nodeId || ''];
  const system = testData.systems.find(s => s.id === systemId);
  
  if (!environment || !node || !system) {
    return <div>Environment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configure Environment</h1>
          <p className="text-muted-foreground">
            Configure {environment.name} on {node.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/display/systems/${systemId}/nodes/${nodeId}/environments/${envId}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Environment
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Environment Name</Label>
                <Input
                  id="name"
                  defaultValue={environment.name}
                  placeholder="Enter environment name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Environment Type</Label>
                <Input
                  id="type"
                  defaultValue={environment.type}
                  placeholder="Enter environment type"
                />
              </div>
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Container Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Container Image</Label>
                <Input
                  id="image"
                  defaultValue={environment.image}
                  placeholder="Enter container image"
                />
              </div>
              <div className="space-y-2">
                <Label>Port Mappings</Label>
                <div className="space-y-2">
                  {environment.ports.map((port, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        defaultValue={port}
                        placeholder="host:container"
                      />
                      <Button variant="outline" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Port Mapping
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU Cores</Label>
                <Input
                  id="cpu"
                  type="number"
                  defaultValue={environment.resources.cpu}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Node Available: {node.resources.cpu.available} cores
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory">Memory (MB)</Label>
                <Input
                  id="memory"
                  type="number"
                  defaultValue={environment.resources.memory}
                  min={512}
                  step={512}
                />
                <p className="text-sm text-muted-foreground">
                  Node Available: {node.resources.memory.available * 1024} MB
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage (GB)</Label>
                <Input
                  id="storage"
                  type="number"
                  defaultValue={environment.resources.storage}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Node Available: {node.resources.storage.available} GB
                </p>
              </div>
            </div>
            <Button>
              Update Resources
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              {Object.entries(environment.variables).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    defaultValue={key}
                    placeholder="Key"
                    className="flex-1"
                  />
                  <Input
                    defaultValue={value}
                    placeholder="Value"
                    className="flex-1"
                    type={key.toLowerCase().includes('password') ? 'password' : 'text'}
                  />
                  <Button variant="outline" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Environment Variable
              </Button>
            </div>
            <Button>
              Update Variables
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Options</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="restart">Restart Policy</Label>
                <Input
                  id="restart"
                  defaultValue="always"
                  placeholder="Enter restart policy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="network">Network Mode</Label>
                <Input
                  id="network"
                  defaultValue={environment.network}
                  placeholder="Enter network mode"
                />
              </div>
            </div>
            <Button>
              Update Options
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Delete Environment</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this environment and all its data
                </p>
              </div>
              <Button variant="destructive">
                Delete Environment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}