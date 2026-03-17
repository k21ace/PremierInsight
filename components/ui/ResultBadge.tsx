/** W / D / L バッジと直近フォームバッジ列 */

type WDL = "W" | "D" | "L";

const STYLES: Record<string, string> = {
  W: "bg-green-600 text-white",
  D: "bg-gray-400 text-white",
  L: "bg-red-500 text-white",
};

export function ResultBadge({ result }: { result: WDL | string }) {
  const style = STYLES[result] ?? "bg-gray-200 text-gray-500";
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-sm ${style}`}
    >
      {result}
    </span>
  );
}

export function FormBadges({ form }: { form: string[] }) {
  if (form.length === 0) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className="flex gap-0.5">
      {form.map((r, i) => (
        <ResultBadge key={i} result={r} />
      ))}
    </span>
  );
}
