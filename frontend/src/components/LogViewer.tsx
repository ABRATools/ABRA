{/* 
    LogViewer Components. Either file based or stream based as input and displays using the Lazylog to allow for efficient display with searching, scrolling, and coloring.     
*/}

import React from "react";
import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";

LazyLog.defaultProps.style = {
    contain: 'none',
    minHeight: '600px'
};

interface LogFileViewProps {
    endpoint: string;
    streaming?: boolean;
    scrolling?: boolean;
}

const LazyLogStyle = {
    contain: 'none',
    maxWidth: '600px'
  };

export const LogFileView: React.FC<LogFileViewProps> = ({ endpoint, streaming = false, scrolling = false }) => {
    return (
        <>
        { scrolling ? (
            <ScrollFollow
                startFollowing={true}
                render={({ follow, onScroll }) => (
                    <LazyLog
                        enableSearch
                        url={endpoint}
                        stream={!!streaming}
                        follow={true}
                        onScroll={onScroll}
                        height={1000}
                        containerStyle={LazyLogStyle}
                    />
                )}
            />
        ) : (
            <LazyLog url={endpoint} stream={!!streaming} />
        )}
        </>
    );
};