"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Character = { name: string; image: string; button: string; diary: string[] };

// Imágenes en /public/carrusel_personajes/ (arte completo de cada tarjeta, SIN el botón ni el sapo)
const CHARACTERS: Character[] = [
  { name: "Nico", image: "/carrusel_personajes/Imagen Animación.png", button: "Ver Animación", diary: [] },
  { name: "Evangeline", image: "/carrusel_personajes/Imagen Evangelin.png", button: "Lee mis Secretos", diary: [] },
  { name: "Leo", image: "/carrusel_personajes/Imagen Nico.png", button: "Mi Diario", diary: [] },
];

// ---------- SAPOS ----------
// Cada sapo tiene N cuadros (PNG del mismo tamaño): 1 = sin lengua ... último = lengua completa.
// Archivos esperados: /public/sapos_carrusel/Verde_1.png, Verde_2.png, Verde_3.png, Verde_4.png ...
const FRAME_COUNT = 4;
const frames = (name: string) => Array.from({ length: FRAME_COUNT }, (_, k) => `/sapos_carrusel/${name}_${k + 1}.png`);

const FROGS = [
  { frames: frames("Verde"),  pos: { left: "3%", bottom: "0%", width: "52%" } },
  { frames: frames("Morada"), pos: { left: "3%", bottom: "0%", width: "52%" } },
  { frames: frames("Azul"),   pos: { left: "3%", bottom: "0%", width: "52%" } },
];

const STEP_MS = 70;   // duración de cada cuadro
const HOLD_MS = 90;   // pausa con la lengua completa (aquí cambia la tarjeta)
const AUTO_MS = 5000; // tiempo entre cambios automáticos

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CharacterCarousel() {
  const [index, setIndex] = useState(0);  // tarjeta activa
  const [frog, setFrog] = useState(0);    // sapo que se ve
  const [frame, setFrame] = useState(0);  // cuadro actual del sapo
  const [diary, setDiary] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
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

  // Lengua sale (cuadros 1→N), cambia la tarjeta, la lengua vuelve (N→1) y ENTONCES cambia el sapo
  async function shoot() {
    if (busy.current) return;
    busy.current = true;
    const next = (indexRef.current + 1) % n;
    for (let k = 1; k < FRAME_COUNT; k++) { setFrame(k); await wait(STEP_MS); }
    goTo(next, false);
    await wait(HOLD_MS);
    for (let k = FRAME_COUNT - 2; k >= 0; k--) { setFrame(k); await wait(STEP_MS); }
    setFrog(next % FROGS.length);
    setFrame(0);
    busy.current = false;
  }

  // Automático (se pausa con el mouse encima, con el diario abierto o con la pestaña oculta)
  useEffect(() => {
    if (paused || diary || tabHidden) return;
    const t = setTimeout(() => shoot(), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, paused, diary, tabHidden]); // eslint-disable-line react-hooks/exhaustive-deps

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
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
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
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
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

      {/* Sapos: todos montados (así se precargan); solo se ve el actual, cuadro por cuadro */}
      {FROGS.map((fr, fi) => {
        const on = fi === frog;
        return (
          <motion.div
            key={fi}
            initial={false}
            animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.92 }}
            transition={{ duration: 0.25 }}
            onClick={on ? shoot : undefined}
            style={{ ...fr.pos, pointerEvents: on ? "auto" : "none" }}
            className="absolute z-30 max-w-[800px] cursor-pointer"
          >
            {fr.frames.map((src, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={k === 0 ? "Sapo" : ""}
                style={{ opacity: on && k === frame ? 1 : 0 }}
                className={k === 0 ? "block w-full" : "absolute inset-0 h-full w-full"} />
            ))}
          </motion.div>
        );
      })}
    </section>
  );
}