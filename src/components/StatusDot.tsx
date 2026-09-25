import type { ProductStatus } from "../types";

export const statusLabel: Record<ProductStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

export function StatusDot({ status }: { status: ProductStatus }) {
  return <span className={`status-dot status-${status}`} />;
}
