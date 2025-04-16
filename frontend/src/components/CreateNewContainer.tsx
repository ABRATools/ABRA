import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Box, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

type newContainerState = {
  name: string;
  image: string;
  ip?: string;
  ebpfModules: string[];
};

type Props = {
  ipAddress: string;
}

interface Image {
  Id: string;
  ParentId: string;
  RepoTags: string[] | null;
  RepoDigests: string[];
  Created: number;
  Size: number;
  SharedSize: number;
  VirtualSize: number;
  Labels: {
    [key: string]: string;
  };
  Containers: number;
  Dangling: boolean;
  Arch: string;
  Digest: string;
  History: string[];
  IsManifestList: boolean;
  Os: string;
}

interface CreateContainerResponse {
  Id?: string;
  Warnings?: string;
  message?: string
}

const CreateNewContainer: React.FC<Props> = ({ ipAddress }) => {
  const [open, setOpen] = useState(false);
  const [isEBPFContainer, setIsEBPFContainer] = useState(false);
  const [useStaticIP, setUseStaticIP] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newContainerState, setNewContainerState] = useState<newContainerState>({
    name: '',
    image: '',
    ebpfModules: [],
  });
  const [ipError, setIpError] = useState('');
  const [ebpfModuleNames, setEbpfModuleNames] = useState<string[]>([]);
  const [loadingEbpfModules, setLoadingEbpfModules] = useState(false);
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
    setNewContainerState({
      ...newContainerState,
      ip: ip,
    });
  }

  const handleEbpfModuleSelection = (moduleName: string, isChecked: boolean) => {
    if (isChecked) {
      setNewContainerState({
        ...newContainerState,
        ebpfModules: [...newContainerState.ebpfModules, moduleName]
      });
    } else {
      setNewContainerState({
        ...newContainerState,
        ebpfModules: newContainerState.ebpfModules.filter(module => module !== moduleName)
      });
    }
  };

  // Load all data on initial render 
  useEffect(() => {
    if (ipAddress && open) {
      fetchImages();
      fetchEbpfModules();
    }
  }, [ipAddress, open]);

  // Separate functions for data loading
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/containers/list_images`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ target_ip: ipAddress })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const json = await response.json();
      const images: Image[] = JSON.parse(json.images);
      setImages(images);
    } catch (err: any) {
      console.error('Error fetching images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEbpfModules = async () => {
    setLoadingEbpfModules(true);
    try {
      const names = await getEBPFModules();
      setEbpfModuleNames(names);
    } catch (err: any) {
      console.error('Error fetching eBPF modules:', err);
    } finally {
      setLoadingEbpfModules(false);
    }
  };

  const getImageNames = (): string[] => {
    if (!images) return [];

    return images.map(image => {
      // try history field
      if (image.History && image.History.length > 0) {
        const historyName = image.History[0].split(':')[0];
        if (historyName) return historyName;
      }

      // then check repo tags
      if (image.RepoTags && image.RepoTags.length > 0) {
        const tagName = image.RepoTags[0].split(':')[0];
        if (tagName) return tagName;
      }

      // lastly, fallback to a shortened ID
      return image.Id.substring(0, 12);
    });
  };

  // get the names for the dropdownmenu and ensure they're all strings
  const dropDownImages = getImageNames().map(name => String(name));
  
  const getEBPFModules = async () => {
    const response = await fetch(
      '/ebpf/get_ebpf_module_names'
    );

    if (!response.ok) {
      throw new Error('Failed to get ebpf module names')
    }

    const data = await response.json();
    if (data && Array.isArray(data.module_names)) {
      return data.module_names;
    } else if (Array.isArray(data)) {
      // Fallback for direct array response
      return data;
    }
    
    return [];
  }

  const handleContainerCreation = async () => {
    if (!newContainerState.name || !newContainerState.image) {
      toast({
        title: "Validation Error",
        description: "Container name and image are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // call api , send json
      if (useStaticIP && !validateIPAddress(newContainerState.ip || '')) {
        toast({
          title: "Validation Error",
          description: "Invalid IP address",
          variant: "destructive",
        });
        return;
      }
      if (isEBPFContainer && newContainerState.ebpfModules.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one eBPF module must be selected",
          variant: "destructive",
        });
        return;
      }
      const creationEndpoint = isEBPFContainer ? '/api/containers/create-ebpf' : '/api/containers/create';
      const creationBody = ( isEBPFContainer ? {
        target_ip: ipAddress,
        image: newContainerState.image,
        name: newContainerState.name,
        ip: newContainerState.ip,
        ebpfModules: newContainerState.ebpfModules
        } : {
        target_ip: ipAddress,
        image: newContainerState.image,
        name: newContainerState.name,
        ip: newContainerState.ip
        });

      const response = await fetch(creationEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creationBody)
      });

      const data: CreateContainerResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create container.');
      }

      toast({
        title: "Success",
        description: `Container "${newContainerState.name}" created successfully${data.Id ? ` with ID: ${data.Id.substring(0, 12)}` : ''}`,
        variant: "default",
      });

      // Reset state
      setNewContainerState({
        name: '',
        image: '',
        ip: '',
        ebpfModules: []
      });
      setUseStaticIP(false);
      
      // Close dialog after success
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error creating container', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to create container',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    
    // Reset state when dialog closes
    setNewContainerState({
      name: '',
      image: '',
      ip: '',
      ebpfModules: []
    });
    setUseStaticIP(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Box className="mr-2 h-4 w-4" />
          Create Environment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new environment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <Input
              placeholder="Container name"
              value={newContainerState.name}
              className="mb-2 border-b border-border focus:border-primary"
              onChange={(e) => setNewContainerState({
                ...newContainerState,
                name: e.target.value,
              })}
            />
            
            <div>
              <label htmlFor="image-select" className="block text-sm font-medium mb-1">
                Container image
              </label>
              <select
                id="image-select"
                value={newContainerState.image}
                onChange={(e) => 
                  setNewContainerState((prev) => ({
                    ...prev,
                    image: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoading}
              >
                <option value="" disabled>
                  {isLoading ? "Loading images..." : "Select a container image"}
                </option>
                {dropDownImages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {newContainerState.image && (
                <div className="mt-4">
                  <p>
                    Selected image: <strong>{newContainerState.image}</strong>
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="static_ip"
                checked={useStaticIP}
                onCheckedChange={(checked) => setUseStaticIP(!!checked)}
              />
              <label htmlFor="static_ip" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Use a static IP address (optional)
              </label>
            </div>
            
            {useStaticIP && (
              <>
                <Input
                  placeholder="IP Address (default subnet 10.88.0.0/16)"
                  value={newContainerState.ip || ''}
                  className="mb-2 border-b border-border focus:border-primary"
                  onChange={(e) => handleIPAddressChange(e)}
                />
                {ipError && <p className="text-sm text-red-500">{ipError}</p>}
              </>
            )}
            
            {/* eBPF Modules Section */}
            <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_ebpf_container"
                checked={isEBPFContainer}
                onCheckedChange={(checked) => setIsEBPFContainer(!!checked)}
              />
              <label htmlFor="static_ip" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Is this an eBPF container?
              </label>
            </div>
            {isEBPFContainer && ( 
              <>
              <label className="text-sm font-medium">eBPF Modules</label>
              <div className="grid gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {loadingEbpfModules ? (
                  <div className="text-sm text-muted-foreground">Loading modules...</div>
                ) : ebpfModuleNames.length > 0 ? (
                  ebpfModuleNames.map(module => (
                    <div key={module} className="flex items-center gap-2">
                      <Checkbox
                        id={`module-${module}`} 
                        checked={newContainerState.ebpfModules.includes(module)}
                        onCheckedChange={(checked) => handleEbpfModuleSelection(module, !!checked)}
                      />
                      <label htmlFor={`module-${module}`} className="text-sm cursor-pointer flex items-center">
                        <Code className="mr-2 h-3.5 w-3.5" />
                        {module}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No eBPF modules available</div>
                )}
              </div>
              </>
            )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleContainerCreation}
            variant="default"
            className="w-full"
            disabled={isLoading || !newContainerState.name || !newContainerState.image}
          >
            {isLoading ? "Creating..." : "Create Environment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewContainer;