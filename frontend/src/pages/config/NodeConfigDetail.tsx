import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Box, Settings, Container, HardDrive } from "lucide-react";
import { testData } from "@/lib/test-data";

export default function NodeConfigDetail() {
  const { systemId, nodeId } = useParams();
  const node = testData.nodes[nodeId || ''];
  const system = testData.systems.find(s => s.id === systemId);
  const nodeEnvironments = node?.environments.map(envId => testData.environments[envId]) || [];
  
  if (!node || !system) {
    return <div>Node not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configure Node</h1>
          <p className="text-muted-foreground">
            Configure {node.name} in {system.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/display/systems/${systemId}/nodes/${nodeId}`}>
              View Node
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Node Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Node Name</Label>
                <Input
                  id="name"
                  defaultValue={node.name}
                  placeholder="Enter node name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter node description"
                />
              </div>
            </div>
            <Button>
              Save Changes
            </Button>
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
                  defaultValue={node.resources.cpu.total}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Available: {node.resources.cpu.available} cores
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory">Memory (GB)</Label>
                <Input
                  id="memory"
                  type="number"
                  defaultValue={node.resources.memory.total}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Available: {node.resources.memory.available} GB
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage (GB)</Label>
                <Input
                  id="storage"
                  type="number"
                  defaultValue={node.resources.storage.total}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Available: {node.resources.storage.available} GB
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
          <CardTitle>Network Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="networkMode">Network Mode</Label>
                <Input
                  id="networkMode"
                  defaultValue="bridge"
                  placeholder="Enter network mode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subnet">Subnet</Label>
                <Input
                  id="subnet"
                  placeholder="Enter subnet"
                />
              </div>
            </div>
            <Button>
              Update Network
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Node Environments</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Environment
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nodeEnvironments.map((env) => (
            <Card key={env.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{env.name}</CardTitle>
                <Container className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          env.status === 'running' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {env.status}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="text-sm">{env.type}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">Resources</p>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm">CPU: {env.resources.cpu} cores</p>
                        <p className="text-sm">Memory: {env.resources.memory} MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/config/systems/${systemId}/nodes/${nodeId}/environments/${env.id}`}>
                        Configure
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/display/systems/${systemId}/nodes/${nodeId}/environments/${env.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}