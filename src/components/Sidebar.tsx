import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Shirt,
  ArrowLeftRight,
  Calculator,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../lib/auth";

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor(a)",
};

export function Sidebar() {
  const { user, role, signOut } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">ANTARES</div>
        <div className="brand-sub">STREETWEAR MASCULINO</div>
      </div>

      <nav className="nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          <LayoutGrid size={16} /> Dashboard
        </NavLink>
        <NavLink
          to="/estoque"
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          <Shirt size={16} /> Estoque
        </NavLink>
        <NavLink
          to="/movimentacoes"
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          <ArrowLeftRight size={16} /> Entradas e saídas
        </NavLink>
        <NavLink
          to="/precificacao"
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          <Calculator size={16} /> Precificação
        </NavLink>
        <NavLink
          to="/equipe"
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          <Users size={16} /> Equipe
        </NavLink>
      </nav>

      <div className="user-box">
        <div className="user-email">{user?.email}</div>
        <div className="user-role">{role ? roleLabel[role] : "—"}</div>
        <button className="logout-btn" onClick={() => signOut()}>
          <LogOut size={14} /> Sair
        </button>
      </div>
    </aside>
  );
}
