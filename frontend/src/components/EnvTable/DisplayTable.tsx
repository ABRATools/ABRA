import { useEffect, useState } from "react"
import { Course, Environment, columns } from "./Columns"
import { DataTable } from "./DataTable"

async function FetchEnvironments(): Promise<Environment[]> {
  const token = sessionStorage.getItem('token');
  if (!token) {
    return [];
  }
  try {
    const response = await fetch('/authorized-courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const total_envs: Environment[] = [];
      const json = await response.json();
      for (const c of json.courses) {
        const course: Course = JSON.parse(c);
        for (const env of course.environments) {
          total_envs.push(env);
        }
      }      
      return total_envs;
    }
  } catch (error) {
    console.error('Authorization check failed:', error);
  }
    return [];
}

export default function EnvironmentTable() {
  const [data, setData] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const environments = await FetchEnvironments();
        setData(environments);
      } catch (error) {
        console.error('Failed to fetch environments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mx-auto">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
