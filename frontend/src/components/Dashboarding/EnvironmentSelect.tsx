/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSelect.tsx
Description: Select which environment to look at (probably can save some logic from NodeSelect)
*/

import { useState } from "react";
import EnvironmentSubSelect from "./EnvironmentSubSelect";
import { Environment } from '@/types/environment'

export default function EnvironmentSelect( environments: Environment[] ) {
    const [selectedEnv, setSelectedEnv] = useState<Environment>(environments[0])
    return (
        <div className="flex flex-row w-full">
            {/* Left Side - Node Buttons */}
            <div className="flex flex-col max-h-max max-w-max border-[#ccc] box-border border-r-[1px] min-h-144">
                {Object.keys(environments).length ? Object.values(environments).map((env) => (
                    <button
                        key={env.id}
                        onClick={() => setSelectedEnv(env)}
                        className="hover:bg-blue-700 hover:cursor-pointer py-[10x] px-[20px] border border-foreground min-w-max bg-muted color-foreground"
                        style={{
                            backgroundColor: selectedEnv.id === env.id ? '#007bff' : '',
                            // color: selectedEnv.id === env.id ? '#fff' : '#000',
                        }}
                    >
                        {env.name}
                    </button>
                )) : <p>No Environments</p>}
            </div>

            {/* Right Side - NodeSubSelect Component */}
            <div className="w-full">
                <EnvironmentSubSelect {...selectedEnv} />
            </div>
        </div>
    );
}