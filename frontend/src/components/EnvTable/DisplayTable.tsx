import { columns } from "./Columns"
import { DataTable } from "./DataTable"
import { Environment } from "@/types/environment"

export default function EnvironmentTable( environments: Environment[] ) {
  const envArray = Object.values(environments)
  return (
    <div className="container mx-auto">
      <DataTable columns={columns} data={envArray} />
    </div>
  );
}
