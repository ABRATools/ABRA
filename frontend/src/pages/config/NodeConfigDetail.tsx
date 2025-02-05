import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NodeConfigDetail() {
  const { systemId, nodeId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Node Configuration</h1>
        <p className="text-muted-foreground">
          Configure node settings for: {nodeId}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Node Name</Label>
                  <Input id="name" placeholder="Enter node name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Enter node description" />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCpu">CPU Limit</Label>
                  <Input
                    id="maxCpu"
                    type="number"
                    placeholder="Enter CPU core limit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxMemory">Memory Limit (GB)</Label>
                  <Input
                    id="maxMemory"
                    type="number"
                    placeholder="Enter memory limit in GB"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStorage">Storage Limit (GB)</Label>
                  <Input
                    id="maxStorage"
                    type="number"
                    placeholder="Enter storage limit in GB"
                  />
                </div>
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