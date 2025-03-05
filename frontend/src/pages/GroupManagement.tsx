import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";

interface Group {
  id: number;
  name: string;
  user_count: number;
  permissions?: Permission[];
  users?: GroupUser[];
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
}

interface User {
  user_id: number;
  username: string;
  email: string | null;
  groups: string[];
  passwordChangeDate: string;
  is_active: boolean;
  is_totp_enabled: boolean;
  is_totp_confirmed: boolean;
}

interface GroupUser {
  user_id: number;
  username: string;
}

function RBACManagement() {
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(false);
  
  const fetchGroups = async () => {
    try {
      const response = await fetch('/rbac/groups?include_permissions=true');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.groups) {
          setGroups(data.groups);
        }
      } else {
        throw new Error('Failed to fetch groups');
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      });
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/rbac/permissions');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.permissions) {
          setPermissions(data.permissions);
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/get_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    fetchGroups();
    fetchPermissions();
    fetchUsers();
  }, []);
  
  const handleRefreshData = () => {
    fetchGroups();
    fetchPermissions();
    fetchUsers();
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Access Management</h1>
      
      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups">
          <GroupsTab 
            groups={groups} 
            permissions={permissions}
            users={users}
            loading={loading}
            setLoading={setLoading}
            toast={toast}
            onRefresh={handleRefreshData}
          />
        </TabsContent>
        
        <TabsContent value="permissions">
          <PermissionsTab 
            permissions={permissions}
            loading={loading}
            setLoading={setLoading}
            toast={toast}
            onRefresh={handleRefreshData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// groups tab subcomponent
function GroupsTab({ 
  groups, 
  permissions,
  users,
  loading, 
  setLoading,
  toast,
  onRefresh
}: { 
  groups: Group[],
  permissions: Permission[],
  users: User[],
  loading: boolean, 
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  toast: any,
  onRefresh: () => void
}) {
  // form states
  const [newGroupName, setNewGroupName] = useState("");
  
  const [showUserGroupDialog, setShowUserGroupDialog] = useState(false);
  const [showPermissionGroupDialog, setShowPermissionGroupDialog] = useState(false);
  
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<GroupUser[]>([]);
  const [showGroupUsersDialog, setShowGroupUsersDialog] = useState(false);
  const [loadingGroupDetails, setLoadingGroupDetails] = useState<{[key: number]: boolean}>({});
  
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedPermission, setSelectedPermission] = useState<string>("");
  const [selectedGroupForPermission, setSelectedGroupForPermission] = useState<string>("");
  
  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/rbac/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroupName }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `Group "${newGroupName}" created`,
        });
        setNewGroupName("");
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/rbac/groups/${groupId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: data.message || "Group deleted",
        });
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to delete group');
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchGroupUsers = async (groupId: number) => {
    setLoadingGroupDetails(prev => ({ ...prev, [groupId]: true }));
    try {
      try {
        const response = await fetch(`/rbac/groups/${groupId}/users`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.users) {
            setSelectedGroupUsers(data.users);
            setSelectedGroupId(groupId);
            return;
          }
        }
      } catch (e) {
        console.log("No direct group users endpoint available, using alternate method");
      }

      const response = await fetch('/api/get_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allUsers = data.users || [];
        
        const group = groups.find(g => g.id === groupId);
        if (!group) throw new Error('Group not found');
        
        const groupUsers = allUsers
          .filter((user: User) => user.groups.includes(group.name))
          .map((user: User) => ({
            user_id: user.user_id,
            username: user.username
          }));
        
        setSelectedGroupUsers(groupUsers);
        setSelectedGroupId(groupId);
      } else {
        throw new Error('Failed to fetch users for group');
      }
    } catch (error) {
      console.error("Error fetching users for group:", error);
      toast({
        title: "Error",
        description: "Failed to load users for this group",
        variant: "destructive",
      });
    } finally {
      setLoadingGroupDetails(prev => ({ ...prev, [groupId]: false }));
    }
  };
  
  const getFilteredUsers = () => {
    if (!selectedGroupId) return [];
    
    const groupUserIds = selectedGroupUsers.map(u => u.user_id);
    return users.filter(user => !groupUserIds.includes(user.user_id));
  };
  
  const assignUserToGroup = async (userId: number, groupId: number) => {
    setLoading(true);
    try {
      const response = await fetch('/rbac/users/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          group_id: groupId
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: data.message || "User assigned to group",
        });
        
        setSelectedUser("");
        setSelectedGroup("");
        setShowUserGroupDialog(false);
        
        onRefresh();
        
        if (selectedGroupId === groupId) {
          fetchGroupUsers(groupId);
        }
      } else {
        throw new Error(data.message || 'Failed to assign user to group');
      }
    } catch (error) {
      console.error("Error assigning user to group:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignUserToGroup = () => {
    if (!selectedUser || !selectedGroup) return;
    assignUserToGroup(parseInt(selectedUser), parseInt(selectedGroup));
  };
  
  const handleViewGroupUsers = (groupId: number) => {
    setSelectedGroupId(groupId);
    fetchGroupUsers(groupId);
    setShowGroupUsersDialog(true);
  };
  
  const handleAddUserToCurrentGroup = () => {
    if (!selectedUser || !selectedGroupId) return;
    assignUserToGroup(parseInt(selectedUser), selectedGroupId);
  };
  
  const removeUserFromGroup = async (userId: number, groupId: number) => {
    if (!confirm("Are you sure you want to remove this user from the group?")) return;
    
    setLoading(true);
    try {
      const response = await fetch('/rbac/users/groups', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          group_id: groupId
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: data.message || "User removed from group",
        });
        
        onRefresh();
        
        if (selectedGroupId === groupId) {
          fetchGroupUsers(groupId);
        }
      } else {
        throw new Error(data.message || 'Failed to remove user from group');
      }
    } catch (error) {
      console.error("Error removing user from group:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const assignPermissionToGroup = async (permissionId: number, groupId: number) => {
    setLoading(true);
    try {
      const response = await fetch('/rbac/permissions/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          permission_id: permissionId,
          group_id: groupId
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: data.message || "Permission assigned to group",
        });
        
        setSelectedPermission("");
        setSelectedGroupForPermission("");
        setShowPermissionGroupDialog(false);
        
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to assign permission to group');
      }
    } catch (error) {
      console.error("Error assigning permission to group:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignPermissionToGroup = () => {
    if (!selectedPermission || !selectedGroupForPermission) return;
    assignPermissionToGroup(
      parseInt(selectedPermission), 
      parseInt(selectedGroupForPermission)
    );
  };
  
  const removePermissionFromGroup = async (groupId: number, permissionId: number) => {
    if (!confirm("Are you sure you want to remove this permission from the group?")) return;
    
    setLoading(true);
    try {
      const response = await fetch('/rbac/permissions/groups', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          permission_id: permissionId,
          group_id: groupId
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: data.message || "Permission removed from group",
        });
        
        // Refresh data
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to remove permission from group');
      }
    } catch (error) {
      console.error("Error removing permission from group:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Group Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
            <CardDescription>
              Create a new group to organize permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Manage Group Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Group Assignments</CardTitle>
            <CardDescription>
              Assign users to groups or permissions to groups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full mb-2" 
              onClick={() => setShowUserGroupDialog(true)}
            >
              Assign User to Group
            </Button>
            
            <Button 
              className="w-full" 
              onClick={() => setShowPermissionGroupDialog(true)}
            >
              Assign Permission to Group
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Groups List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Groups</CardTitle>
          <CardDescription>
            Manage existing groups and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No groups found</TableCell>
                </TableRow>
              ) : (
                groups.map(group => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto"
                        onClick={() => handleViewGroupUsers(group.id)}
                      >
                        {group.user_count} users
                      </Button>
                    </TableCell>
                    <TableCell>
                      {group.permissions && group.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {group.permissions.map(permission => (
                            <div key={permission.id} className="flex items-center">
                              <span className="bg-slate-100 text-slate-800 rounded px-2 py-1 text-xs">
                                {permission.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 ml-1"
                                onClick={() => removePermissionFromGroup(group.id, permission.id)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No permissions</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewGroupUsers(group.id)}
                        >
                          Manage Users
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteGroup(group.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* User-Group Dialog */}
      <Dialog open={showUserGroupDialog} onOpenChange={setShowUserGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to Group</DialogTitle>
            <DialogDescription>
              Select a user and a group to assign them to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="selectUser">User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="selectGroup">Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAssignUserToGroup} 
              disabled={loading || !selectedUser || !selectedGroup}
            >
              {loading ? "Assigning..." : "Assign User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Permission-Group Dialog */}
      <Dialog open={showPermissionGroupDialog} onOpenChange={setShowPermissionGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Permission to Group</DialogTitle>
            <DialogDescription>
              Select a permission and a group to assign it to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="selectPermission">Permission</Label>
              <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a permission" />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map(permission => (
                    <SelectItem key={permission.id} value={permission.id.toString()}>
                      {permission.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="selectGroupForPermission">Group</Label>
              <Select 
                value={selectedGroupForPermission} 
                onValueChange={setSelectedGroupForPermission}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAssignPermissionToGroup} 
              disabled={loading || !selectedPermission || !selectedGroupForPermission}
            >
              {loading ? "Assigning..." : "Assign Permission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Users Dialog */}
      <Dialog open={showGroupUsersDialog} onOpenChange={setShowGroupUsersDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedGroupId && groups.find(g => g.id === selectedGroupId)?.name} - Users
            </DialogTitle>
            <DialogDescription>
              Manage users in this group
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Add user to group */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Add User to Group</h3>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredUsers().map(user => (
                        <SelectItem key={user.user_id} value={user.user_id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddUserToCurrentGroup}
                  disabled={loading || !selectedUser}
                  size="sm"
                >
                  Add User
                </Button>
              </div>
            </div>
            
            {/* Users list */}
            <div>
              <h3 className="text-sm font-medium mb-2">Current Users</h3>
              {loadingGroupDetails[selectedGroupId || 0] ? (
                <div className="text-center py-4">Loading users...</div>
              ) : selectedGroupUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No users in this group</div>
              ) : (
                <div className="border rounded-md divide-y">
                  {selectedGroupUsers.map(user => (
                    <div 
                      key={user.user_id} 
                      className="flex items-center justify-between p-3"
                    >
                      <div>{user.username}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedGroupId && removeUserFromGroup(user.user_id, selectedGroupId)}
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowGroupUsersDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// permissions tab subcomponent
function PermissionsTab({ 
  permissions,
  loading, 
  setLoading,
  toast,
  onRefresh
}: { 
  permissions: Permission[],
  loading: boolean, 
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  toast: any,
  onRefresh: () => void
}) {
  // form states
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionDescription, setNewPermissionDescription] = useState("");
  
  const createPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermissionName.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/rbac/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newPermissionName,
          description: newPermissionDescription || null 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `Permission "${newPermissionName}" created`,
        });
        setNewPermissionName("");
        setNewPermissionDescription("");
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to create permission');
      }
    } catch (error) {
      console.error("Error creating permission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        onRefresh();
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
  
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Permission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Permission</CardTitle>
            <CardDescription>
              Create a new permission to assign to groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPermission} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="permissionName">Permission Name</Label>
                <Input
                  id="permissionName"
                  placeholder="Enter permission name (e.g., users:read)"
                  value={newPermissionName}
                  onChange={(e) => setNewPermissionName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permissionDescription">Description (Optional)</Label>
                <Input
                  id="permissionDescription"
                  placeholder="Enter description"
                  value={newPermissionDescription}
                  onChange={(e) => setNewPermissionDescription(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Permission"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Permissions List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Manage existing permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No permissions found</TableCell>
                </TableRow>
              ) : (
                permissions.map(permission => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.name}</TableCell>
                    <TableCell>{permission.description || "—"}</TableCell>
                    <TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default RBACManagement;