import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import Perfil from "./pages/Perfil";
import NovaOcorrencia from "./pages/NovaOcorrencia";
import MinhasOcorrencias from "./pages/MinhasOcorrencias";
import TodasOcorrencias from "./pages/TodasOcorrencias";
import DetalheOcorrencia from "./pages/DetalheOcorrencia";
import PainelGestor from "./pages/PainelGestor";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import Mapa from "./pages/Mapa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/install" element={<Install />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/nova-ocorrencia" element={<NovaOcorrencia />} />
          <Route path="/minhas-ocorrencias" element={<MinhasOcorrencias />} />
          <Route path="/todas-ocorrencias" element={<TodasOcorrencias />} />
          <Route path="/ocorrencia/:id" element={<DetalheOcorrencia />} />
          <Route path="/painel-gestor" element={<PainelGestor />} />
          <Route path="/admin-tickets" element={<AdminTicketsPage />} />
          <Route path="/mapa" element={<Mapa />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
