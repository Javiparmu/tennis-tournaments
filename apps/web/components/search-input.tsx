import { Search } from "lucide-react";
import { inputClass } from "@/components/modal-shell";

// Shared search box: leading magnifier icon over the standard input styling.
// Presentational — the caller owns the query state. Render it (disabled) in
// loading branches too so it reserves its height and the list below never
// shifts down under the cursor when data resolves.
export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  disabled,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Accessible name for the input (there is no visible <label>). */
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={label}
        className={`${inputClass} pl-9`}
      />
    </div>
  );
}
