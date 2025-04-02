import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PermissionType {
  id: number;
  name: string;
  description: string | null;
}

interface Route {
  path: string;
  permission: string;
  description: string;
}

const ROUTE_CATEGORIES = {
  "view:": "View (Read-only access)",
  "config:": "Configuration (Read/Write access)",
  "admin:": "Administrative (System control)"
};

const RoutePermissionsManager: React.FC = () => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);

  // fetch permissions
  const fetchPermissions = async () => {
    try {
      const response = await fetch('/rbac/permissions');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.permissions) {
          setPermissions(data.permissions);
          
          // check if we have route permissions set up
          const hasRoutePerms = data.permissions.some((p: PermissionType) => 
            p.name.startsWith("view:") || 
            p.name.startsWith("config:") || 
            p.name.startsWith("admin:")
          );
          
          setInitialized(hasRoutePerms);
        }
      } else {
        throw new Error('Failed to fetch permissions');
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const initializeRoutePermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/rbac/routes/initialize');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: "Success",
            description: "Route permissions initialized successfully"
          });
          await fetchPermissions();
          setInitialized(true);
        } else {
          throw new Error(data.message || 'Failed to initialize permissions');
        }
      } else {
        throw new Error('Failed to initialize permissions');
      }
    } catch (error) {
      console.error("Error initializing permissions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowInitDialog(false);
    }
  };

  const deletePermission = async (permissionId: number) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/rbac/permissions/${permissionId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: data.message || "Permission deleted",
        });
        fetchPermissions();
      } else {
        throw new Error(data.message || 'Failed to delete permission');
      }
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: PermissionType[] } = {};
    
    permissions.forEach(permission => {
      // determine category from permission name prefix
      let category = "Other";
      
      for (const [prefix, label] of Object.entries(ROUTE_CATEGORIES)) {
        if (permission.name.startsWith(prefix)) {
          category = label;
          break;
        }
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push(permission);
    });
    
    return grouped;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Route Permissions</CardTitle>
          <CardDescription>
            Manage page access permissions
          </CardDescription>
        </div>
        {!initialized && (
          <Button 
            variant="secondary" 
            onClick={() => setShowInitDialog(true)}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Initialize Permissions
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {!initialized ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Route permissions not initialized</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Route permissions need to be initialized to enable role-based access control.
                Click the "Initialize Permissions" button to set up default permissions and groups.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {Object.entries(groupPermissionsByCategory()).map(([category, categoryPermissions]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-medium mb-2">{category}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.description || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePermission(permission.id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Initialize Dialog */}
      <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialize Route Permissions</DialogTitle>
            <DialogDescription>
              This will create standard permissions for routes and set up default user groups.
              This operation is safe to run even if some permissions already exist.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              The following default groups will be created:
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="border rounded-md p-3 bg-slate-50">
                <h4 className="font-medium">Admin</h4>
                <p className="text-sm text-slate-600">Full access to all sections and features</p>
              </div>
              
              <div className="border rounded-md p-3 bg-slate-50">
                <h4 className="font-medium">Configurator</h4>
                <p className="text-sm text-slate-600">Can view resources and make configuration changes</p>
              </div>
              
              <div className="border rounded-md p-3 bg-slate-50">
                <h4 className="font-medium">Viewer</h4>
                <p className="text-sm text-slate-600">Read-only access to system resources</p>
              </div>
            </div>
            
            <p className="text-sm text-amber-600">
              Note: This operation won't delete any existing permissions or groups.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowInitDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={initializeRoutePermissions}
              disabled={loading}
            >
              {loading ? "Initializing..." : "Initialize Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RoutePermissionsManager;