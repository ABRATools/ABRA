import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// components are held in components folder in src folder
import IndexPage from './components/IndexPage'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage';
import ManageUsers from './components/ManageUsers';
import Audit from './components/Audit';
import Settings from './components/Settings';
import ManageNodes from './components/Management/ListNodeSettings';

// import SubmitEntry from './components/SubmitEntry'

import './output.css' // output of tailwind css render
import ListNodeSettings from './components/Management/ListNodeSettings';
import NodeManager from './components/Management/NodeManager';

const domNode = document.getElementById('root');
if (!domNode) {
  throw new Error('No root element found');
}
const root = createRoot(domNode);
root.render(
  <BrowserRouter>
    <Routes>
      <Route index element={<IndexPage />} />
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<ManageUsers />} />
      <Route path="/audit" element={<Audit />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/nodes" element={<NodeManager />} />
      {/* non-included path */}
      <Route path="*" element={<IndexPage />} />
    </Routes>
  </BrowserRouter>
);