/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSelect.tsx
Description: Node Select Component (for selecting a node to focus on)
*/

// imports
import { useState, useEffect } from "react";
import NodeSubSelect from "./NodeSubSelect";
import { Node } from "../../types/node";

export default function NodeSelect() {
  const [nodes, setNodes] = useState<Node[] | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch("/get_nodes");
        if (response.ok) {
          const data = await response.json();
          const nodeData: Node[] = data["nodes"]; // this isnt working because the response is not in the correct format *** FIX LATER
          setNodes(nodeData);
          console.log("Got nodes: ", nodes);
        } else {
          console.error("Failed to fetch nodes");
        }
      } catch (error) {
        console.error("Error fetching nodes:", error);
      }
    };
    fetchNodes();
    if (nodes && nodes.length !== 0) { 
      setSelectedNode(nodes[0]);
      console.log("Selected node: ", nodes[0]);
    }
    else {
      setSelectedNode(nodes[0]); // forcing it to have a value
      console.log("Nodes are null or empty");
    }
  }, []); 

  //
  // if nodes is null, return link to manage nodes page?

  if (nodes === null) {
    return (
      <div>
        <h1>Nodes are null</h1>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row w-full h-full">
        {/* Left Side - Node Buttons */}
        <div className="max-w-[5vw] min-w-min border-[#ccc] border-r-[1px] h-full box-border min-h-144">
          {selectedNode &&
            nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="hover:bg-blue-300 hover:cursor-pointer rounded-sm mb-4 text-lg py-[10x] px-[20px] lg:py-[20x] lg:px-[40px]"
                style={{
                  backgroundColor:
                    selectedNode.id === node.id ? "#007bff" : "#f0f0f0",
                  color: selectedNode.id === node.id ? "#fff" : "#000",
                }}
              >
                {node.id}
              </button>
            ))}
        </div>

        {/* Right Side - NodeSubSelect Component */}
        <div className="w-full h-full">
          <NodeSubSelect nodeData={selectedNode} />
        </div>
      </div>
    </>
  );
}
