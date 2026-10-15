"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Line = { id: string; quantity: number };
type Ctx = { lines: Line[]; add: (id: string, q: number) => void; remove: (id: string) => void; clear: () => void; count: number };
const CartCtx = createContext<Ctx>(null as unknown as Ctx);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const add = (id: string, q: number) =>
    setLines((l) => (l.find((x) => x.id === id) ? l.map((x) => (x.id === id ? { ...x, quantity: x.quantity + q } : x)) : [...l, { id, quantity: q }]));
  const remove = (id: string) => setLines((l) => l.filter((x) => x.id !== id));
  const clear = () => setLines([]);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  return <CartCtx.Provider value={{ lines, add, remove, clear, count }}>{children}</CartCtx.Provider>;
}
