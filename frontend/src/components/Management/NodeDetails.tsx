import React from 'react';
import { Node } from '@/types/node';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

const NodeDetails = ({ node }: { node: Node }) => {
    if (!node) return null;

    console.log("Node details: ", node);
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{node.name}</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>IP Address</Label>
            <p className="mt-1 font-medium">{node.ip}</p>
          </div>
          <div>
            <Label>Operating System</Label>
            <p className="mt-1 font-medium">{node.os}</p>
          </div>
          <div>
            <Label>Status</Label>
            <p className="mt-1 font-medium">{node.status}</p>
          </div>
          <div>
            <Label>Uptime</Label>
            <p className="mt-1 font-medium">{node.uptime || 'N/A'}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <Label>CPU Usage</Label>
              <span className="text-sm font-medium">{node.cpu_percent}%</span>
            </div>
            <Progress value={node.cpu_percent} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label>Memory Usage</Label>
              <span className="text-sm font-medium">
                {Math.round((node.memory / node.max_memory) * 100)}%
              </span>
            </div>
            <Progress value={Math.round((node.memory / node.max_memory) * 100)} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label>Disk Usage</Label>
              <span className="text-sm font-medium">
                {Math.round((node.disk / node.max_disk) * 100)}%
              </span>
            </div>
            <Progress value={Math.round((node.disk / node.max_disk) * 100)} className="h-2" />
          </div>
        </div>
      </div>
    );
  };

export default NodeDetails;