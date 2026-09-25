export function brl(value: number | string) {
  const n = Number(value) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function shortDate(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function dayLabel(iso: string) {
  return shortDate(iso);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
