/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSubSelect.tsx
Description: Secondary dashboard selection after choosing your node -> what do you want to see about your node?
*/

import { useState } from 'react';
import NodeSummary from "./NodeSummary";
import EnvironmentSelect from "./EnvironmentSelect";
import NodeLogs from "./NodeLogs";
import NodeConfig from "./NodeConfig";
import { Node } from '@/types/node';

export default function NodeSubSelect(nodeData: Node) {
    console.log('NodeData:', nodeData);
    const [selectedMenu, setSelectedMenu] = useState('Summary');
    const renderContent = () => {
        switch (selectedMenu) {
            case 'Summary':
                return <NodeSummary {...nodeData}/>;
            case 'Config':
                return <NodeConfig {...nodeData}/>;
            case "Environments":
                return <EnvironmentSelect {...nodeData.environments}/>;
            case 'Total Log':
                return <NodeLogs {...nodeData}/>;
            default:
                return <NodeSummary {...nodeData}/>;
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