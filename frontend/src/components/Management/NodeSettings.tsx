import React, { useState } from 'react';
import { Node } from '../../types/node';

export default function NodeSettings({ node }: { node: Node }) {

    return (
        <div className="flex flex-row w-full justify-between min-w-max py-[25px]">
            <div>
                <h1 className="text-3xl font-semibold align-middle">{node.name}</h1>
            </div>
            <div>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Edit Environments
                </button>
            </div>
            <p>{node}</p>
        </div>
    );
}