import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { supabase } from "../lib/supabase";
import { Layout } from "../components/Layout";
import { useAuth } from "../lib/auth";
import { brl, dayLabel, todayISO, shortDate } from "../lib/format";
import type { Movement, MovementType, Product } from "../types";

export function Movimentacoes() {
  const { user, isAdmin } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Pick<Product, "id" | "name">[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("movements")
      .select("*")
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) setMovements(data as unknown as Movement[]);

    const { data: prods } = await supabase
      .from("products")
      .select("id, name")
      .order("name");
    if (prods) setProducts(prods as unknown as Pick<Product, "id" | "name">[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const productId = String(form.get("product_id") ?? "");

    const { error: insertError } = await supabase.from("movements").insert({
      type: (form.get("type") as MovementType) ?? "entrada",
      description: String(form.get("description") ?? ""),
      amount: Number(String(form.get("amount") ?? "0").replace(",", ".")) || 0,
      quantity: Number(form.get("quantity") ?? 1) || 1,
      occurred_at: String(form.get("occurred_at") ?? todayISO()),
      product_id: productId && productId !== "none" ? productId : null,
      created_by: user?.id ?? null,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta movimentação?")) return;
    await supabase.from("movements").delete().eq("id", id);
    load();
  }

  const entradas = movements
    .filter((m) => m.type === "entrada")
    .reduce((s, m) => s + Number(m.amount), 0);
  const saidas = movements
    .filter((m) => m.type === "saida")
    .reduce((s, m) => s + Number(m.amount), 0);

  const byDay = new Map<string, { day: string; entradas: number; saidas: number }>();
  for (const m of [...movements].reverse()) {
    const row = byDay.get(m.occurred_at) ?? {
      day: dayLabel(m.occurred_at),
      entradas: 0,
      saidas: 0,
    };
    if (m.type === "entrada") row.entradas += Number(m.amount);
    else row.saidas += Number(m.amount);
    byDay.set(m.occurred_at, row);
  }
  const chart = Array.from(byDay.values()).slice(-14);

  return (
    <Layout
      title="Entradas e saídas"
      subtitle="Todo o dinheiro que entra e sai da Antares"
      actions={
        <button className="btn" onClick={() => setOpen(true)}>
          <Plus size={16} /> Nova movimentação
        </button>
      }
    >
      <div className="stat-grid">
        <div className="surface stat-card">
          <p className="stat-label">Entradas</p>
          <p className="stat-value text-success">{brl(entradas)}</p>
        </div>
        <div className="surface stat-card">
          <p className="stat-label">Saídas</p>
          <p className="stat-value text-danger">{brl(saidas)}</p>
        </div>
        <div className="surface stat-card" style={{ borderColor: "rgba(226,56,46,0.4)" }}>
          <p className="stat-label">Saldo</p>
          <p className="stat-value text-primary">{brl(entradas - saidas)}</p>
        </div>
      </div>

      <section className="surface" style={{ padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20 }}>
          Entradas x saídas por dia
        </h2>
        <div style={{ height: 280, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ left: -18, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#9a9a9a" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="#9a9a9a" fontSize={12} />
              <Tooltip
                cursor={{ fill: "#1f1f1f" }}
                contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12 }}
                formatter={(v: number) => brl(v)}
              />
              <Legend />
              <Bar dataKey="entradas" name="Entradas" fill="#3ecf8e" radius={4} />
              <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="surface" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Qtd</th>
              <th style={{ textAlign: "right" }}>Valor</th>
              {isAdmin && <th />}
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td style={{ color: "var(--muted)" }}>{shortDate(m.occurred_at)}</td>
                <td>{m.description}</td>
                <td style={{ color: "var(--muted)" }}>{m.quantity}</td>
                <td
                  style={{ textAlign: "right", fontWeight: 600 }}
                  className={m.type === "entrada" ? "text-success" : "text-danger"}
                >
                  {m.type === "entrada" ? "+" : "−"}
                  {brl(m.amount)}
                </td>
                {isAdmin && (
                  <td style={{ textAlign: "right" }}>
                    <button className="btn-ghost" onClick={() => remove(m.id)}>
                      Excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: "var(--muted)", padding: 24 }}>
                  Nenhuma movimentação registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Registrar movimentação</h2>
            <form className="form-grid" onSubmit={handleCreate}>
              <div>
                <label className="label">Tipo</label>
                <select className="input" name="type" defaultValue="entrada">
                  <option value="entrada">Entrada (venda / recebimento)</option>
                  <option value="saida">Saída (compra / despesa)</option>
                </select>
              </div>
              <div>
                <label className="label">Descrição</label>
                <input className="input" name="description" required placeholder="Venda camiseta" />
              </div>
              <div className="field-row">
                <div>
                  <label className="label">Valor</label>
                  <input className="input" name="amount" defaultValue="0" />
                </div>
                <div>
                  <label className="label">Quantidade</label>
                  <input className="input" name="quantity" type="number" min="1" defaultValue="1" />
                </div>
              </div>
              <div>
                <label className="label">Data</label>
                <input className="input" name="occurred_at" type="date" defaultValue={todayISO()} />
              </div>
              <div>
                <label className="label">Peça relacionada (opcional)</label>
                <select className="input" name="product_id" defaultValue="none">
                  <option value="none">Nenhuma</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              {error && <p className="error-text">{error}</p>}
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Registrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
