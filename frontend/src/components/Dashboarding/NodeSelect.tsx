/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSelect.tsx
Description: Node Select Component (for selecting a node to focus on)
*/
import { useState } from 'react';
import NodeSubSelect from "./NodeSubSelect";
import { Node } from '@/types/node';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from '../ui/button';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"

export default function NodeSelect( nodes: Node[] ) {
    const nodeArr = Object.values(nodes);
    const [selectedNode, setSelectedNode] = useState<Node>(nodes[0]);
    return (
        <div className='flex flex-row w-full h-full min-h-[70vh] shadow-xl'>
            {/* Left Side - Node Buttons */}
            <ResizablePanelGroup direction="horizontal" className="max-w-full">
                <ResizablePanel defaultSize={10} className="border-[#ccc] box-border border-r-[2px] min-h-144">
                    <div className="h-full min-h-[70vh]">
                        <ScrollArea className="h-full min-w-fit w-full">
                            {/* {Object.keys(nodes).length ? Object.values(nodes).map((node) => ( */}
                            {nodeArr.length ? nodeArr.map((node) => (
                                <div className='flex flex-col w-full h-full'>
                                    <Button
                                        variant={selectedNode.node_id === node.node_id ? 'default' : 'ghost'}
                                        key={node.node_id}
                                        onClick={() => setSelectedNode(node)}
                                        className='hover:bg-blue-500 hover:cursor-pointer rounded-none text-lg px-[20px]'
                                        style={{
                                            backgroundColor: selectedNode.node_id === node.node_id ? '#007bff' : '',
                                        }}
                                    >
                                        {node.name}
                                    </Button>
                                    <Separator/>
                                </div>
                            )) :
                                <p>No Nodes</p>
                            }
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle/>

                <ResizablePanel defaultSize={90}>
                    {/* Right Side - NodeSubSelect Component */}
                    <div className="w-full h-full min-h-[70vh]">
                        <NodeSubSelect {...selectedNode} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}