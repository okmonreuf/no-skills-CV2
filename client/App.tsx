import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { GeneralChatPage } from "@/pages/app/GeneralChatPage";
import { PrivateMessagesPage } from "@/pages/app/PrivateMessagesPage";
import { AdminPanelPage } from "@/pages/app/AdminPanelPage";
import { BannedUsersPage } from "@/pages/app/BannedUsersPage";
import LoginPage from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createRoot } from "react-dom/client";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<GeneralChatPage />} />
                <Route path="messages" element={<PrivateMessagesPage />} />
                <Route path="admin" element={<AdminPanelPage />} />
                <Route path="banned" element={<BannedUsersPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
