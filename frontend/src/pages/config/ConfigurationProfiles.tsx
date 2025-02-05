import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

export default function ConfigurationProfiles() {
  // use fake data for now
  const profiles = [
    {
      id: "prof1",
      name: "Development Profile",
      type: "environment",
      description: "Standard development environment settings",
      appliedTo: 5,
    },
    {
      id: "prof2",
      name: "Production Profile",
      type: "node",
      description: "High-availability production node settings",
      appliedTo: 3,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuration Profiles
          </h1>
          <p className="text-muted-foreground">
            Manage reusable configuration profiles
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Profile
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
                  <p className="text-sm text-muted-foreground">
                    Type: {profile.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Applied to {profile.appliedTo} instances
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Edit Profile</Button>
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}