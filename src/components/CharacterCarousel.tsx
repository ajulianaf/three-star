"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

type Character = { name: string; image: string; button: string; diary: string[] };

// Imágenes en /public/carrusel_personajes/ (arte completo de cada tarjeta, SIN el botón ni el sapo)
const CHARACTERS: Character[] = [
  { name: "Nico", image: "/carrusel_personajes/Imagen Animación.png", button: "Ver Animación", diary: [] },
  { name: "Evangeline", image: "/carrusel_personajes/Imagen Evangelin.png", button: "Lee mis Secretos", diary: [] },
  { name: "Leo", image: "/carrusel_personajes/Imagen Nico.png", button: "Mi Diario", diary: [] },
];

// ---------- SAPOS ----------
// Cada sapo tiene dos partes:
//  1) "frames": el sapo abriendo la boca (PNG del mismo tamaño). 1 = boca cerrada ... último = boca abierta.
//  2) "lengua": la lengua larga, que cruza TODO el carrusel (se revela de izquierda a derecha).
// Archivos esperados: /public/sapos_carrusel/Verde_1.png ... Verde_4.png  y  LenguaVerde.png
const FRAME_COUNT = 4;
const frames = (name: string) => Array.from({ length: FRAME_COUNT }, (_, k) => `/sapos_carrusel/${name}_${k + 1}.png`);

const FROG_SIZE = "16%"; // ancho de los sapos

const FROGS = [
  { frames: frames("Verde"),  pos: { left: "3%", bottom: "0%", width: FROG_SIZE },
    lengua: "/sapos_carrusel/LenguaVerde.png", tongue: { left: "9%", top: "62%", width: "42%" } },
  { frames: frames("Morada"), pos: { left: "3%", bottom: "0%", width: FROG_SIZE },
    lengua: "/sapos_carrusel/Lengua.png",      tongue: { left: "9%", top: "62%", width: "42%" } },
  { frames: frames("Azul"),   pos: { left: "3%", bottom: "0%", width: FROG_SIZE },
    lengua: "/sapos_carrusel/Lengua.png",      tongue: { left: "9%", top: "62%", width: "42%" } },
];

// MODO AJUSTE: ponlo en true para cuadrar la lengua de cada sapo (la lengua queda quieta y sale un panel).
// Cuando termines, pégale los valores a FROGS y vuélvelo a poner en false.
const MODO_AJUSTE = false;

// ---------- TIEMPOS (en milisegundos) ----------
const PRE_MS = 0;         // al empezar: el sapo se ve quieto, sin lengua, antes de abrir la boca
const OUT_MS = 60;        // cada cuadro al ABRIR la boca
const TONGUE_LEAD = 150;  // la lengua arranca este tiempo ANTES de que la boca termine de abrirse
const SWEEP_MS = 900;     // lo que tarda la lengua en cruzar la imagen
const RETURN_MS = 700;    // lo que tarda la lengua en VOLVER hacia el sapo
const SEEN_MS = 250;      // el sapo se ve sin lengua este tiempo antes de que cambie la tarjeta
const AFTER_MS = 300;     // espera después del cambio antes de permitir otra animación
const AUTO_MS = 3000;     // tiempo entre cambios automáticos
const CARD_SPRING = { type: "spring" as const, stiffness: 300, damping: 32 }; // velocidad del cambio de tarjeta

