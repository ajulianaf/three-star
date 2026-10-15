"use client";

import { useState } from "react";

type IconProps = { className?: string };

function PlayIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8.5v7l6-3.5z" />
    </svg>
  );
}

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6" />
      <path d="M18 14.3c2.2.7 3.5 2.6 3.5 5.7" />
    </svg>
  );
}

function BookIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 6.5C10.5 5 8 4.5 3 4.5v14c5 0 7.5.5 9 2 1.5-1.5 4-2 9-2v-14c-5 0-7.5.5-9 2z" />
      <path d="M12 6.5v14" />
    </svg>
  );
}

const tabs = [
  { id: "animacion", label: "Animación", icon: PlayIcon },
  { id: "personajes", label: "Personajes", icon: UsersIcon },
  { id: "comic", label: "Cómic", icon: BookIcon },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* Medidas del menú, todas en "em" (escalan con el tamaño de fuente) */
const LINE_X = 2; // posición horizontal de la línea
const ROW = 4; // alto de cada fila
const PAD_TOP = 1.5; // espacio antes de la primera fila
const RADIUS = 1.5; // radio del medio círculo

/* Colores y brillo neón */
const RED = "#FF3B4E"; // color del neón (más brillante)
const GLOW =
  "drop-shadow(0 0 1px #ff2942) drop-shadow(0 0 4px #FF2E45) drop-shadow(0 0 10px #E11D2E) drop-shadow(0 0 22px rgba(225,29,72,0.9)) drop-shadow(0 0 10px rgba(225,29,72,0.6))";

export default function SoulBond() {
  const [active, setActive] = useState<TabId>("animacion");
  const index = tabs.findIndex((t) => t.id === active);

  // Posición del medio círculo según la pestaña activa
  const arcTop = PAD_TOP + index * ROW + ROW / 2 - RADIUS;

  return (
    <div className="bg-[#444] text-white">
      {/* Tabs en móvil */}
      <div className="flex gap-3 overflow-x-auto px-6 pt-6 md:hidden">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-1 text-base transition duration-300 ease-out ${
              active === id
                ? "border-[#FF3B4E] text-[#FF3B4E] shadow-[0_0_12px_rgba(255,59,78,0.8)]"
                : "border-transparent text-blood"
            }`}
          >
            <Icon className="h-6 w-6" />
            {label}
          </button>
        ))}
      </div>

      {/* Sin padding vertical: el menú llega hasta el footer */}
      <div className="flex min-h-[calc(100vh-5rem)]">
        {/* Sidebar (desktop) */}
        <nav className="relative ml-[3vw] hidden w-[12em] shrink-0 text-[clamp(1.1rem,1.5vw,1.75rem)] leading-none md:block">
          {/* Línea + medio círculo (con brillo neón) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ filter: GLOW }}
          >
            {/* Tramo superior */}
            <div
              className="absolute top-0 transition-[height] duration-300 ease-out motion-reduce:transition-none"
              style={{
                left: `calc(${LINE_X}em - 1.5px)`,
                width: 3,
                height: `${arcTop}em`,
                background: RED,
                boxShadow: "0 0 2px #fff6",
              }}
            />
            {/* Medio círculo que conecta ambos tramos */}
            <div
              className="absolute transition-[top] duration-300 ease-out motion-reduce:transition-none"
              style={{
                left: `${LINE_X}em`,
                top: `${arcTop}em`,
                width: `${RADIUS}em`,
                height: `${RADIUS * 2}em`,
                border: `3px solid ${RED}`,
                borderLeft: 0,
                borderRadius: `0 ${RADIUS}em ${RADIUS}em 0`,
              }}
            />
            {/* Tramo inferior: llega hasta el footer */}
            <div
              className="absolute bottom-0 transition-[top] duration-300 ease-out motion-reduce:transition-none"
              style={{
                left: `calc(${LINE_X}em - 1.5px)`,
                width: 3,
                top: `${arcTop + RADIUS * 2}em`,
                background: RED,
                boxShadow: "0 0 2px #fff6",
              }}
            />
          </div>

          {/* Opciones */}
          <ul className="relative z-10" style={{ paddingTop: `${PAD_TOP}em` }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => setActive(id)}
                    className="flex w-full items-center text-left"
                    style={{ height: `${ROW}em`, paddingLeft: `${LINE_X + 0.6}em` }}
                  >
                    <span
                      className="flex shrink-0 transition-[transform,color,filter] duration-300 ease-out motion-reduce:transition-none"
                      style={{
                        transform: isActive ? "translateX(-1.4em)" : "translateX(0)",
                        color: isActive ? RED : "rgba(179,18,43,0.85)",
                        filter: isActive ? "drop-shadow(0 0 4px rgba(255,59,78,0.8))" : "none",
                      }}
                    >
                      <Icon className="h-[1.6em] w-[1.6em]" />
                    </span>
                    <span
                      className="ml-[0.8em] transition-[transform,color,text-shadow] duration-300 ease-out motion-reduce:transition-none"
                      style={{
                        transform: isActive ? "translateX(-0.9em)" : "translateX(0)",
                        color: isActive ? RED : "rgba(179,18,43,0.85)",
                        textShadow: isActive ? "0 0 8px rgba(255,59,78,0.7)" : "none",
                      }}
                    >
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Contenido */}
        <section className="min-w-0 flex-1 px-6 py-10 md:px-10">
          <div
            key={active}
            className="mx-auto max-w-4xl animate-tab-in space-y-6 motion-reduce:animate-none"
          >
            {active === "animacion" && (
              <>
                {/* Coloca tu teaser en /public/soul-bond.mp4 */}
                <video
                  controls
                  poster="/soul-bond-poster.png"
                  className="aspect-video w-full bg-black"
                >
                  <source src="/soul-bond.mp4" type="video/mp4" />
                </video>

                <p className="text-justify text-base leading-relaxed text-white/80 md:text-lg">
                  Dos víctimas de conflictos que nunca eligieron: una, condenada a
                  vengarse eternamente; el otro, obligado a huir de una lista en la
                  que jamás pidió estar. Ambos se enfrentan, atrapados en un ciclo
                  que ninguno tiene el poder de terminar.
                </p>
              </>
            )}

            {active === "personajes" && (
              <p className="text-white/70">Próximamente: personajes de Soul Bond.</p>
            )}

            {active === "comic" && (
              <p className="text-white/70">Próximamente: cómic de Soul Bond.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}