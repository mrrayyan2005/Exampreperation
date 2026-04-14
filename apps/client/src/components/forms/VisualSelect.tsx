import { useFormContext, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, LucideIcon } from 'lucide-react';

export interface VisualOption {
  value: string;
  label: string;
  icon: LucideIcon;
  color?: string;
  description?: string;
}

interface VisualSelectProps {
  name: string;
  label?: string;
  options: VisualOption[];
  columns?: 2 | 3 | 4;
  required?: boolean;
}

export function VisualSelect({
  name,
  label,
  options,
  columns = 2,
  required,
}: VisualSelectProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={cn('grid gap-3', gridCols[columns])}>
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = field.value === option.value;
              const colorClass = option.color || 'bg-primary';

              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => field.onChange(option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative p-4 rounded-xl border-2 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                      isSelected ? colorClass : 'bg-muted',
                      isSelected ? 'text-white' : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Label */}
                  <div className="font-medium text-sm">{option.label}</div>

                  {/* Description */}
                  {option.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      />

      {error && (
        <p className="text-xs text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}

// Multi-select variant
interface VisualMultiSelectProps {
  name: string;
  label?: string;
  options: VisualOption[];
  maxSelections?: number;
  required?: boolean;
}

export function VisualMultiSelect({
  name,
  label,
  options,
  maxSelections,
  required,
}: VisualMultiSelectProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedValues = field.value || [];

          const toggleOption = (value: string) => {
            const newValues = selectedValues.includes(value)
              ? selectedValues.filter((v: string) => v !== value)
              : maxSelections && selectedValues.length >= maxSelections
              ? [...selectedValues.slice(1), value]
              : [...selectedValues, value];
            field.onChange(newValues);
          };

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedValues.includes(option.value);
                const colorClass = option.color || 'bg-primary';

                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'relative p-3 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}

                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
                        isSelected ? colorClass : 'bg-muted',
                        isSelected ? 'text-white' : 'text-muted-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="font-medium text-sm">{option.label}</div>
                  </motion.button>
                );
              })}
            </div>
          );
        }}
      />

      {error && (
        <p className="text-xs text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}
