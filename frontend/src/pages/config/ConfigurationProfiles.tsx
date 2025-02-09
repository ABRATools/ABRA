import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Copy, Tag } from "lucide-react";

// test data
const profiles = [
  {
    id: "prof1",
    name: "Production Node Profile",
    type: "node",
    description: "High-availability production configuration",
    appliedTo: 5,
    lastUpdated: "2024-02-05",
    config: {
      maxCpu: 8,
      maxMemory: "16GB",
      maxStorage: "500GB"
    }
  },
  {
    id: "prof2",
    name: "Development Environment",
    type: "environment",
    description: "Standard development environment settings",
    appliedTo: 8,
    lastUpdated: "2024-02-04",
    config: {
      defaultImage: "node:latest",
      resources: "minimal",
      debug: true
    }
  },
  {
    id: "prof3",
    name: "Staging Environment",
    type: "environment",
    description: "Staging environment with monitoring",
    appliedTo: 3,
    lastUpdated: "2024-02-03",
    config: {
      monitoring: true,
      logging: "verbose",
      backups: "daily"
    }
  }
];

export default function ConfigurationProfiles() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuration Profiles
          </h1>
          <p className="text-muted-foreground">
            Manage and apply reusable configuration profiles
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Profile
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search profiles..."
          className="max-w-sm"
        />
        <Button variant="outline">
          <Tag className="mr-2 h-4 w-4" />
          Filter by Type
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">
                {profile.name}
              </CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    <span className="text-sm text-muted-foreground capitalize">{profile.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile.description}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Applied to {profile.appliedTo} instances
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {profile.lastUpdated}
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <Button className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />
                      Clone
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}