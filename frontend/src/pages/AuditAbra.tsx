// display abra logs

import { LogFileView } from "@/components/LogViewer";

export default function AuditAbra() {
    const logEndpoint = "/api/stream_audit_log";
    
    /*
    Simple solution will be to just fetch the endpoint every x seconds and feed it to the component as a str
    */

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                <h1 className="text-3xl font-bold tracking-tight">ABRA Logs</h1>
                <p className="text-muted-foreground">
                    See audit logs relating to the ABRA portal itself.
                </p>
                </div>
            </div>

            <div className="flex-grow flex gap-4 min-w-md min-h-md">
                <div className="relative flex-1 min-w-md min-h-md">
                    <LogFileView endpoint={logEndpoint} streaming={true} scrolling={true}/>
                </div>
            </div>

        </div>
    ); 
};