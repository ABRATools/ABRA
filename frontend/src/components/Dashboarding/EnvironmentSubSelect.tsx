/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSubSelect.tsx
Description: Shows what can be viewed for an environment 
*/

import { useState } from "react";
import EnvironmentLogs from "./EnvironmentLogs";
import EnvironmentSummary from "./EnvironmentSummary";
import EnvironmentConfig from "./EnvironmentConfig";
import { Environment } from "@/types/environment";

export default function NodeSubSelect( envData: Environment ) {
    const [selectedMenu, setSelectedMenu] = useState('Summary');

    const renderContent = () => {
        switch (selectedMenu) {
            case 'Summary':
                return <EnvironmentSummary {...envData}/>;
            case 'Config':
                return <EnvironmentConfig {...envData}/>;
            case 'Environment Log':
                return <EnvironmentLogs {...envData}/>;
            default:
                return <EnvironmentSummary {...envData}/>;
        }
    };

    return (
        <>
        <div>
            {/* Menu for selecting different views */}
            <div className="flex justify-around px-[10px] my-[10px] border-b-[2px]">
                <button
                    onClick={() => setSelectedMenu('Summary')}
                    className="text-md"
                    style={{fontWeight: selectedMenu === 'Summary' ? 'bold' : 'normal'}}
                >
                    Summary
                </button>
                <button
                    onClick={() => setSelectedMenu('Config')}
                    className="text-md"
                    style={{fontWeight: selectedMenu === 'Config' ? 'bold' : 'normal'}}
                >
                    Config
                </button>
                <button
                    onClick={() => setSelectedMenu('Environment Log')}
                    className="text-md"
                    style={{fontWeight: selectedMenu === 'Environment Log' ? 'bold' : 'normal'}}
                >
                    Environment Log
                </button>
            </div>

            {/* Render the selected view */}
            <div>
                {renderContent()}
            </div>
        </div>
        </>
    );
}