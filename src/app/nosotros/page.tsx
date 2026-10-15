const TEAM = ["Integrante 1", "Integrante 2", "Integrante 3"];
export default function Nosotros() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 text-white">
      <h1 className="text-4xl font-black italic text-star">Nosotros</h1>
      <p>Somos un equipo creativo detrás de Three Star. (Agrega aquí tu historia.)</p>
      <ul className="space-y-3">
        {TEAM.map((n) => (
          <li key={n} className="flex items-center gap-4 rounded-xl bg-card p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-deep text-2xl">👤</span>{n}
          </li>
        ))}
      </ul>
    </div>
  );
}