const HIDDEN = "inset(0 100% 0 0)"; // lengua recogida
const SHOWN = "inset(0 0% 0 0)";    // lengua extendida

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CharacterCarousel() {
  const [index, setIndex] = useState(0);  // tarjeta activa
  const [frog, setFrog] = useState(0);    // sapo que se ve
  const [frame, setFrame] = useState(0);  // cuadro actual del sapo
  const [diary, setDiary] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const tongue = useAnimationControls();
  const [tp, setTp] = useState(() =>
    FROGS.map((f) => ({ l: parseFloat(f.tongue.left), t: parseFloat(f.tongue.top), w: parseFloat(f.tongue.width) }))
  );
  const [copied, setCopied] = useState(false);
  const busy = useRef(false);
  const indexRef = useRef(0);
  const n = CHARACTERS.length;

  // Cambia de tarjeta. Si withFrog es true, el sapo cambia de inmediato.
  const goTo = (target: number, withFrog = true) => {
    indexRef.current = target;
    setIndex(target);
    setDiary(false);
    if (withFrog) { setFrog(target % FROGS.length); setFrame(0); }
  };

  const go = (dir: 1 | -1) => {
    if (busy.current) return;
    goTo((indexRef.current + dir + n) % n);
  };

  // Secuencia: se ve el sapo sin lengua → abre la boca → la lengua cruza la imagen → desaparece y el
  // sapo cierra la boca (se ve sin lengua) → entonces cambia la tarjeta y aparece el cuadro 1 del siguiente sapo
  async function shoot() {
    if (MODO_AJUSTE || busy.current) return;
    busy.current = true;
    const next = (indexRef.current + 1) % n;
    const openMs = (FRAME_COUNT - 1) * OUT_MS;
    const tongueDelay = Math.max(0, openMs - TONGUE_LEAD);

    await wait(PRE_MS); // sapo quieto, sin lengua

    // La lengua arranca antes de que la boca termine de abrirse
    const out = wait(tongueDelay).then(() =>
      tongue.start({ clipPath: SHOWN, transition: { duration: SWEEP_MS / 1000, ease: "easeInOut" } })
    );
    for (let k = 1; k < FRAME_COUNT; k++) { setFrame(k); await wait(OUT_MS); }
    await out; // la lengua ya pasó por toda la imagen

    // La lengua VUELVE al sapo (se ve cómo se recoge) y el sapo pasa directo al cuadro 1 (sin lengua),
    // sin mostrar los cuadros intermedios
    await tongue.start({ clipPath: HIDDEN, transition: { duration: RETURN_MS / 1000, ease: "easeInOut" } });
    setFrame(0);
    await wait(SEEN_MS);

    // Ahora sí, de una vez: nueva tarjeta y cuadro 1 del siguiente sapo
    goTo(next, true);

    await wait(AFTER_MS);
    busy.current = false;
  }

  // Automático: sigue pasando solo aunque nadie lo esté mirando (solo se pausa con el diario abierto o con la pestaña oculta)
  useEffect(() => {
    if (MODO_AJUSTE || diary || tabHidden) return;
    const t = setTimeout(() => shoot(), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, diary, tabHidden]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Flechas del teclado ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      className="relative h-[clamp(320px,46vw,600px)] w-full overflow-hidden bg-[#8C7CB6]"
    >
      {CHARACTERS.map((c, i) => {
        let d = (i - index + n) % n;
        if (d > n / 2) d -= n; // -1 izquierda, 0 activa, 1 derecha
        const active = d === 0;
        const visible = Math.abs(d) <= 1;
        return (
          <motion.article
            key={c.name}
            initial={false}
            animate={{ x: `${d * 72}%`, y: "-50%", scale: active ? 1 : 0.75, opacity: visible ? 1 : 0 }}
            transition={CARD_SPRING}
            style={{ zIndex: active ? 20 : 10, pointerEvents: visible ? "auto" : "none" }}
            onClick={() => !active && visible && go(d as 1 | -1)}
            className={`absolute inset-x-0 top-1/2 mx-auto aspect-[21/10] w-[78%] max-w-[1010px] overflow-hidden bg-black ${active ? "" : "cursor-pointer"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.name} className={`h-full w-full object-cover ${active ? "" : "brightness-75"}`} />

            <AnimatePresence>
              {active && diary && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col justify-center gap-3 bg-black/85 p-[6%] text-[clamp(14px,1.6vw,22px)] text-white"
                >
                  <h3 className="text-[#FBC616]">Diario de {c.name}</h3>
                  {c.diary.length === 0 && <p className="opacity-70">Próximamente…</p>}
                  {c.diary.map((l) => <p key={l}>📖 {l}</p>)}
                </motion.div>
              )}
            </AnimatePresence>

            {active && (
              <button
                onClick={(e) => { e.stopPropagation(); setDiary((v) => !v); }}
                className="absolute bottom-[8%] right-[7%] z-10 rounded-2xl bg-[#FBC616] px-[4%] py-[1.2%] text-[clamp(14px,1.5vw,20px)] text-[#232350] transition hover:brightness-110"
              >
                {diary ? "Volver" : c.button}
              </button>
            )}
          </motion.article>
        );
      })}

      {/* Flechas: solo en pantallas pequeñas (responsive) */}
      <button aria-label="Anterior" onClick={() => go(-1)}
        className="absolute left-3 top-1/2 z-40 h-11 w-11 md:hidden -translate-y-1/2 rounded-full bg-[#FBC616] text-xl text-[#232350]">&lt;</button>
      <button aria-label="Siguiente" onClick={() => go(1)}
        className="absolute right-3 top-1/2 z-40 h-11 w-11 md:hidden -translate-y-1/2 rounded-full bg-[#FBC616] text-xl text-[#232350]">&gt;</button>

      {/* Sapos: todos montados (así se precargan) pero SOLO se ve un cuadro del sapo actual.
          Los cambios son instantáneos: nunca hay dos imágenes superpuestas. */}
      {FROGS.map((fr, fi) => {
        const on = fi === frog;
        const shown = MODO_AJUSTE ? FRAME_COUNT - 1 : frame;
        return (
          <div
            key={fi}
            onClick={on ? shoot : undefined}
            style={{ ...fr.pos, visibility: on ? "visible" : "hidden" }}
            className="absolute z-30 max-w-[240px] cursor-pointer"
          >
            {fr.frames.map((src, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={k === 0 ? "Sapo" : ""}
                style={{ opacity: k === shown ? 1 : 0 }}
                className={k === 0 ? "block h-auto w-full" : "absolute bottom-0 left-0 h-full w-auto max-w-none"} />
            ))}
          </div>
        );
      })}

      {/* Lengua larga: cruza el carrusel (del sapo actual) */}
      <motion.img
        src={FROGS[frog].lengua} alt=""
        initial={{ clipPath: MODO_AJUSTE ? SHOWN : HIDDEN }} animate={tongue}
        style={{ left: `${tp[frog].l}%`, top: `${tp[frog].t}%`, width: `${tp[frog].w}%` }}
        className="pointer-events-none absolute z-40 max-w-[900px]"
      />

      {/* Panel de ajuste (solo con MODO_AJUSTE = true) */}
      {MODO_AJUSTE && (
        <div className="fixed bottom-3 right-3 z-50 w-72 rounded-xl bg-black/85 p-3 text-xs text-white">
          <p className="mb-2 text-sm text-[#FBC616]">Lengua del sapo {frog + 1} de {FROGS.length}</p>
          <p className="mb-2 opacity-70">Cambia de sapo con las flechas ← → del teclado o con las tarjetas.</p>
          <div className="grid grid-cols-3 gap-2">
            {([["l", "left %"], ["t", "top %"], ["w", "ancho %"]] as const).map(([k, label]) => (
              <label key={k} className="flex flex-col gap-1">
                {label}
                <input type="number" step="0.5" value={tp[frog][k]}
                  onChange={(e) => setTp((all) => all.map((x, i) => (i === frog ? { ...x, [k]: parseFloat(e.target.value) || 0 } : x)))}
                  className="rounded bg-white/10 px-2 py-1 text-white" />
              </label>
            ))}
          </div>
          <pre className="mt-2 rounded bg-white/10 p-2 text-[10px] leading-tight">
{tp.map((x, i) => `// sapo ${i + 1}\ntongue: { left: "${x.l}%", top: "${x.t}%", width: "${x.w}%" },`).join("\n")}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(tp.map((x, i) => `// sapo ${i + 1}\ntongue: { left: "${x.l}%", top: "${x.t}%", width: "${x.w}%" },`).join("\n"));
              setCopied(true); setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-2 w-full rounded bg-[#FBC616] py-1 text-black">
            {copied ? "¡Copiado!" : "Copiar valores"}
          </button>
        </div>
      )}
    </section>
  );
}