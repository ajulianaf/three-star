"use client";
import { useState } from "react";
import { PRODUCTS, cop } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function Checkout() {
  const { lines, remove } = useCart();
  const [f, setF] = useState({ name: "", email: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rows = lines.map((l) => ({ ...l, p: PRODUCTS.find((p) => p.id === l.id)! }));
  const total = rows.reduce((s, r) => s + r.p.price * r.quantity, 0);
  const input = "w-full rounded-lg bg-deep p-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-star";

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: f, items: lines.map((l) => ({ productId: l.id, quantity: l.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en el checkout");
      window.location.href = data.paymentUrl; // pantalla de pago de Mercado Pago
    } catch (err: any) {
      setError(err.message); setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-2">
      <section className="rounded-2xl bg-card p-6 text-white">
        <h2 className="mb-4 text-xl font-black">Resumen de compra</h2>
        {rows.length === 0 && <p className="opacity-70">Tu carrito está vacío.</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between border-b border-white/10 py-2">
            <span>{r.p.image} {r.p.name} × {r.quantity}</span>
            <span className="flex items-center gap-3">{cop(r.p.price * r.quantity)}
              <button onClick={() => remove(r.id)} className="text-xs text-blood">✕</button></span>
          </div>
        ))}
        <p className="mt-4 text-right text-2xl font-black text-star">Total: {cop(total)}</p>
      </section>

      <form onSubmit={pay} className="space-y-3 rounded-2xl bg-card p-6">
        <h2 className="text-xl font-black text-white">Datos de envío</h2>
        {(["name", "email", "address", "city"] as const).map((k) => (
          <input key={k} required type={k === "email" ? "email" : "text"} className={input}
            placeholder={{ name: "Nombre completo", email: "Correo", address: "Dirección", city: "Ciudad" }[k]}
            value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
        ))}
        {error && <p className="text-sm text-star">{error}</p>}
        <button disabled={loading || !rows.length} className="w-full rounded-lg bg-lime py-3 font-bold text-black disabled:opacity-50">
          {loading ? "Procesando…" : "Pagar con Mercado Pago"}
        </button>
      </form>
    </div>
  );
}
