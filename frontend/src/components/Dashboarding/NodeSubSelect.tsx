/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSubSelect.tsx
Description: Secondary dashboard selection after choosing your node -> what do you want to see about your node?
*/

// imports
import React, { useState } from 'react';
import NodeSummary from "./NodeSummary";
import EnvironmentSelect from "./EnvironentSelect";
import NodeLogs from "./NodeLogs";
import "../../styles/dashboard.css";

export default function NodeSubSelect({ nodeData }) {

    const [selectedMenu, setSelectedMenu] = useState('Summary');

    const renderContent = () => {
        switch (selectedMenu) {
            case 'Summary':
                return <NodeSummary nodeData={nodeData}/>;
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
        <div className="node-sub-select">
            {/* Menu for selecting different views */}
            <div className="tab-buttons" style={{ display: 'flex', marginBottom: '1rem' }}>
                <button 
                    onClick={() => setSelectedMenu('Summary')} 
                    className={selectedMenu === 'Summary' ? 'active' : ''}
                >
                    Summary
                </button>
                <button 
                    onClick={() => setSelectedMenu('Environments')} 
                    className={selectedMenu === 'Environments' ? 'active' : ''}
                >
                    Environments
                </button>
                <button 
                    onClick={() => setSelectedMenu('Total Log')} 
                    className={selectedMenu === 'Total Log' ? 'active' : ''}
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