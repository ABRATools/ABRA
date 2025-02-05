import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "./layouts/DashboardLayout.tsx";
import Login from "./pages/Login.tsx";

// display pages
const SystemsDisplay = React.lazy(() => import("./pages/display/SystemsDisplay.tsx"));
const SystemDetail = React.lazy(() => import("./pages/display/SystemDetail.tsx"));
const NodeDetail = React.lazy(() => import("./pages/display/NodeDetail.tsx"));
const EnvironmentDetail = React.lazy(() => import("./pages/display/EnvironmentDetail.tsx"));

// config pages
const SystemsConfig = React.lazy(() => import("./pages/config/SystemConfigDetail.tsx"));
const SystemConfigDetail = React.lazy(() => import("./pages/config/SystemConfigDetail.tsx"));
const NodeConfigDetail = React.lazy(() => import("./pages/config/NodeConfigDetail.tsx"));
const EnvironmentConfigDetail = React.lazy(() => import("./pages/config/EnvironmentConfigDetail.tsx"));
const ConfigurationProfiles = React.lazy(() => import("./pages/config/ConfigurationProfiles.tsx"));

// management pages
const UserManagement = React.lazy(() => import("./pages/UserManagement.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/system" element={<Navigate to="/display/systems" replace />} />
        <Route path="/display/nodes" element={<Navigate to="/display/systems" replace />} />
        <Route path="/display/environments" element={<Navigate to="/display/systems" replace />} />
        <Route path="/config/nodes" element={<Navigate to="/config/systems" replace />} />
        <Route path="/config/environments" element={<Navigate to="/config/systems" replace />} />
        
        {/* dashboard */}
        <Route element={<DashboardLayout />}>
          {/* display */}
          <Route path="/display/systems" element={<SystemsDisplay />} />
          <Route path="/display/systems/:systemId" element={<SystemDetail />} />
          <Route path="/display/systems/:systemId/nodes/:nodeId" element={<NodeDetail />} />
          <Route path="/display/systems/:systemId/nodes/:nodeId/environments/:envId" element={<EnvironmentDetail />} />

          {/* config */}
          <Route path="/config/systems" element={<SystemsConfig />} />
          <Route path="/config/systems/:systemId" element={<SystemConfigDetail />} />
          <Route path="/config/systems/:systemId/nodes/:nodeId" element={<NodeConfigDetail />} />
          <Route path="/config/systems/:systemId/nodes/:nodeId/environments/:envId" element={<EnvironmentConfigDetail />} />
          <Route path="/config/profiles" element={<ConfigurationProfiles />} />

          {/* management */}
          <Route path="/users" element={<UserManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster />
  </QueryClientProvider>
);

export default App;