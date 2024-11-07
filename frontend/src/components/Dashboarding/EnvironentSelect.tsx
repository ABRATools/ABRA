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
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            {/* Left Side - Node Buttons */}
            <div style={{ width: '30%', padding: '10px', borderRight: '1px solid #ccc' }}>
                {environments.map((env) => (
                    <button
                        key={env.id}
                        onClick={() => setSelectedEnv(env)}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: selectedEnv.id === env.id ? '#007bff' : '#f0f0f0',
                            color: selectedEnv.id === env.id ? '#fff' : '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {env.id}
                    </button>
                ))}
            </div>

            {/* Right Side - NodeSubSelect Component */}
            <div style={{ width: '70%', padding: '10px' }}>
                <EnvironmentSubSelect envData={selectedEnv} />
            </div>
        </div>
        </>
    );
}