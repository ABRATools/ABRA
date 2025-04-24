{/* 
    LogViewer Components. Either file based or stream based as input and displays using the Lazylog to allow for efficient display with searching, scrolling, and coloring.     
*/}

import React from "react";
import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";

LazyLog.defaultProps.style = {
    contain: 'none',
    minHeight: '300px'
};

interface LogFileViewProps {
    endpoint: string;
    streaming?: boolean;
    scrolling?: boolean;
    fetchOptions?: RequestInit | undefined;
    height?: number;
}

const LazyLogStyle = {
    contain: 'none',
    maxWidth: '600px'
  };

export const LogFileView: React.FC<LogFileViewProps> = ({ endpoint, streaming = false, scrolling = false, fetchOptions = undefined, height=1000 }) => {
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
                        fetchOptions={fetchOptions}
                        follow={true}
                        onScroll={onScroll}
                        height={height}
                        containerStyle={LazyLogStyle}
                    />
                )}
            />
        ) : (
            <LazyLog url={endpoint} stream={!!streaming} fetchOptions={fetchOptions} height={height}/>
        )}
        </>
    );
};