import { Environment } from "../types/environment";
import RechartVMResource from "./RechartVMResource";

export default function DisplayEnv(env: Environment) {
    return (
        <div className="p-4 border rounded-md bg-neutral-content shadow-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 mx-2 my-2 flex flex-col justify-between">
            <h2 className="text-lg font-semibold">{env.machine_name}</h2>
            <div className="flex justify-between mt-2">
                <p>{env.ip}:{env.port}</p>
                <p>{env.os}</p>
                <p>{env.status}</p>
                <p>{env.total_cpu} CPUs</p>
                <p>{env.total_memory} GB RAM</p>
                <p>{env.total_disk} GB Disk</p>
            </div>
            <div>
                {/* default VMAPI */}
                <RechartVMResource VMAPI="/get_resources" update_interval={10}/>
            </div>
        </div>
    )
};