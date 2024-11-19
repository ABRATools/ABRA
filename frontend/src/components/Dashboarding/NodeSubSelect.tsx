/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSubSelect.tsx
Description: Secondary dashboard selection after choosing your node -> what do you want to see about your node?
*/

// imports
import { useState } from 'react';
import NodeSummary from "./NodeSummary";
import EnvironmentSelect from "./EnvironentSelect";
import NodeLogs from "./NodeLogs";
import NodeConfig from "./NodeConfig";

export default function NodeSubSelect({ nodeData }) {

    const [selectedMenu, setSelectedMenu] = useState('Summary');

    const renderContent = () => {
        switch (selectedMenu) {
            case 'Summary':
                return <NodeSummary nodeData={nodeData}/>;
            case 'Config':
                return <NodeConfig nodeData={nodeData}/>;
            case "Environments":
                return <EnvironmentSelect environments={nodeData.environments}/>;
            case 'Total Log':
                return <NodeLogs nodeData={nodeData}/>;
            default:
                return <NodeSummary nodeData={nodeData}/>;
        }
    };

    return (
        <>
        <div className="rounded-[8px] my-auto">
            {/* Menu for selecting different views */}
            <div className="flex justify-between px-[20px] text-xl border-b-[2px]">
                <button
                    onClick={() => setSelectedMenu('Summary')}
                    className={selectedMenu === 'Summary' ? 'font-bold' : ''}
                >
                    Summary
                </button>
                <button
                    onClick={() => setSelectedMenu('Config')}
                    className={selectedMenu === 'Config' ? 'font-bold' : ''}
                >
                    Config
                </button>
                <button
                    onClick={() => setSelectedMenu('Environments')}
                    className={selectedMenu === 'Environments' ? 'font-bold' : ''}
                >
                    Environments
                </button>
                <button
                    onClick={() => setSelectedMenu('Total Log')}
                    className={selectedMenu === 'Total Log' ? 'font-bold' : ''}
                >
                    Total Log
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