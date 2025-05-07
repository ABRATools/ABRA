import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import AddNewNode from "@/components/AddNewNode";

export type ConnectionString = {
    name: string;
    connection_string: string;
    description?: string;
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConnectionStrings() {
    const [open, setOpen] = useState(false);
    const [currentConnStrs, setConnStrs] = useState<ConnectionString[]>([]);
    const [newConnectionString, setNewConnectionString] = useState<ConnectionString>({
        name: "",
        connection_string: "",
        description: undefined,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleDeleteConnStr = async (connstr_name: string) => {
        try {
            const response = await fetch("/connection-strings/delete-connstr", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: JSON.stringify({ connstr_name }),
            });
            if (!response.ok) {
                throw new Error("Failed to delete Discord configuration");
            }
            await fetchConnectionStrings();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to delete connection string",
                variant: "destructive",
            });
        }
        toast({
            title: "Success",
            description: `Connection string "${connstr_name}" deleted successfully.`,
            variant: "default",
        });
    }

    const fetchConnectionStrings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                "/connection-strings/fetch-all", 
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to fetch connection strings",
                    variant: "destructive",
                });
                throw new Error("Failed to fetch connection strings");
            }
            const data = await response.json();
            if (!data.connection_strings) {
                toast({
                    title: "Error",
                    description: "Invalid response data",
                    variant: "destructive",
                });
                throw new Error("Invalid response data");
            }
            const current: ConnectionString[] = data.connection_strings;
            setConnStrs(current);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch connection strings",
                variant: "destructive",
            });
            console.error(error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchConnectionStrings();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Manage Connection Strings</h1>
            </div>
            <AddNewNode/>
            {isLoading && <p>Loading...</p>}
            {isError && <p className="text-red-500">Error loading node connection strings</p>}
            {!isLoading && !isError && (
            <>
            <Card>
            <CardHeader>
                <CardTitle>Current Connection Strings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4">
                    { currentConnStrs.length === 0 ? (
                        <p className="text-muted-foreground">
                            No current connection strings configured.
                        </p>
                    ) : (
                        currentConnStrs.map((config, index) => (
                            <div key={index} className="flex flex-row items-center gap-x-2 rounded-md p-2 justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{config.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Name: {config.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        URL: {config.connection_string}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Description: {config.description || "No description provided"}
                                    </p>
                                </div>
                                <div className="py-4 h-full flex flex-col items-center max-w-fit">
                                    <div>
                                        <Button variant="outline" className="w-full" onClick={() => handleDeleteConnStr(config.name)}>
                                            <Trash2 className="mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
            </Card>
            </>
            )}
        </div>
    ); 
};