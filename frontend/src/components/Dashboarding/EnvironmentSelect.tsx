/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSelect.tsx
Description: Select which environment to look at (probably can save some logic from NodeSelect)
*/

import { useEffect, useState, useRef } from "react";
import EnvironmentSubSelect from "./EnvironmentSubSelect";
import { Environment } from '@/types/environment'
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"

export default function EnvironmentSelect( environments: Environment[] ) {
  const [data, setData] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const selectedIndexRef = useRef(0);

  useEffect(() => {
      const envArray = Object.values(environments);
      setData(envArray);

      // if valid index
      if (selectedIndexRef.current >= 0 && selectedIndexRef.current < envArray.length) {
        setSelectedEnv(envArray[selectedIndexRef.current]);
      } else {
        // default to 0th index if possible
        selectedIndexRef.current = envArray.length > 0 ? 0 : -1;
        setSelectedEnv(envArray[0] || null);
      }
  }, [environments]);

  const handleSelectionChange = (newIndex: number) => {
      selectedIndexRef.current = newIndex;
      setSelectedEnv(data[newIndex] || null);
  };

  return (
    <div className="flex flex-row w-full">
      {/* Left Side - Node Buttons */}
      <ResizablePanelGroup direction="horizontal" className="max-w-full">
        <ResizablePanel defaultSize={10} className="border-[#ccc] box-border border-r-[1px] min-h-144">
          <div className="flex flex-col h-full w-full">
            {data?.length ? data.map((env, index) => (
              <Button
                variant={selectedEnv && selectedEnv.env_id === env.env_id ? 'default' : 'ghost'}
                key={env.env_id}
                onClick={() => handleSelectionChange(index)}
                className="hover:bg-blue-700 hover:cursor-pointer rounded-none py-[10x] px-[20px] min-w-max"
                style={{
                    backgroundColor: selectedEnv && selectedEnv.env_id === env.env_id ? '#007bff' : '',
                }}
              >
                {env.name}
                </Button>
                )) :
                <p>No Environments</p>
              }
              <Separator/>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle/>

        <ResizablePanel defaultSize={90}>
          {/* Right Side - NodeSubSelect Component */}
          <div className="w-full">
              {selectedEnv ? <EnvironmentSubSelect {...selectedEnv}/> : <p>No Environment Selected</p>}
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}