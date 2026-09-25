import { useEffect, useState, type FormEvent } from "react";
import { Plus, ImageIcon, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Layout } from "../components/Layout";
import { StatusDot, statusLabel } from "../components/StatusDot";
import { useAuth } from "../lib/auth";
import { brl } from "../lib/format";
import type { Product, ProductStatus } from "../types";

const statuses: ProductStatus[] = ["disponivel", "reservado", "vendido"];

export function Estoque() {
  const { canManage, canSeeCosts, isAdmin, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | ProductStatus>("todos");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as unknown as Product[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: ProductStatus) {
    await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    load();
  }

  async function removeProduct(id: string) {
    if (!confirm("Remover esta peça?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  }

  async function uploadImage(file: File): Promise<string | null> {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage
      .from("produtos")
      .upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("produtos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const file = form.get("image") as File | null;
    let image_url: string | null = null;
    if (file && file.size > 0) image_url = await uploadImage(file);

    const { error: insertError } = await supabase.from("products").insert({
      name: String(form.get("name") ?? ""),
      sku: String(form.get("sku") ?? "") || null,
      category: String(form.get("category") ?? "") || null,
      size: String(form.get("size") ?? "") || null,
      cost_price: Number(String(form.get("cost_price") ?? "0").replace(",", ".")) || 0,
      sale_price: Number(String(form.get("sale_price") ?? "0").replace(",", ".")) || 0,
      status: (form.get("status") as ProductStatus) ?? "disponivel",
      notes: String(form.get("notes") ?? "") || null,
      image_url,
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

  const visible = products.filter(
    (p) =>
      (filter === "todos" || p.status === filter) &&
      (search.trim() === "" ||
        `${p.name} ${p.sku ?? ""} ${p.category ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  return (
    <Layout
      title="Estoque"
      subtitle={`${products.length} peça(s) cadastrada(s)`}
      actions={
        canManage ? (
          <button className="btn" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nova peça
          </button>
        ) : null
      }
    >
      <div className="filters">
        <input
          className="input"
          style={{ maxWidth: 260, marginTop: 0 }}
          placeholder="Buscar por nome, SKU ou categoria"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(["todos", ...statuses] as const).map((s) => (
          <button
            key={s}
            className={`chip${filter === s ? " active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s !== "todos" && <StatusDot status={s} />}
            {s === "todos" ? "Todos" : statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Carregando estoque...</p>
      ) : visible.length === 0 ? (
        <div className="surface empty-state">
          <p className="page-title" style={{ fontSize: 20 }}>
            Nenhuma peça por aqui
          </p>
          <p className="page-subtitle">
            {canManage
              ? "Cadastre a primeira peça para começar o controle."
              : "Assim que o gerente cadastrar peças, elas aparecem aqui."}
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {visible.map((p) => {
            const margem =
              canSeeCosts && Number(p.sale_price) > 0
                ? ((Number(p.sale_price) - Number(p.cost_price)) /
                    Number(p.sale_price)) *
                  100
                : null;
            return (
              <article key={p.id} className="surface product-card">
                <div className="product-image">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} />
                  ) : (
                    <ImageIcon size={32} />
                  )}
                  <span className="product-status-badge">
                    <StatusDot status={p.status} />
                  </span>
                </div>
                <div className="product-body">
                  <p className="product-category">
                    {p.category ?? "Sem categoria"}
                  </p>
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-meta">
                    {p.sku ? `SKU ${p.sku}` : "Sem SKU"}
                    {p.size ? ` · Tam. ${p.size}` : ""}
                  </p>
                  <div className="product-price-row">
                    <div>
                      <p className="price">{brl(p.sale_price)}</p>
                      {canSeeCosts && (
                        <p className="product-meta">
                          Custo {brl(p.cost_price)}
                          {margem !== null &&
                            ` · margem ${margem.toFixed(0)}%`}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        className="btn-ghost"
                        style={{
                          border: "none",
                          padding: 6,
                          borderRadius: 8,
                        }}
                        onClick={() => removeProduct(p.id)}
                        aria-label="Remover peça"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  {canManage && (
                    <select
                      className="input"
                      value={p.status}
                      onChange={(e) =>
                        updateStatus(p.id, e.target.value as ProductStatus)
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Cadastrar peça</h2>
            <form className="form-grid" onSubmit={handleCreate}>
              <div>
                <label className="label">Foto do produto</label>
                <input className="input" type="file" name="image" accept="image/*" />
              </div>
              <div>
                <label className="label">Nome</label>
                <input
                  className="input"
                  name="name"
                  required
                  placeholder="Camiseta oversized"
                />
              </div>
              <div className="field-row">
                <div>
                  <label className="label">Código / SKU</label>
                  <input className="input" name="sku" />
                </div>
                <div>
                  <label className="label">Tamanho</label>
                  <input className="input" name="size" placeholder="M" />
                </div>
              </div>
              <div>
                <label className="label">Categoria</label>
                <input className="input" name="category" placeholder="Camisetas" />
              </div>
              <div className="field-row">
                <div>
                  <label className="label">Custo (atacado)</label>
                  <input className="input" name="cost_price" defaultValue="0" />
                </div>
                <div>
                  <label className="label">Preço de venda</label>
                  <input className="input" name="sale_price" defaultValue="0" />
                </div>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" name="status" defaultValue="disponivel">
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea className="input" name="notes" rows={2} />
              </div>
              {error && <p className="error-text">{error}</p>}
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar peça"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
