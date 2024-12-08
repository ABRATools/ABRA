import { Node } from '@/types/node';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NodeListItem = ({ node, onEditEnvironments }: { node: Node; onEditEnvironments: (node: Node) => void }) => {
    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'online':
          return 'text-green-500';
        case 'offline':
          return 'text-red-500';
        default:
          return 'text-gray-500';
      }
    };

    console.log("Node list item: ", node);
  
    return (
        <Card className="w-full hover:bg-secondary/10 cursor-pointer transition-colors">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-base font-medium">{node.name}</CardTitle>
            <Button 
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditEnvironments(node);
              }}
              className="hover:bg-secondary hover:text-secondary-foreground"
            >
              Edit Environments
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-medium ${getStatusColor(node.status)}`}>
                {node.status || 'Unknown'}
              </span>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">{node.ip}</span>
            </div>
          </CardContent>
        </Card>
      );
    };

export default NodeListItem;