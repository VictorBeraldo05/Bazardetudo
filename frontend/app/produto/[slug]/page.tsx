import Image from "next/image";
import { notFound } from "next/navigation";

import { ProductActions } from "@/components/product-actions";
import { getProductBySlug } from "@/lib/api";
import { money } from "@/lib/utils";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="shell py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2.5rem]">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">{product.category}</p>
            <h1 className="font-display text-4xl">{product.name}</h1>
            <p className="text-base text-black/60">{product.description}</p>
          </div>
          <div className="rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-card">
            <p className="text-sm text-black/45">Condicao</p>
            <p className="mt-1 font-semibold">{product.condition}</p>
            <p className="mt-4 text-sm text-black/45">Avaria</p>
            <p className="mt-1">{product.damageNotes}</p>
            <p className="mt-4 text-sm text-black/45">Status</p>
            <p className="mt-1 capitalize">{product.status}</p>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-semibold">{money(product.price)}</p>
              <p className="text-sm text-black/40 line-through">{money(product.compareAtPrice)}</p>
            </div>
            <p className="rounded-full bg-black px-3 py-2 text-sm text-white">
              Economia de {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
            </p>
          </div>
          <ProductActions product={product} />
        </div>
      </div>
    </main>
  );
}
