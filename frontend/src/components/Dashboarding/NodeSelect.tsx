/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSelect.tsx
Description: Node Select Component (for selecting a node to focus on)
*/
import { useEffect, useRef, useState } from 'react';
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
    const [data, setData] = useState<Node[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(nodes[0]);
    const selectedIndexRef = useRef(-1);

    useEffect(() => {
        // why does react do this? why can't I just use the nodes array?
        const nodesArray = Object.values(nodes);
        setData(nodesArray);

        // if valid index
        if (selectedIndexRef.current >= 0 && selectedIndexRef.current < nodesArray.length) {
            setSelectedNode(nodesArray[selectedIndexRef.current]);
        } else {
            // default to 0th index if possible
            selectedIndexRef.current = nodesArray.length > 0 ? 0 : -1;
            setSelectedNode(nodesArray[0] || null);
        }
    }, [nodes]);
  
    const handleSelectionChange = (newIndex: number) => {
        selectedIndexRef.current = newIndex;
        setSelectedNode(data[newIndex] || null);
    };
    // fetchNodes();
    // if (nodes && nodes.length !== 0) { 
    //   setSelectedNode(nodes[0]);
    //   console.log("Selected node: ", nodes[0]);
    // }
    // else {
    //   setSelectedNode(nodes[0]); // forcing it to have a value
    //   console.log("Nodes are null or empty");
    // }
  // }, []); 

    return (
        <div className='flex flex-row w-full h-full min-h-[70vh] shadow-xl'>
            {/* Left Side - Node Buttons */}
            <ResizablePanelGroup direction="horizontal" className="max-w-full">
                <ResizablePanel defaultSize={10} className="border-[#ccc] box-border border-r-[2px] min-h-144">
                    <div className="h-full min-h-[70vh]">
                        <ScrollArea className="h-full min-w-fit w-full">
                            {data.length ? data.map((node, index) => (
                                <div className='flex flex-col w-full h-full'>
                                    <Button
                                        variant={selectedNode && selectedNode.node_id === node.node_id ? 'default' : 'ghost'}
                                        key={node.node_id}
                                        onClick={() => handleSelectionChange(index)}
                                        className='hover:bg-blue-500 hover:cursor-pointer rounded-none text-lg px-[20px]'
                                        style={{
                                            backgroundColor: selectedNode && selectedNode.node_id === node.node_id ? '#007bff' : '',
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
                    {selectedNode ? (
                        <div className="w-full h-full min-h-[70vh]">
                            <NodeSubSelect {...selectedNode} />
                        </div>
                    ) : (
                        <div className="w-full h-full min-h-[70vh]">
                            <p>No Node Selected</p>
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
  }