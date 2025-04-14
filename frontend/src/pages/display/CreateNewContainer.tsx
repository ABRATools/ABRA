import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";

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
  const [openContainerCreationDialog, setOpenContainerCreationDialog] = useState(false);
  const [useStaticIP, setUseStaticIP] = useState(false);
  const [images, setImages] = useState<Image[]>();
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

  useEffect(() => {
    const fetchNames = async () => {
      if (!ipAddress) return; // catch this first!

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
        const json = await response.json()
        const images: Image[] = JSON.parse(json.images);
        setImages(images);
      } catch (err: any) {
        console.error('Error fetching images:', err);
        toast({
          title: "Error",
          description: err.message || 'Failed to fetch images',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (ipAddress) {
      fetchNames();
    }
  }, [ipAddress]); 

  useEffect(() => {
    const fetchEbpfModules = async () => {
      if (!openContainerCreationDialog) return;

      setLoadingEbpfModules(true);
      try {
        const names = await getEBPFModules();
        setEbpfModuleNames(names);
      } catch (err: any) {
        console.error('Error fetching eBPF modules:', err);
        toast({
          title: "Error",
          description: err.message || 'Failed to fetch eBPF modules',
          variant: "destructive",
        });
      } finally {
        setLoadingEbpfModules(false);
      }
    };

    fetchEbpfModules();
  }, [openContainerCreationDialog])

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

  // get the names for the dropdownmenu
  const dropDownImages = getImageNames();
  
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
      const response = await fetch(`/api/containers/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_ip: ipAddress,
          image: newContainerState.image,
          name: newContainerState.name,
          ip: newContainerState.ip,
          ebpfModules: newContainerState.ebpfModules
        })
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

      setNewContainerState({
        name: '',
        image: '',
        ip: '',
        ebpfModules: []
      });

      setUseStaticIP(false);

      // close dialog
      setTimeout(() => {
        setOpenContainerCreationDialog(false);
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

  return (
    <>
      <Dialog open={openContainerCreationDialog} onOpenChange={setOpenContainerCreationDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setOpenContainerCreationDialog(true)}>
            <Box className="mr-2 h-4 w-4" />
            Create Environment
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new environment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <Input
                placeholder="Container name"
                value={newContainerState.name}
                className="mb-2 border-b border-border focus:border-primary bg-foreground text-black"
                onChange={(e) => setNewContainerState({
                  ...newContainerState,
                  name: e.target.value,
                })}
              />
              <div>
                <label htmlFor="image-select" className="block text-sm font-medium">
                  Container image
                </label>
                <select
                  id="image-select"
                  value={newContainerState.image}
                  onChange={(e) =>
                    setNewContainerState((prevState) => ({
                      ...prevState,
                      image: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-foreground text-black"
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    {isLoading ? "Loading images..." : "Select a container image"}
                  </option>
                  {dropDownImages.map((item) => (
                    <option key={item} value={item} className="bg-foreground text-black">
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

              <div>
                <label className="block text-sm font-medium mb-2">
                  eBPF Modules
                </label>
                {loadingEbpfModules ? (
                  <p className="text-sm text-gray-500">Loading eBPF modules...</p>
                ) : (
                  <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto bg-foreground">
                    {ebpfModuleNames.length > 0 ? (
                      ebpfModuleNames.map((moduleName) => (
                        <div key={moduleName} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`ebpf-${moduleName}`}
                            checked={newContainerState.ebpfModules.includes(moduleName)}
                            onCheckedChange={(checked) => 
                              handleEbpfModuleSelection(moduleName, !!checked)
                            }
                          />
                          <label 
                            htmlFor={`ebpf-${moduleName}`} 
                            className="text-sm text-black cursor-pointer"
                          >
                            {moduleName}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No eBPF modules available</p>
                    )}
                  </div>
                )}
                {newContainerState.ebpfModules.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm">
                      Selected modules: <strong>{newContainerState.ebpfModules.join(', ')}</strong>
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
                    className="mb-2 border-b border-border focus:border-primary bg-foreground text-black"
                    onChange={(e) => handleIPAddressChange(e)}
                  />
                  <p className="text-sm text-red-500">{ipError}</p>
                </>
              )}
            </div>
            <Button
              onClick={handleContainerCreation}
              variant="default"
              className="w-full"
              disabled={isLoading || !newContainerState.name || !newContainerState.image}
            >
              {isLoading ? "Creating..." : "Create Environment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateNewContainer;
