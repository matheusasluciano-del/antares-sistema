export type ProductStatus = "disponivel" | "reservado" | "vendido";
export type MovementType = "entrada" | "saida";
export type UserRole = "admin" | "gerente" | "vendedor";

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  size: string | null;
  image_url: string | null;
  cost_price: number;
  sale_price: number;
  status: ProductStatus;
  notes: string | null;
  created_at: string;
};

export type Movement = {
  id: string;
  type: MovementType;
  description: string;
  amount: number;
  quantity: number;
  occurred_at: string;
  product_id: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};

export type UserRoleRow = {
  id: string;
  user_id: string;
  role: UserRole;
};
