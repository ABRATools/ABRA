import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EnvironmentConfigDetail() {
  const { systemId, nodeId, envId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Environment Configuration
        </h1>
        <p className="text-muted-foreground">
          Configure environment settings for: {envId}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Environment Name</Label>
                  <Input id="name" placeholder="Enter environment name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Container Image</Label>
                  <Input id="image" placeholder="Enter container image" />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu">CPU Allocation</Label>
                  <Input
                    id="cpu"
                    type="number"
                    placeholder="Enter CPU core allocation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memory">Memory Allocation (MB)</Label>
                  <Input
                    id="memory"
                    type="number"
                    placeholder="Enter memory allocation in MB"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ports">Ports (one per line)</Label>
                <Textarea
                  id="ports"
                  placeholder="80:80&#10;443:443"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volumes">Volumes (one per line)</Label>
                <Textarea
                  id="volumes"
                  placeholder="/host/path:/container/path&#10;/data:/data"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="env">Environment Variables (one per line)</Label>
                <Textarea
                  id="env"
                  placeholder="KEY=value&#10;ANOTHER_KEY=another_value"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}