import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Node } from '@/types/machine';

interface WebSocketData {
    nodes: Node[];
}

interface WebSocketContextType {
    data: WebSocketData | null;
    isConnected: boolean;
    error: Error | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
    children: ReactNode;
    url: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, url }) => {
    const [data, setData] = useState<WebSocketData | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let ws: WebSocket;

        const connectWebSocket = () => {
            ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('Connected to websocket.');
                setIsConnected(true);
                setError(null);
                setSocket(ws);
            };

            ws.onmessage = (event: MessageEvent) => {
                try {
                    const receivedData: any = JSON.parse(event.data);
                    console.log("got data;", receivedData);
                    // handle various cases of data
                    if (Array.isArray(receivedData)) {
                        setData({ nodes: receivedData }); // got a list of nodes
                    } else if (receivedData.node_id) {
                        setData({ nodes: [receivedData] }); // got a single node
                    } else if (receivedData.nodes) {
                        setData(receivedData); // it has nodes already
                    } else {
                        console.warn("Unexpected data format from WebSocket:", receivedData);
                        setData({ nodes: [receivedData] });
                    }
                } catch (err) {
                    setError(new Error('Failed to parse web socket data'));
                    console.error('WebSocket data parsing error:', err);
                }
            };

            ws.onerror = (event: Event) => {
                console.error('websocket error:', event);
                setError(new Error('websocket conn error'));
            };

            ws.onclose = (event: CloseEvent) => {
                console.log('Disconnected from websocket:', event);
                setIsConnected(false);

                if (event.code != 1000) {
                    setTimeout(connectWebSocket, 5000);
                }
            };
        };

        connectWebSocket();

        return () => {
            if (ws) {
                ws.close(1000, 'Component unmounted');
            }
        };
    }, [url]);

    const contextValue: WebSocketContextType = {
        data,
        isConnected,
        error
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};