"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { reserveProduct } from "@/lib/api";
import { useCartStore } from "@/store/cart-store";

export function ProductActions({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBuyNow() {
    setLoading(true);
    setMessage(null);
    try {
      await reserveProduct(product.id, 1);
      addItem(product);
      router.push("/checkout");
    } catch {
      setMessage("Este item nao pode ser reservado agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleBuyNow} disabled={loading}>
          {loading ? "Reservando..." : "Comprar agora"}
        </Button>
        <Button variant="outline" onClick={() => addItem(product)}>
          Adicionar ao carrinho
        </Button>
        <Button variant="ghost" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, "_blank")}>
          Compartilhar no WhatsApp
        </Button>
      </div>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </div>
  );
}
