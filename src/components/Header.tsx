"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const TABS = [
  ["Inicio", "/"],
  ["Soul Bond", "/soul-bond"],
  ["Tienda", "/tienda"],
  ["Nosotros", "/nosotros"],
];

export default function Header() {
  const path = usePathname();
  const { count } = useCart();
  const isSoul = path.startsWith("/soul-bond");

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

  return (
    <header
      className={`flex items-center justify-between px-6 py-3 text-white ${
        isSoul ? "bg-[#130005]" : "bg-[#9B8EE0]"
      }`}
    >
      {/* Logo: en Soul Bond se muestra una imagen con tamaño fijo.
          Cambia la ruta de src por la de tu imagen (ej. /soul-bond-logo.png) */}
      {isSoul ? (
        <Link href="/soul-bond" className="block h-14 w-40 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/SoulBond_logo.png"
            alt="Soul Bond"
            className="h-full w-full object-contain object-left"
          />
        </Link>
      ) : (
        <Link href="/" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Three Star" className="h-14 w-auto" />
        </Link>
      )}

      <nav className="flex gap-6 text-lg">
        {TABS.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={
              isActive(href)
                ? isSoul
                  ? "text-[#E11D2E] underline decoration-2 underline-offset-4"
                  : "text-[#FBC616] underline decoration-2 underline-offset-4"
                : isSoul
                ? "hover:text-white/70"
                : "hover:text-lime"
            }
          >
            {label}
          </Link>
        ))}
      </nav>

      <Link href="/checkout" className="rounded-full bg-star px-4 py-1 text-sm text-black">
        🛒 Carrito ({count})
      </Link>
    </header>
  );
}