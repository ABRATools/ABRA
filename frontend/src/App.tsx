import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "./layouts/DashboardLayout.tsx";
import { AuthProvider } from "./auth/AuthContext.tsx";
import { ProtectedRoute } from "./auth/ProtectedRoute.tsx";
import Login from "./pages/Login.tsx";
import { ApiErrorHandler } from "./lib/api-error-handler.ts";

// display pages
const SystemsDisplay = React.lazy(() => import("./pages/display/SystemsDisplay.tsx"));
const SystemDetail = React.lazy(() => import("./pages/display/SystemDetail.tsx"));
const NodeDetail = React.lazy(() => import("./pages/display/NodeDetail.tsx"));
const EnvironmentDetail = React.lazy(() => import("./pages/display/EnvironmentDetail.tsx"));

// config pages
const SystemsConfig = React.lazy(() => import("./pages/config/SystemsConfig.tsx"));
const SystemConfigDetail = React.lazy(() => import("./pages/config/SystemConfigDetail.tsx"));
const NodeConfigDetail = React.lazy(() => import("./pages/config/NodeConfigDetail.tsx"));
const EnvironmentConfigDetail = React.lazy(() => import("./pages/config/EnvironmentConfigDetail.tsx"));
const ConfigurationProfiles = React.lazy(() => import("./pages/config/ConfigurationProfiles.tsx"));
const ContainerUpload = React.lazy(() => import("./pages/config/ContainerUpload.tsx"));

// management pages
const UserManagement = React.lazy(() => import("./pages/UserManagement.tsx"));
const GroupManagement = React.lazy(() => import("./pages/GroupManagement.tsx"));

const queryClient = new QueryClient();


const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected routes */}
      {/* <Route element={<ProtectedRoute />}> */}
        <Route element={<DashboardLayout />}>
          {/* Redirects */}
          <Route path="/system" element={<Navigate to="/display/systems" replace />} />
          <Route path="/display/nodes" element={<Navigate to="/display/systems" replace />} />
          <Route path="/display/environments" element={<Navigate to="/display/systems" replace />} />
          <Route path="/config/nodes" element={<Navigate to="/config/systems" replace />} />
          <Route path="/config/environments" element={<Navigate to="/config/systems" replace />} />
          
          {/* Display routes */}
          <Route path="/display/systems" element={<SystemsDisplay />} />
          <Route path="/display/systems/:systemId" element={<SystemDetail />} />
          <Route path="/display/systems/:systemId/nodes/:nodeId" element={<NodeDetail />} />
          <Route path="/display/systems/:systemId/nodes/:nodeId/environments/:envId" element={<EnvironmentDetail />} />
          
          {/* Config routes */}
          <Route path="/config/systems" element={<SystemsConfig />} />
          <Route path="/config/systems/:systemId" element={<SystemConfigDetail />} />
          <Route path="/config/systems/:systemId/nodes/:nodeId" element={<NodeConfigDetail />} />
          <Route path="/config/systems/:systemId/nodes/:nodeId/environments/:envId" element={<EnvironmentConfigDetail />} />
          <Route path="/config/profiles" element={<ConfigurationProfiles />} />
          <Route path="/config/containers" element={<ContainerUpload />} />

          {/* Management routes */}
          <Route path="/users" element={<UserManagement />} />
          <Route path="/access" element={<GroupManagement />} />
        </Route>
      {/* </Route> */}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {/* <AuthProvider> */}
      <ApiErrorHandler />
      <AppRoutes />
      {/* </AuthProvider> */}
      <Toaster />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;