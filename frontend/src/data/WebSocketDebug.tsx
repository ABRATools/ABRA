import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/data/WebSocketContext";

export default function WebSocketDebug() {
  const { data, isConnected, error } = useWebSocket();
  const [rawData, setRawData] = React.useState<string>('No data received yet');

  React.useEffect(() => {
    if (data) {
      setRawData(JSON.stringify(data, null, 2));
    }
  }, [data]);

  const handleForceReconnect = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WebSocket Debug</h1>
          <p className="text-muted-foreground">
            Diagnostics for WebSocket connection
          </p>
        </div>
        <Button onClick={handleForceReconnect}>
          Force Reconnect
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {error && (
              <div className="text-red-500">
                <p className="font-medium">Error:</p>
                <p>{error.message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw WebSocket Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md font-mono text-sm h-96 overflow-auto">
            <pre>{rawData}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Node Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Total Nodes: {data?.nodes?.length || 0}</p>
            {data?.nodes && data.nodes.length > 0 && (
              <div className="bg-muted p-4 rounded-md font-mono text-sm max-h-60 overflow-auto">
                <pre>
                  {JSON.stringify(data.nodes[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}