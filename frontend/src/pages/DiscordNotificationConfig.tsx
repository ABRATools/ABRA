import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast";

export type DiscordNotificationConfig = {
    notifier_id: string;
    webhook_name: string;
    webhook_url: string;
    enabled: boolean;
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DiscordNotificationConfig() {
    const [currentDiscordConfigs, setDiscordConfigs] = useState<DiscordNotificationConfig[]>([]);
    const [newDiscordConfig, setNewDiscordConfig] = useState<DiscordNotificationConfig>({
        notifier_id: "",
        webhook_name: "",
        webhook_url: "",
        enabled: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleAddConfig = async () => {
        try {
            const response = await fetch("/api/discord/add-config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: JSON.stringify(newDiscordConfig),
            });
            if (!response.ok) {
                throw new Error("Failed to add Discord configuration");
            }
            await fetchDiscordConfig();
        } catch (error) {
            console.error(error);
        }
    }

    const fetchDiscordConfig = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                "/api/discord/current-config", 
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch Discord configuration");
            }
            const data = await response.json();
            if (!data.notifiers) {
                throw new Error("Invalid response data");
            }
            const currentNotifiers: DiscordNotificationConfig[] = data.notifiers;
            setDiscordConfigs(currentNotifiers);
        } catch (error) {
            console.error(error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchDiscordConfig();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Discord Notification Configuration</h1>
                <p className="text-muted-foreground">
                    Configure the Discord webhook for notifications.
                </p>
            </div>
            <div className="w-full flex flex-row mt-4 items-end">
                <div className="justify-self-end max-w-fit">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Webhook
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Configure Discord Webhook</DialogTitle>
                            </DialogHeader>
                            <Label htmlFor="webhook_name" className="text-sm text-muted-foreground">
                                Webhook Name
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="webhook_name"
                                placeholder="Webhook Name"
                                className="mb-2 border-b border-foreground focus:border-primary"
                                value={newDiscordConfig.webhook_name}
                                onChange={(e) => setNewDiscordConfig({ ...newDiscordConfig, webhook_name: e.target.value })}
                            />
                            <Label htmlFor="webhook_url" className="text-sm text-muted-foreground">
                                Webhook URL
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="webhook_url"
                                placeholder="Webhook URL"
                                className="mb-2 border-b border-foreground focus:border-primary"
                                value={newDiscordConfig.webhook_url}
                                onChange={(e) => setNewDiscordConfig({ ...newDiscordConfig, webhook_url: e.target.value })}
                            />
                            <div className="flex w-full items-center justify-center">
                                <div className="flex w-[150px] items-center justify-between">
                                <span className="mr-2">Enable Webhook</span>
                                    <Switch
                                        className="border-foreground focus:border-primary"
                                        checked={newDiscordConfig.enabled}
                                        onCheckedChange={(checked) => setNewDiscordConfig({ ...newDiscordConfig, enabled: checked })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center w-full mt-4">
                                <Button
                                    variant="default"
                                    onClick={handleAddConfig}
                                    className="width-[40%] min-w-[50px]"
                                >
                                    Save
                                </Button>
                            </div>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="mt-2 border-foreground width-[40%] min-w-[50px]">
                                    Cancel
                                </Button>
                            </DialogTrigger>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading && <p>Loading...</p>}
            {isError && <p className="text-red-500">Error loading configuration</p>}
            {!isLoading && !isError && (
            <>
            <Card>
            <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent>
                <h2>Current Webhooks</h2>
                <div className="grid grid-cols-1 gap-4">
                    { currentDiscordConfigs.length === 0 ? (
                        <p className="text-muted-foreground">
                            No current Discord webhooks configured.
                        </p>
                    ) : (
                        currentDiscordConfigs.map((config, index) => (
                            <div key={index} className="border p-4 rounded-md">
                                <h3 className="text-lg font-semibold">{config.notifier_id}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Webhook ID: {config.notifier_id}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Webhook Name: {config.webhook_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Webhook URL: {config.webhook_url}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Enabled: {config.enabled ? "Yes" : "No"}
                                </p>
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