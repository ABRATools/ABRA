import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Server, Settings, HardDrive } from "lucide-react";
import { testData } from "@/lib/test-data";

export default function SystemConfigDetail() {
  const { systemId } = useParams();
  const system = testData.systems.find(s => s.id === systemId);
  const systemNodes = system?.nodes.map(nodeId => testData.nodes[nodeId]) || [];
  
  if (!system) {
    return <div>System not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configure System</h1>
          <p className="text-muted-foreground">
            Configure {system.name} settings and resources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/display/systems/${systemId}`}>
              View System
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">System Name</Label>
                <Input
                  id="name"
                  defaultValue={system.name}
                  placeholder="Enter system name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={system.description}
                  placeholder="Enter system description"
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
          <CardTitle>Resource Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxNodes">Maximum Nodes</Label>
                <Input
                  id="maxNodes"
                  type="number"
                  defaultValue={10}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxContainers">Maximum Containers</Label>
                <Input
                  id="maxContainers"
                  type="number"
                  defaultValue={50}
                  min={1}
                />
              </div>
            </div>
            <Button>
              Update Limits
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">System Nodes</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {systemNodes.map((node) => (
            <Card key={node.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{node.name}</CardTitle>
                <HardDrive className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          node.status === 'healthy' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {node.status}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Environments</p>
                        <p className="text-sm">{node.environments.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/config/systems/${systemId}/nodes/${node.id}`}>
                        Configure Node
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/display/systems/${systemId}/nodes/${node.id}`}>
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