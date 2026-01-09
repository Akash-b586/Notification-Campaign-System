import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`block w-10 h-6 rounded-full transition-colors ${
            checked ? 'bg-slate-600' : 'bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            checked ? 'transform translate-x-4' : ''
          }`}
        ></div>
      </div>
      {label && (
        <div className={`ml-3 text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </div>
      )}
    </label>
  );
};
