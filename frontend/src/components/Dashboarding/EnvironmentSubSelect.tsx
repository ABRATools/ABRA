/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSubSelect.tsx
Description: Shows what can be viewed for an environment 
*/

import React, { useState } from "react";
import EnvironmentLogs from "./EnvironmentLogs";
import EnvironmentSummary from "./EnvironmentSummary";
import "../../styles/dashboard.css";

export default function NodeSubSelect({ envData }) {

    const [selectedMenu, setSelectedMenu] = useState('Summary');

    const renderContent = () => {
        switch (selectedMenu) {
            case 'Summary':
                return <EnvironmentSummary envData={envData}/>;
            // case "Environments":
            //     return <EnvironmentSelect environments={nodeData.environments}/>;
            case 'Env Log':
                return <EnvironmentLogs envData={envData}/>;
            default:
                return <EnvironmentSummary envData={envData}/>;
        }
    };

    return (
        <>
        <div>
            {/* Menu for selecting different views */}
            <div className="tab-buttons" style={{ display: 'flex', marginBottom: '1rem' }}>
                <button 
                    onClick={() => setSelectedMenu('Summary')}
                    className={selectedMenu === 'Summary' ? 'active' : ''}
                >
                    Summary
                </button>
                {/* <button onClick={() => setSelectedMenu('Environments')}>Environments</button> */}
                <button 
                    onClick={() => setSelectedMenu('Env Log')}
                    className={selectedMenu === 'Env Log' ? 'active' : ''}
                >
                    Env Log
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