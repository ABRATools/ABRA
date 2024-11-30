

import { Link } from "react-router-dom";

function handleLogout() {
  sessionStorage.removeItem("token");
  fetch("/logout", {
    method: "GET",
  }).then(() => {
    window.location.href = "/logout";
  });
}

export default function Navbar() {
  return (
    <div className="navbar min-h-[100px] bg-abra-accent">
      <div className="flex-1">
        <Link to="/dashboard" className="no-underline p-0 m-0 flex flex-row align-center">
            <h1 className="lg:text-4xl text-2xl self-center ml-10">ABRA Dashboard</h1>
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 text-lg visible inline-flex">
          <Link to="/users" className="no-underline">
            <li className="menu-title">Manage Users</li>
          </Link>
          <Link to="/audit" className="no-underline">
            <li className="menu-title">Audit ABRA</li>
          </Link>
          <Link to="/settings" className="no-underline">
            <li className="menu-title">Settings</li>
          </Link>
          <Link to="/nodes" className="no-underline">
            <li className="menu-title">Manage Nodes</li>
          </Link>
          <button onClick={handleLogout} className="menu-title">
            Logout
          </button>
        </ul>
      </div>
    </div>
    // </div>
  );
}

