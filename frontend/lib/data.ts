export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  damageNotes: string;
  condition: string;
  status: "available" | "reserved" | "awaiting_payment" | "sold";
  price: number;
  compareAtPrice: number;
  tags: string[];
  featured?: boolean;
  image: string;
};

export const products: Product[] = [
  {
    id: "1",
    slug: "buffet-aparador-oslo",
    name: "Buffet Aparador Oslo",
    category: "Decoracao",
    description: "Buffet premium com desenho limpo, acabamento fosco e proporcao ideal para salas elegantes.",
    damageNotes: "Pequeno risco lateral discreto, sem impacto estrutural.",
    condition: "Excelente",
    status: "available",
    price: 1290,
    compareAtPrice: 1790,
    tags: ["Novo lote", "Ultima unidade"],
    featured: true,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "2",
    slug: "air-fryer-glass-pro-5l",
    name: "Air Fryer Glass Pro 5L",
    category: "Eletrodomesticos",
    description: "Modelo touch com cuba em vidro, visual moderno e alta praticidade para a rotina.",
    damageNotes: "Caixa avariada e marca leve no puxador.",
    condition: "Muito bom",
    status: "reserved",
    price: 349,
    compareAtPrice: 499,
    tags: ["Oferta", "Promocao"],
    image: "https://images.unsplash.com/photo-1585515656825-7d02ec5aac64?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "3",
    slug: "poltrona-linho-areia",
    name: "Poltrona Linho Areia",
    category: "Moveis",
    description: "Poltrona de leitura com tecido neutro e design contemporaneo.",
    damageNotes: "Pequena mancha na base traseira.",
    condition: "Bom",
    status: "available",
    price: 890,
    compareAtPrice: 1290,
    tags: ["Retirada imediata"],
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
  }
];

export const categories = ["Moveis", "Eletrodomesticos", "Decoracao", "Utilidades"];

export const dashboardStats = [
  { label: "Faturamento do mes", value: "R$ 86.420" },
  { label: "Produtos reservados", value: "18" },
  { label: "Pedidos pendentes", value: "12" },
  { label: "Ticket medio", value: "R$ 742" }
];

