import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Layout } from "../components/Layout";
import type { Profile, UserRole, UserRoleRow } from "../types";

const roleLabel: Record<UserRole, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor(a)",
};

export function Equipe() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRoleRow[]>([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .then(({ data }) => data && setProfiles(data as unknown as Profile[]));
    supabase
      .from("user_roles")
      .select("id, user_id, role")
      .then(({ data }) => data && setRoles(data as unknown as UserRoleRow[]));
  }, []);

  function roleOf(userId: string): UserRole | null {
    return roles.find((r) => r.user_id === userId)?.role ?? null;
  }

  return (
    <Layout title="Equipe" subtitle="Quem tem acesso ao sistema da Antares">
      <div className="surface" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Papel</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const role = roleOf(p.id);
              return (
                <tr key={p.id}>
                  <td>{p.full_name ?? "—"}</td>
                  <td>{p.email}</td>
                  <td>{role ? roleLabel[role] : "Sem papel definido"}</td>
                </tr>
              );
            })}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "var(--muted)", padding: 24 }}>
                  Nenhum integrante cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="product-meta" style={{ marginTop: 16 }}>
        Para adicionar alguém à equipe, crie o usuário em Supabase → Authentication,
        e depois defina o papel dele na tabela <code>user_roles</code>.
      </p>
    </Layout>
  );
}
