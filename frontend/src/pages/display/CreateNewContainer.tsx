<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
=======
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
<<<<<<< HEAD
import { useState } from "react";
=======
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569

type newContainerState = {
  name: string;
  image: string;
  ip?: string;
};

<<<<<<< HEAD
export default function CreateNewContainer() {
  const [openContainerCreationDialog, setOpenContainerCreationDialog] = useState(false);
  const [useStaticIP, setUseStaticIP] = useState(false);
  const [dropDownImages] = useState([
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ]);
=======
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

>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
  const [newContainerState, setNewContainerState] = useState<newContainerState>({
    name: '',
    image: '',
  });

<<<<<<< HEAD
  const handleSelectValueChange = (value: string) => {
    setNewContainerState(prevState => ({
      ...prevState,
      image: value,
    }));
  };
  
  const handleContainerCreation = async () => {
    console.log(newContainerState);
    setOpenContainerCreationDialog(false);
=======
  useEffect(() => {
    const fetchNames = async () => {
      if (!ipAddress) return; // catch this first!

      setIsLoading(true);

      try {
        const response = await fetch(
          `http://${ipAddress}:8888/images/list`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const data : Image[] = await response.json()
        setImages(data);
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
      // init submit data
      const formData = new URLSearchParams();
      formData.append('image', newContainerState.image);
      formData.append('name', newContainerState.name);

      // add static ip if we have that locked in
      if (useStaticIP && newContainerState.ip) {
        formData.append('ip', newContainerState.ip);
      }

      // call api
      const response = await fetch(`http://${ipAddress}:8888/containers/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
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
        ip: ''
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
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
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
<<<<<<< HEAD
=======
          
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
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
<<<<<<< HEAD
                      image: e.target.value,}))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                  <option value="" disabled>
                    Select a container image
                  </option>
                  {dropDownImages.map((item) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
=======
                      image: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    {isLoading ? "Loading images..." : "Select a container image"}
                  </option>
                  {dropDownImages.map((item) => (
                    <option key={item} value={item}>
                      {item}
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
                    </option>
                  ))}
                </select>

<<<<<<< HEAD
                <div className="mt-4">
                    <p>
                    Selected image: <strong>{newContainerState.image}</strong>
                    </p>
                </div>
=======
                {newContainerState.image && (
                  <div className="mt-4">
                    <p>
                      Selected image: <strong>{newContainerState.image}</strong>
                    </p>
                  </div>
                )}
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
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
                <Input
<<<<<<< HEAD
                  placeholder="IP Address"
                  value={newContainerState.ip}
=======
                  placeholder="IP Address (e.g. 192.168.1.100)"
                  value={newContainerState.ip || ''}
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
                  className="mb-2 border-b border-border focus:border-primary bg-foreground text-black"
                  onChange={(e) => setNewContainerState({
                    ...newContainerState,
                    ip: e.target.value,
                  })}
                />
              )}
            </div>
            <Button
              onClick={handleContainerCreation}
              variant="default"
              className="w-full"
<<<<<<< HEAD
              disabled={!newContainerState.name || !newContainerState.image}
            >
              Create Environment
=======
              disabled={isLoading || !newContainerState.name || !newContainerState.image}
            >
              {isLoading ? "Creating..." : "Create Environment"}
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
<<<<<<< HEAD
}
=======
}

export default CreateNewContainer;
>>>>>>> 25de404317bf60ba80b123aaae68ae430a85e569
