/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSelect.tsx
Description: Select which environment to look at (probably can save some logic from NodeSelect)
*/

import { useState } from "react";
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
  const [selectedEnv, setSelectedEnv] = useState<Environment>(environments[0])
  return (
    <div className="flex flex-row w-full">
      {/* Left Side - Node Buttons */}
      <ResizablePanelGroup direction="horizontal" className="max-w-full">
        <ResizablePanel defaultSize={10} className="border-[#ccc] box-border border-r-[1px] min-h-144">
          <div className="flex flex-col h-full w-full">
            {Object.keys(environments).length ? Object.values(environments).map((env) => (
              <Button
                variant={selectedEnv.id === env.id ? 'default' : 'ghost'}
                key={env.id}
                onClick={() => setSelectedEnv(env)}
                className="hover:bg-blue-700 hover:cursor-pointer rounded-none py-[10x] px-[20px] min-w-max"
                style={{
                    backgroundColor: selectedEnv.id === env.id ? '#007bff' : '',
                    // color: selectedEnv.id === env.id ? '#fff' : '#000',
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
            <EnvironmentSubSelect {...selectedEnv} />
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}