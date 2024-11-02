

import { Link } from "react-router-dom";

function handleLogout() {
  fetch("/logout", {
    method: "POST",
  }).then(() => {
    window.location.href = "/";
  });
}

export default function Navbar() {
  return (
    <div className="navbar min-h-[100px] bg-abra-accent">
      <div className="flex-1">
        <Link to="/" className="no-underline p-0 m-0 flex flex-row align-center">
            <h1 className="lg:text-4xl text-2xl self-center ml-10">ABRA Dashboard</h1>
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 text-lg visible inline-flex">
          <li><button onClick={handleLogout} className="upper">
            Logout
            </button></li>
        </ul>
      </div>
    </div>
    // </div>
  );
}

