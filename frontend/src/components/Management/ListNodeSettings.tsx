import React, { useState } from 'react';
// import { ThemeProvider } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Progress } from "@/components/ui/progress";
import { Node } from "@/types/node";
// import { Environment } from '@/types/environment';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import NodeDetails from "./NodeDetails";
import NodeListItem from "./NodeListItem";


const ListNodeSettings = ({ nodes = [] }: { nodes?: Node[] }) => {
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isEditEnvOpen, setIsEditEnvOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(nodes[0] || null);
  const [newNodeError, setNewNodeError] = useState('');
  const [newNodeData, setNewNodeData] = useState({
    name: '',
    source: '',
    ip: ''
  });

  console.log("List Node settings: ", nodes);

  const handleAddNode = async (e: React.FormEvent) => {
    const token = sessionStorage.getItem('token');
    
    e.preventDefault();
    
    console.log("Adding node: ", newNodeData);
    try {
      const response = await fetch('/add_connection_string', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNodeData),
      });
      if (response.ok) {
        setIsAddNodeOpen(false);
      } else {
        setNewNodeError('Failed to add node');
      }
    } catch (error) {
      setNewNodeError('Authorization check failed');
    }
  };

  const handleEditEnvironments = (node: Node) => {
    setSelectedNode(node);
    setIsEditEnvOpen(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Node Management</h1>
        <Dialog open={isAddNodeOpen} onOpenChange={setIsAddNodeOpen}>
          <DialogTrigger asChild>
            <Button variant="default">Add Node</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Node</DialogTitle>
              <DialogDescription className="text-sm text-red">
                Enter the details for the new node. If the node is remote, make sure you can access port 5555.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddNode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Node Name</Label>
                <Input
                  id="name"
                  value={newNodeData.name}
                  onChange={(e) => setNewNodeData({ ...newNodeData, name: e.target.value })}
                  placeholder="Enter node name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Node Type</Label>
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local" id="r1" onClick={() => setNewNodeData(oldData => ({...oldData, ip: '127.0.0.1', source: 'local'}))} />
                    <Label htmlFor="r1">Local</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remote" id="r2" onClick={() => setNewNodeData(oldData => ({...oldData, source: 'remote'}))} />
                    <Label htmlFor="r2">Remote</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  value={newNodeData && newNodeData.source == "local" ? "127.0.0.1" : newNodeData.ip}
                  disabled={newNodeData && newNodeData.source == "local"}
                  onChange={(e) => setNewNodeData({ ...newNodeData, ip: e.target.value })}
                  placeholder="Enter IP address"
                />
              </div>
              <Button type="submit" className="w-full">Add Node</Button>
            </form>
            <DialogFooter>
              <p className='text-sm text-red-500'>{newNodeError}</p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full border-r">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {nodes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No nodes available. Click "Add Node" to create one.
                  </div>
                ) : (
                  nodes.map((node) => (
                    <div key={node.node_id} onClick={() => setSelectedNode(node)}>
                      <NodeListItem
                        node={node}
                        onEditEnvironments={handleEditEnvironments}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={75}>
          <ScrollArea className="h-full">
            {selectedNode ? (
              <NodeDetails node={selectedNode} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Select a node to view details
              </div>
            )}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Dialog open={isEditEnvOpen} onOpenChange={setIsEditEnvOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Environments - {selectedNode?.name}</DialogTitle>
            <DialogDescription>
              Manage environments for this node
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {selectedNode?.environments?.map((env) => (
                <Card key={env.env_id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{env.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>IP Address</Label>
                        <Input 
                          value={env.ip} 
                          onChange={() => {}} 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Operating System</Label>
                        <Input 
                          value={env.os} 
                          onChange={() => {}} 
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListNodeSettings;
