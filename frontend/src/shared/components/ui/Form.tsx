import React from 'react';
import Button from './Button';

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
  values: Record<string, string | number | null | undefined>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
};

export default function Form({
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
}: FormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {fields.map((field) => (
        <div key={field.name} className="form-control">
          <label className="label pb-0.5">
            <span className="label-text text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {field.label}
            </span>
          </label>

          {field.options ? (
            <select
              name={field.name}
              value={values[field.name] ?? ''}
              required={field.required}
              disabled={field.disabled}
              onChange={onChange}
              className={`select select-bordered select-sm w-full ${
                field.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">— Sélectionner —</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type ?? 'text'}
              name={field.name}
              placeholder={field.placeholder ?? ''}
              value={values[field.name] ?? ''}
              required={field.required}
              disabled={field.disabled}
              readOnly={field.readOnly}
              onChange={onChange}
              className={`input input-bordered input-sm w-full ${
                field.disabled || field.readOnly ? 'opacity-50 cursor-not-allowed bg-base-200' : ''
              }`}
            />
          )}
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="sm" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}