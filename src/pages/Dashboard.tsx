import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "../lib/supabase";
import { Layout } from "../components/Layout";
import { brl, dayLabel } from "../lib/format";
import type { Movement, Product } from "../types";

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => data && setProducts(data as unknown as Product[]));
    supabase
      .from("movements")
      .select("*")
      .order("occurred_at")
      .then(({ data }) => data && setMovements(data as unknown as Movement[]));
  }, []);

  const disponiveis = products.filter((p) => p.status === "disponivel").length;
  const reservados = products.filter((p) => p.status === "reservado").length;
  const vendidos = products.filter((p) => p.status === "vendido").length;

  const vendas = movements.filter((m) => m.type === "entrada");
  const totalVendas = vendas.reduce((s, m) => s + Number(m.amount), 0);

  const byDay = new Map<string, number>();
  for (const m of vendas) {
    byDay.set(m.occurred_at, (byDay.get(m.occurred_at) ?? 0) + Number(m.amount));
  }
  const chart = Array.from(byDay.entries())
    .map(([day, total]) => ({ day: dayLabel(day), total }))
    .slice(-14);

  return (
    <Layout title="Dashboard" subtitle="Visão geral da Antares">
      <div className="stat-grid">
        <div className="surface stat-card">
          <p className="stat-label">Peças em estoque</p>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="surface stat-card">
          <p className="stat-label">Disponíveis</p>
          <p className="stat-value text-success">{disponiveis}</p>
        </div>
        <div className="surface stat-card">
          <p className="stat-label">Reservados</p>
          <p className="stat-value" style={{ color: "#f5b942" }}>
            {reservados}
          </p>
        </div>
        <div className="surface stat-card">
          <p className="stat-label">Vendidos</p>
          <p className="stat-value text-danger">{vendidos}</p>
        </div>
        <div className="surface stat-card">
          <p className="stat-label">Total em vendas</p>
          <p className="stat-value text-primary">{brl(totalVendas)}</p>
        </div>
      </div>

      <section className="surface" style={{ padding: 20 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20 }}>
          Vendas por dia
        </h2>
        <div style={{ height: 300, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ left: -18, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#9a9a9a" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="#9a9a9a" fontSize={12} />
              <Tooltip
                cursor={{ stroke: "#2a2a2a" }}
                contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12 }}
                formatter={(v: number) => brl(v)}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#e2382e"
                strokeWidth={2}
                dot={{ fill: "#e2382e", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </Layout>
  );
}
