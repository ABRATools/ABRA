import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Shield,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Search
} from "lucide-react";

// fake data
const groups = [
  { id: 1, name: 'Administrators', description: 'Full system access', members: 3, roles: ['Admin'] },
  { id: 2, name: 'Operators', description: 'System operations access', members: 8, roles: ['Operator'] },
  { id: 3, name: 'Developers', description: 'Development environment access', members: 12, roles: ['Developer'] }
];

const roles = [
  { id: 1, name: 'Admin', description: 'Full system administration', permissions: ['all'] },
  { id: 2, name: 'Operator', description: 'System operations', permissions: ['read', 'write', 'execute'] },
  { id: 3, name: 'Developer', description: 'Development access', permissions: ['read', 'write'] }
];

const permissions = [
  { id: 1, name: 'read', description: 'Read access to resources' },
  { id: 2, name: 'write', description: 'Write access to resources' },
  { id: 3, name: 'execute', description: 'Execute operations' },
  { id: 4, name: 'delete', description: 'Delete resources' },
  { id: 5, name: 'admin', description: 'Administrative operations' }
];

export default function GroupManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Management</h1>
          <p className="text-muted-foreground">
            Manage groups, roles, and permissions
          </p>
        </div>
      </div>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* groups tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Input
                placeholder="Search groups..."
                className="w-64"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.description}</TableCell>
                      <TableCell>{group.members}</TableCell>
                      <TableCell>{group.roles.join(', ')}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* roles tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Input
                placeholder="Search roles..."
                className="w-64"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Role
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{role.permissions.join(', ')}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* permissions tab*/}
        <TabsContent value="permissions" className="space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Input
                placeholder="Search permissions..."
                className="w-64"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Permission
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}