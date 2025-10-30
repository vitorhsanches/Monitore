import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NewOccurrence from "./pages/NewOccurrence";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/nova-ocorrencia" element={
              <ProtectedRoute>
                <NewOccurrence />
              </ProtectedRoute>
            } />
            <Route path="/minhas-ocorrencias" element={
              <ProtectedRoute>
                <div>Minhas Ocorrências - Em desenvolvimento</div>
              </ProtectedRoute>
            } />
            <Route path="/mapa" element={
              <ProtectedRoute>
                <div>Mapa - Em desenvolvimento</div>
              </ProtectedRoute>
            } />
            <Route path="/painel-gestor" element={
              <ProtectedRoute>
                <div>Painel Gestor - Em desenvolvimento</div>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
