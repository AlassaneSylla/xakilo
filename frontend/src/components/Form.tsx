import React, { useState } from "react";
import Button from "./Button";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  options?: { label: string; value: string | number }[];
};

type FormProps = {
  fields: Field[];
  values: Record<string, any>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  loading: boolean;
};

export default function Form({
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = "Enregistrer",
}: FormProps) {
  const [loading, setLoading] = useState();

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4 rounded-lg shadow bg-base-200">
      {fields.map((field) => (
        <div key={field.name} className="form-control">
          <label className="label font-semibold">{field.label}</label>

          {field.options ? (
            <select
              name={field.name}
              value={values[field.name] ?? ""}
              required={field.required}
              onChange={onChange as any}
              className={`select select-bordered w-full py-1 ${
                field.disabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""
              }`}
            >
              <option value="">-- Sélectionner --</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || "text"}
              name={field.name}
              placeholder={field.placeholder || ""}
              value={values[field.name] ?? ""}
              required={field.required}
              onChange={onChange}
              className={`input input-bordered w-full py-1 ${
                field.disabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""
              }`}
            />
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="sm" disabled={loading}>
          {loading ? "Chargement..." : submitLabel || "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
