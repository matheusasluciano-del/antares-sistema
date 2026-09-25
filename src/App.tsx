import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Estoque } from "./pages/Estoque";
import { Movimentacoes } from "./pages/Movimentacoes";
import { Precificacao } from "./pages/Precificacao";
import { Equipe } from "./pages/Equipe";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estoque"
            element={
              <ProtectedRoute>
                <Estoque />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movimentacoes"
            element={
              <ProtectedRoute>
                <Movimentacoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/precificacao"
            element={
              <ProtectedRoute>
                <Precificacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipe"
            element={
              <ProtectedRoute>
                <Equipe />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
