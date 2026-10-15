"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS, cop } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function Store() {
  const [sel, setSel] = useState(PRODUCTS[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const router = useRouter();

  const pick = (p: typeof sel) => { setSel(p); setQty(1); setAdded(false); };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-2">
      <div className="grid grid-cols-3 gap-3 rounded-2xl bg-card p-4">
        {PRODUCTS.map((p) => (
          <button key={p.id} onClick={() => pick(p)}
            className={`flex aspect-square flex-col items-center justify-center rounded-xl bg-deep text-white transition hover:scale-105 ${sel.id === p.id ? "ring-4 ring-star" : ""}`}>
            <span className="text-4xl">{p.image}</span>
            <span className="mt-1 text-xs font-semibold">{p.name}</span>
          </button>
        ))}
      </div>

      <aside className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 text-white">
        <div className="flex h-56 w-full items-center justify-center rounded-xl bg-deep text-8xl">{sel.image}</div>
        <h2 className="text-2xl font-black">{sel.name}</h2>
        <p className="text-sm opacity-80">{sel.category} · {sel.stock} disponibles</p>
        <p className="text-3xl font-black text-star">{cop(sel.price)}</p>
        <div className="flex items-center gap-4">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 rounded-full bg-deep text-xl">−</button>
          <span className="w-6 text-center text-xl font-bold">{qty}</span>
          <button onClick={() => setQty(Math.min(sel.stock, qty + 1))} className="h-9 w-9 rounded-full bg-deep text-xl">+</button>
        </div>
        <div className="flex w-full gap-3">
          <button onClick={() => { add(sel.id, qty); setAdded(true); }} className="flex-1 rounded-lg bg-star py-3 font-bold text-black hover:brightness-110">
            {added ? "✓ Añadido" : "Añadir"}
          </button>
          <button onClick={() => { add(sel.id, qty); router.push("/checkout"); }} className="flex-1 rounded-lg bg-lime py-3 font-bold text-black hover:brightness-110">Comprar</button>
        </div>
      </aside>
    </div>
  );
}
