"use client";
import { useState } from "react";

// Carrusel de imágenes de un producto. Con 2 o más imágenes muestra las flechas < > siempre visibles.
export default function ProductCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d: 1 | -1) => setI((v) => (v + d + n) % n);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-soul">
      <div className="flex h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {images.map((src, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={`${alt} ${k + 1}`} className="h-full min-w-full object-cover" />
        ))}
      </div>

      {n > 1 && (
        <>
          <button aria-label="Anterior" onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-[#FBC616] text-[#232350]">&lt;</button>
          <button aria-label="Siguiente" onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-[#FBC616] text-[#232350]">&gt;</button>
        </>
      )}
    </div>
  );
}