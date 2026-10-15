"use client";
import { useEffect, useRef, useState } from "react";

// ---------- TIEMPOS (milisegundos) ----------
const MIN_MS = 1200;  // la estela tarda al menos esto en llenarse (para que se vea la animación)
const MAX_MS = 1900;  // tiempo máximo de carga: a los 1.9 s la estela se completa sí o sí
const HOLD_MS = 100;  // pausa con la estela llena
const FADE_MS = 500;  // desvanecido final   →   máximo total: 1900 + 100 + 500 = 2.5 s

// ---------- MODO AJUSTE ----------
// true  = la pantalla de carga NO se cierra, la estela queda llena y sale un panel para cuadrarla.
// false = funcionamiento normal. Cuando termines, pega los valores copiados en START y pon false.
const MODO_AJUSTE = false;

// Posición de la estela respecto al texto (en %):
//  top = cuánto baja | left = desplazamiento lateral | width = ancho de la estela
//  pb = espacio de abajo (para centrar) | cx = corrimiento horizontal de todo el logo
const START = { top: 89.5, left: -8.5, width: 108.8, pb: 5, cx: 4 };

// Imágenes que se precargan (la barra avanza según cuántas ya cargaron).
// Si cambias nombres en el carrusel, cámbialos aquí también.
const frogFrames = (name: string) => [1, 2, 3, 4].map((k) => `/sapos_carrusel/${name}_${k}.png`);
const PRELOAD = [
  "/pantalla_carga/logo_texto.png",
  "/pantalla_carga/logo_estela.png",
  "/carrusel_personajes/Imagen Animación.png",
  "/carrusel_personajes/Imagen Evangelin.png",
  "/carrusel_personajes/Imagen Nico.png",
  ...frogFrames("Verde"),
  ...frogFrames("Morada"),
  ...frogFrames("Azul"),
  "/sapos_carrusel/LenguaVerde.png",
  "/sapos_carrusel/Lengua.png",
];

export default function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");
  const [box, setBox] = useState(START);
  const [outline, setOutline] = useState(true);
  const [copied, setCopied] = useState(false);
  const fill = useRef<HTMLImageElement>(null); // estela llena (se va revelando de izquierda a derecha)

  useEffect(() => {
    if (MODO_AJUSTE) {
      if (fill.current) fill.current.style.clipPath = "inset(0 0% 0 0)"; // estela llena y quieta
      return;
    }
    let loaded = 0;
    const total = PRELOAD.length;
    PRELOAD.forEach((src) => {
      const img = new Image();
      img.onload = () => { loaded++; };
      img.onerror = () => { loaded++; }; // si una imagen falla, no bloquea la carga
      img.src = src;
    });

    const start = performance.now();
    let p = 0;
    let raf = 0;
    let hold: ReturnType<typeof setTimeout>;

    const tick = (now: number) => {
      const elapsed = now - start;
      const forced = elapsed >= MAX_MS;
      const target = forced ? 1 : Math.min(loaded / total, elapsed / MIN_MS);
      p = forced ? 1 : p + (target - p) * 0.2; // avance suave
      if (p >= 0.995) p = 1;
      if (fill.current) fill.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
      if (p >= 1) {
        hold = setTimeout(() => setPhase("fade"), HOLD_MS);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); clearTimeout(hold); };
  }, []);

  useEffect(() => {
    if (phase !== "fade") return;
    const t = setTimeout(() => setPhase("gone"), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;

  const estela = { top: `${box.top}%`, left: `${box.left}%`, width: `${box.width}%` };
  const code = `const START = { top: ${box.top}, left: ${box.left}, width: ${box.width}, pb: ${box.pb}, cx: ${box.cx} };`;
  const frame = (color: string) => (MODO_AJUSTE && outline ? { outline: `1px solid ${color}` } : {});

  return (
    <div
      style={{ backgroundColor: "#9B8EE0", transition: `opacity ${FADE_MS}ms ease` }}
      className={`fixed inset-0 z-[100] flex items-center justify-center ${phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {/* pb deja sitio a la estela (que cuelga bajo el texto) y translateX compensa la mano: así el conjunto queda centrado */}
      <div className="w-[min(90vw,900px)]" style={{ paddingBottom: `${box.pb}%`, transform: `translateX(${box.cx}%)` }}>
        <div className="relative w-full animate-splash">
          {/* 1) Estela vacía (más tenue): marca el camino. Va DEBAJO del texto */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pantalla_carga/logo_estela.png" alt="" style={estela} className="absolute opacity-40" />
          {/* 2) Estela llena: se revela desde la mano hacia la punta amarilla. También DEBAJO del texto */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={fill} src="/pantalla_carga/logo_estela.png" alt="" style={{ ...estela, clipPath: "inset(0 100% 0 0)", ...frame("blue") }} className="absolute" />
          {/* 3) Texto del logo: ARRIBA de la estela */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pantalla_carga/logo_texto.png" alt="Three Star" style={frame("red")} className="relative block w-full" />
        </div>
      </div>

      {/* Panel de ajuste (solo con MODO_AJUSTE = true) */}
      {MODO_AJUSTE && (
        <div className="fixed bottom-3 right-3 z-[110] w-72 rounded-xl bg-black/85 p-3 text-xs text-white">
          <p className="mb-2 text-sm text-[#FBC616]">Ajuste de la estela</p>
          <div className="grid grid-cols-2 gap-2">
            {([["top", "Estela top %"], ["left", "Estela left %"], ["width", "Estela ancho %"], ["pb", "Espacio abajo %"], ["cx", "Mover logo X %"]] as const).map(([k, label]) => (
              <label key={k} className="flex flex-col gap-1">
                {label}
                <input type="number" step="0.5" value={box[k]}
                  onChange={(e) => setBox({ ...box, [k]: parseFloat(e.target.value) || 0 })}
                  className="rounded bg-white/10 px-2 py-1 text-white" />
              </label>
            ))}
          </div>
          <label className="mt-2 flex items-center gap-2">
            <input type="checkbox" checked={outline} onChange={(e) => setOutline(e.target.checked)} />
            Ver contornos (rojo = texto, azul = estela)
          </label>
          <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-white/10 p-2 text-[10px] leading-tight">{code}</pre>
          <button
            onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="mt-2 w-full rounded bg-[#FBC616] py-1 text-black">
            {copied ? "¡Copiado!" : "Copiar valores"}
          </button>
        </div>
      )}
    </div>
  );
}