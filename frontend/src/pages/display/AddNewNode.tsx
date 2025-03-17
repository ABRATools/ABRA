import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";

type newNodeState = {
  name: string;
  ip: string;
  port: string;
};
interface CreateNodeResponse {
  Id?: string;
  Warnings?: string;
  message?: string
}

const AddNewNode: React.FC = () => {
  const [openNodeCreationDialog, setOpenNodeCreationDialog] = useState(false)
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newNodeState, setNewNodeState] = useState<newNodeState>({
    name: '',
    ip: '',
    port: '',
  });
  const [ipError, setIpError] = useState('');
  const ipRegex = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/;
  function validateIPAddress(ip: string): boolean {
    return ipRegex.test(ip);
  }

  function handleIPAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    const ip = e.target.value;
    if (ip && !validateIPAddress(ip)) {
      setIpError('Invalid IP address');
    } else {
      setIpError('');
    }
    setNewNodeState({
      ...newNodeState,
      ip: ip,
    });
  }
  
  const handleNodeCreation = async () => {
    if (!newNodeState.name || !newNodeState.ip || !newNodeState.port) {
      toast({
        title: "Validation Error",
        description: "Node name and URL are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // call api , send json
      const response = await fetch(`/api/nodes/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newNodeState.name,
          url: 'http://' + newNodeState.ip + ':' + newNodeState.port
        })
      });

      const data: CreateNodeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create container.');
      }

      toast({
        title: "Success",
        description: `Node "${newNodeState.name}" created successfully${data.Id ? ` with ID: ${data.Id.substring(0, 12)}` : ''}`,
        variant: "default",
      });

      setNewNodeState({
        name: '',
        ip: '',
        port: '',
      });

      setTimeout(() => {
        setOpenNodeCreationDialog(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error creating node', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to create node',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={openNodeCreationDialog} onOpenChange={setOpenNodeCreationDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setOpenNodeCreationDialog(true)}>
            <Box className="mr-2 h-4 w-4" />
            Add Node
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add node to system</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <Input
                placeholder="Node name"
                value={newNodeState.name || ''}
                className="mb-2 border-b border-border focus:border-primary bg-foreground text-black"
                onChange={(e) => setNewNodeState({
                  ...newNodeState,
                  name: e.target.value,
                })}
              />
              <div>
                <Input
                  placeholder="Node API IP Address"
                  value={newNodeState.ip || ''}
                  className="mb-2 border-b border-border focus:border-primary bg-foreground text-black"
                  onChange={(e) => handleIPAddressChange(e)}
                />
                <p className="text-sm text-red-500">{ipError}</p>
              </div>
              <Input
                placeholder="Node API Port"
                value={newNodeState.port || ''}
                className="mb-2 border-b border-border focus:border-primary bg-foreground text-black"
                onChange={(e) => setNewNodeState({
                  ...newNodeState,
                  port: e.target.value,
                })}
              />
            </div>
            <Button
              onClick={handleNodeCreation}
              variant="default"
              className="w-full"
              disabled={isLoading || !newNodeState.name || !newNodeState.ip || !newNodeState.port || !!ipError}
            >
              {isLoading ? "Creating..." : "Add Node"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddNewNode;
