import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pendentes from "./pages/Pendentes";
import CadastroManual from "./pages/CadastroManual";
import ListaGeral from "./pages/ListaGeral";
import DetalhesEmail from "./pages/DetalhesEmail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pendentes"
            element={
              <ProtectedRoute>
                <Pendentes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cadastro-manual"
            element={
              <ProtectedRoute>
                <CadastroManual />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lista-geral"
            element={
              <ProtectedRoute>
                <ListaGeral />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detalhes/:id"
            element={
              <ProtectedRoute>
                <DetalhesEmail />
              </ProtectedRoute>
            }
          />

          {/* Redirect da raiz para dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
