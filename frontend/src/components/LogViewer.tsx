{/* 
    LogViewer Components. Either file based or stream based as input and displays using the Lazylog to allow for efficient display with searching, scrolling, and coloring.     
*/}

import React from "react";
import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";

interface LogFileViewProps {
    endpoint: string;
    streaming?: boolean;
    scrolling?: boolean;
}

export const LogFileView: React.FC<LogFileViewProps> = ({ endpoint, streaming = false, scrolling = false }) => {
    return (
        <>
        { scrolling ? (
            <ScrollFollow
                startFollowing={true}
                render={({ follow, onScroll }) => (
                    <LazyLog url={endpoint} stream={streaming} follow={follow} onScroll={onScroll} />
                )}
            />
        ) : (
            <LazyLog url={endpoint} stream={streaming} />
        )}
        </>
    );
};