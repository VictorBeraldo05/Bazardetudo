"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useNavigationFeedback } from "@/components/navigation-feedback-provider";
import { useToast } from "@/components/toast-provider";
import type { Product } from "@/lib/data";
import { reserveProduct } from "@/lib/api";
import { useCartStore } from "@/store/cart-store";

export function ProductActions({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const { startNavigation } = useNavigationFeedback();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBuyNow() {
    setLoading(true);
    setMessage(null);
    try {
      await reserveProduct(product.id, 1);
      addItem(product);
      showToast({
        tone: "success",
        title: "Produto reservado",
        description: "Estamos levando voce para o checkout."
      });
      startNavigation("/checkout");
      router.push("/checkout");
    } catch {
      setMessage("Este item nao pode ser reservado agora.");
      showToast({
        tone: "error",
        title: "Nao foi possivel reservar",
        description: "Tente novamente em instantes."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        <Button
          onClick={handleBuyNow}
          disabled={loading}
          className="h-14 w-full rounded-[1.35rem] bg-[#e05a36] px-6 text-base font-semibold text-white shadow-[0_18px_30px_-20px_rgba(224,90,54,0.9)] transition hover:bg-[#d24f2a]"
        >
          {loading ? "Reservando..." : "Comprar agora"}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            addItem(product);
            showToast({
              tone: "success",
              title: "Produto adicionado ao carrinho",
              description: product.name
            });
          }}
          className="h-14 w-full rounded-[1.35rem] border-[#d8c4af] bg-[#fffaf3] px-6 text-base font-semibold text-[#7f5634] transition hover:bg-[#f8eddc]"
        >
          Adicionar ao carrinho
        </Button>
      </div>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </div>
  );
}
