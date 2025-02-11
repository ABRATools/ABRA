import { useState } from "react";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Configuration } from "@/types/configuration";

function ViewConfigurations() {
    return (
        <Card>
            <CardHeader>
            Hi
            </CardHeader>
            <CardContent>
            Hello
            </CardContent>
            <CardFooter>
            Howdy
            </CardFooter>
        </Card>
    );
}

function UploadConfiguration() {
    return (
        <Card>
            <CardHeader>
            Hi
            </CardHeader>
            <CardContent>
            Hello
            </CardContent>
            <CardFooter>
            Howdy
            </CardFooter>
        </Card>
    );
}

export default function ContainerUpload() {

    const [ currentConfig, useCurrentConfig ] = useState<Configuration>({
        name: '',
        config: ''
    });

    const fetchContainers = async () => {
        try {
            return {};
        } else {
            return {};
        } catch (error) {
            return {};
        }
    }

    const handleSelection = () => {

    }

    return (
        <div>
            <ViewConfigurations />
            <UploadConfiguration />
        </div>
    );
}