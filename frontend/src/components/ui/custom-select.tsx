import React from 'react';
import { cn } from '@/lib/utils';

// A very simple dropdown without any fancy features
interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className,
}) => {
  // Ensure options is an array of strings
  const safeOptions = Array.isArray(options) 
    ? options.filter(item => item !== undefined && item !== null).map(item => String(item))
    : [];

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "block w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
      aria-label={placeholder}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {safeOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}import React, { useState, useEffect, useRef } from 'react';
      import { ChevronDown, Check } from 'lucide-react';
      import { cn } from '@/lib/utils';
      
      interface CustomSelectProps {
        options: { value: string; label: string }[];
        value: string | undefined;
        onChange: (value: string) => void;
        placeholder?: string;
        disabled?: boolean;
        className?: string;
      }
      
      const CustomSelect: React.FC<CustomSelectProps> = ({
        options,
        value,
        onChange,
        placeholder = "Select an option",
        disabled = false,
        className,
      }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [selectedLabel, setSelectedLabel] = useState<string>('');
        const selectRef = useRef<HTMLDivElement>(null);
      
        // Update the selected label when value changes
        useEffect(() => {
          if (value && options && options.length > 0) {
            const selected = options.find(option => option.value === value);
            setSelectedLabel(selected?.label || '');
          } else {
            setSelectedLabel('');
          }
        }, [value, options]);
      
        // Close dropdown when clicking outside
        useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
              setIsOpen(false);
            }
          };
      
          document.addEventListener('mousedown', handleClickOutside);
          return () => {
            document.removeEventListener('mousedown', handleClickOutside);
          };
        }, []);
      
        const handleSelect = (optionValue: string) => {
          onChange(optionValue);
          setIsOpen(false);
        };
      
        // Safely process options to handle any undefined or null entries
        const safeOptions = Array.isArray(options) 
          ? options.filter(option => option && typeof option.value === 'string') 
          : [];
      
        return (
          <div 
            ref={selectRef} 
            className={cn(
              "relative w-full", 
              className
            )}
          >
            {/* Trigger button */}
            <button
              type="button"
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400",
              )}
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
            >
              <span className={value ? "" : "text-muted-foreground"}>
                {selectedLabel || placeholder}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
      
            {/* Dropdown menu */}
            {isOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-background shadow-lg">
                <ul
                  className="max-h-60 overflow-auto py-1 text-sm"
                  role="listbox"
                >
                  {safeOptions.length === 0 ? (
                    <li className="px-3 py-2 text-center text-gray-500">No options available</li>
                  ) : (
                    safeOptions.map((option) => (
                      <li
                        key={option.value}
                        className={cn(
                          "relative flex items-center px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          option.value === value ? "bg-accent/50" : ""
                        )}
                        onClick={() => handleSelect(option.value)}
                        role="option"
                        aria-selected={option.value === value}
                      >
                        <span className="flex-grow">{option.label}</span>
                        {option.value === value && (
                          <Check className="h-4 w-4" />
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        );
      };
      
      export { CustomSelect };
    </select>
  );
};

export { CustomSelect };