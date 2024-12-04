import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import NodeSettings from "./NodeSettings";
import useAuth from "../../hooks/useAuth";
import LoadingDisplay from "../LoadingDisplay";
import { ThemeProvider } from "../Theming/ThemeProvider";
import { Node } from "../../types/node";

const REFRESH_INTERVAL = 10000;

async function FetchNodes(): Promise<Node[]> {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return [];
  }
  try {
    const response = await fetch("/node-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const json = await response.json();
      return json.nodes;
    } else {
      console.error("Failed to fetch nodes");
    }
  } catch (error) {
    console.error("Authorization check failed:", error);
  }
  return [];
}

// get user possible user settings such as changing password, email, updating 2FA, etc.
const Settings = () => {
  // useAuthenticateUser();
  const [, forceUpdate] = useState(true);
  const [data, setData] = useState<Node[] | null>(null);
  const [loading, setLoading] = useState(true);

  // console.log("Hello from above");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nodes = await FetchNodes();
        setData(nodes);
      } catch (error) {
        console.error("Failed to fetch nodes:", error);
      } finally {
        setLoading(false);
        forceUpdate((x) => !x);
      }
    };
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // add node button

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newNodeData, setNewNodeData] = useState<Node | null>(null);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!newNodeData) {
      return;
    }
    setNewNodeData({
      ...newNodeData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(newNodeData);
    try {
      const response = await fetch("/add_node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNodeData),
      });
      if (response.ok) {
        console.log("Successfully added node");
        setIsPopupOpen(false);
      } else {
        console.error("Failed to add node");
        console.log(response);
      }
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  // pretty much the same as ManageUsers.tsx, but add a thing for adding nodes
  return (
    <>
      <div>
        <Navbar />
        <div className="flex flex-col w-full px-[10px] lg:px-[10vw] gap-y-[20px]">
          <div className="flex flex-row w-full justify-between min-w-max py-[25px]">
            <div>
              <h1 className="text-3xl font-semibold align-middle">
                Manage Node Attributes
              </h1>
            </div>
            <button
              onClick={togglePopup}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Node
            </button>
          </div>
          {data?.map((node) => (
            <NodeSettings key={node.node_id} node={node} />
          ))}
        </div>

        {/* Popup Window */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-[500px]">
              <h2 className="text-2xl font-semibold mb-4">Add New Node</h2>
              {/* <form onSubmit={handleSubmit}> */}
              <form>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Node Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newNodeData?.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="ip"
                    className="block text-sm font-medium text-gray-700"
                  >
                    IP Address
                  </label>
                  <textarea
                    id="ip"
                    name="ip"
                    value={newNodeData?.ip}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={togglePopup}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default () => {
  const { isAuthorized, loading } = useAuth(() => {
    window.location.href = "/login";
  });
  if (isAuthorized) {
    console.log("Authorized");
  }
  if (loading) {
    return <LoadingDisplay />;
  }
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Settings />
    </ThemeProvider>
  );
};
