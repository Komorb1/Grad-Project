import { InputHTMLAttributes, useId } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthInput({
  label,
  error,
  className = "",
  id,
  ...props
}: AuthInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>

      <input
        {...props}
        id={inputId}
        aria-invalid={error ? "true" : "false"}
        className={[
          "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition",
          "placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
          "dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500",
          className,
        ].join(" ")}
      />

      {error ? (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}