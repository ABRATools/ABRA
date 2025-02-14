import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Configuration } from "@/types/configuration";
import { useToast } from "@/hooks/use-toast";

interface ViewConfigurationsProps {
    configurations: Configuration[];
    selectedImage: Configuration;
    onSelectImage: (config: Configuration) => void;
    loading: boolean;
}

function ViewConfigurations({ configurations, selectedImage, onSelectImage, loading }: ViewConfigurationsProps) {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    Loading configurations...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                Available Configurations
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {configurations.map((config) => (
                        <Button
                            key={config.name}
                            variant={selectedImage.name === config.name ? "default" : "outline"}
                            className="w-full text-left"
                            onClick={() => onSelectImage(config)}
                        >
                            {config.name}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface UploadConfigurationProps {
    selectedImage: Configuration;
    onUpdateImage: (config: Configuration) => void;
    onSave: () => Promise<void>;
    onDelete: () => Promise<void>;
}

function UploadConfiguration({ 
    selectedImage, 
    onUpdateImage, 
    onSave, 
    onDelete 
}: UploadConfigurationProps) {
    return (
        <Card>
            <CardHeader>
                Edit Configuration
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={selectedImage.name}
                            onChange={(e) => onUpdateImage({ 
                                ...selectedImage, 
                                name: e.target.value 
                            })}
                            placeholder="Configuration name"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                            value={selectedImage.content}
                            onChange={(e) => onUpdateImage({ 
                                ...selectedImage, 
                                content: e.target.value 
                            })}
                            placeholder="Configuration content"
                            className="min-h-[200px]"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={onSave}>
                    Save Changes
                </Button>
                <Button 
                    variant="destructive" 
                    onClick={onDelete}
                    disabled={!selectedImage.name}
                >
                    Delete Configuration
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function ContainerUpload() {
    const [selectedImage, setSelectedImage] = useState<Configuration>({
        name: '',
        content: ''
    });
    const [images, setImages] = useState<Configuration[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchContainers();
    }, []);

    const fetchContainers = async () => {
        try {
            console.log("Fetching containers...")
            const response = await fetch('/api/get_containers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            const contentType = response.headers.get("content-type");

            if (response.ok) {
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    setImages(data.images);
                } else {
                    const text = await response.text();
                    console.error('Received non-JSON response:', text);
                    toast({
                        title: 'Error',
                        description: 'Invalid response format from server',
                        variant: 'destructive',
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            toast({
                title: "Error",
                description: "Failed to fetch images",
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateContainer = async () => {
        try {
            console.log('Updating container...');
            const response = await fetch('/api/write_containers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    'filename': selectedImage.name,
                    'content': selectedImage.content
                })
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: 'Successfully updated image.'
                });
                fetchContainers();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update image",
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error updating image:', error);
            toast({
                title: "Error",
                description: "Failed to update image",
                variant: 'destructive',
            });
        }
    };

    const deleteContainer = async () => {
        try {
            const response = await fetch('/api/delete_container', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    'filename': selectedImage.name,
                })
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: 'Successfully deleted image. Irreversible btw.'
                });
                setSelectedImage({name: '', content: ''});
                fetchContainers();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete image.",
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast({
                title: "Error",
                description: "Failed to delete image",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <ViewConfigurations 
                configurations={images}
                selectedImage={selectedImage}
                onSelectImage={setSelectedImage}
                loading={loading}
            />
            <UploadConfiguration 
                selectedImage={selectedImage}
                onUpdateImage={setSelectedImage}
                onSave={updateContainer}
                onDelete={deleteContainer}
            />
        </div>
    );
}