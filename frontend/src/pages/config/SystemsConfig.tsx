import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Server, Settings } from "lucide-react";
import { testData } from "@/lib/test-data";

export default function SystemsConfig() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Systems Configuration</h1>
          <p className="text-muted-foreground">
            Configure and manage your systems
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add System
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search systems..."
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testData.systems.map((system) => (
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nodes</p>
                      <p className="text-sm font-medium">{system.nodeCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Containers</p>
                      <p className="text-sm font-medium">{system.totalContainers}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        system.status === 'healthy' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {system.status}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/config/systems/${system.id}`}>Configure System</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/display/systems/${system.id}`}>
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
  );
}