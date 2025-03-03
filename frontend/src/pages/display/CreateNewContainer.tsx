import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { useState } from "react";

type newContainerState = {
  name: string;
  image: string;
  ip?: string;
};

export default function CreateNewContainer() {
  const [openContainerCreationDialog, setOpenContainerCreationDialog] = useState(false);
  const [useStaticIP, setUseStaticIP] = useState(false);
  const [dropDownImages] = useState([
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ]);
  const [newContainerState, setNewContainerState] = useState<newContainerState>({
    name: '',
    image: '',
  });

  const handleSelectValueChange = (value: string) => {
    setNewContainerState(prevState => ({
      ...prevState,
      image: value,
    }));
  };
  
  const handleContainerCreation = async () => {
    console.log(newContainerState);
    setOpenContainerCreationDialog(false);
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
                      image: e.target.value,}))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                  <option value="" disabled>
                    Select a container image
                  </option>
                  {dropDownImages.map((item) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                  ))}
                </select>

                <div className="mt-4">
                    <p>
                    Selected image: <strong>{newContainerState.image}</strong>
                    </p>
                </div>
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
                  placeholder="IP Address"
                  value={newContainerState.ip}
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
              disabled={!newContainerState.name || !newContainerState.image}
            >
              Create Environment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}