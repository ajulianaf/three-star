import Link from "next/link";
import CharacterCarousel from "@/components/CharacterCarousel";
import ProductCarousel from "@/components/ProductCarousel";

// Imágenes en /public/productos_destacados/ . Cada producto tiene su lista de imágenes (2 = carrusel con flechas).
const PRODUCTS = [
  { name: "Llaveros Three Star", images: ["/productos_destacados/llavero_1.png"] }, // una sola imagen: sin flechas
  { name: "Cofre Soul Bond", images: ["/productos_destacados/cofre_1.png", "/productos_destacados/cofre_2.png"] },
  { name: "Tote Bags Three Star", images: ["/productos_destacados/tote_1.png", "/productos_destacados/tote_2.png"] },
];

export default function Home() {
  return (
    <>
      {/* Carrusel a todo el ancho de la pantalla (fuera del contenedor con márgenes) */}
      <CharacterCarousel />

      <section className="pt-10">
        {/* Tamaño: ajústalo cambiando 4.5vw (más = más grande). Fórmula: 135 ÷ ancho del frame de Figma × 100 */}
        <h2 className="px-6 text-center text-[clamp(28px,4.5vw,86px)] leading-none text-white">Productos Destacados</h2>

        <div className="mx-auto max-w-4xl p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            {PRODUCTS.map((p) => (
              <div key={p.name} className="rounded-xl bg-card p-3 text-center text-white">
                <ProductCarousel images={p.images} alt={p.name} />
                <p className="mt-3 text-lg">{p.name}</p>
                <Link href="/tienda" className="mt-2 inline-block rounded bg-star px-4 py-1 text-sm text-black">Ver</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}