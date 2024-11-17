/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSelect.tsx
Description: Select which environment to look at (probably can save some logic from NodeSelect)
*/

import React, { useState } from "react";
import EnvironmentSubSelect from "./EnvironmentSubSelect";

export default function EnvironmentSelect( { environments }) {

    const [selectedEnv, setSelectedEnv] = useState(environments[0])

    return (
        <>
        <div className="flex flex-row w-full">
            {/* Left Side - Node Buttons */}
            <div className="flex flex-col gap-[10px] max-h-max max-w-max border-[#ccc] box-border border-r-[1px] min-h-128">
                {environments.map((env) => (
                    <button
                        key={env.id}
                        onClick={() => setSelectedEnv(env)}
                        className="hover:bg-blue-700 hover:cursor-pointer rounded-sm py-[10x] px-[20px] mb-2"
                        style={{
                            backgroundColor: selectedEnv.id === env.id ? '#007bff' : '#f0f0f0',
                            color: selectedEnv.id === env.id ? '#fff' : '#000',
                        }}
                    >
                        {env.id}
                    </button>
                ))}
            </div>

            {/* Right Side - NodeSubSelect Component */}
            <div className="w-full">
                <EnvironmentSubSelect envData={selectedEnv} />
            </div>
        </div>
        </>
    );
}