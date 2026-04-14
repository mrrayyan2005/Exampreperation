import { ReactNode } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertCircle, Check } from 'lucide-react';

interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  showValidation?: boolean;
}

export function FormField({
  name,
  label,
  description,
  required,
  children,
  showValidation = true,
}: FormFieldProps) {
  const { formState } = useFormContext();
  const error = formState.errors[name];
  const isTouched = formState.touchedFields[name];
  const isValid = isTouched && !error;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {showValidation && isValid && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-5 h-5 rounded-full bg-success flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </div>
      )}

      {children}

      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center gap-1.5 text-destructive text-xs"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error.message as string}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
}

export function TextField({ name, label, description, className, ...props }: TextFieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name];

  return (
    <FormField name={name} label={label} description={description} required={props.required}>
      <Input
        id={name}
        {...register(name)}
        {...props}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
      />
    </FormField>
  );
}

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  description?: string;
  maxLength?: number;
}

export function TextAreaField({
  name,
  label,
  description,
  maxLength,
  className,
  ...props
}: TextAreaFieldProps) {
  const { register, watch, formState } = useFormContext();
  const error = formState.errors[name];
  const value = watch(name) || '';
  const charCount = value.length;

  return (
    <FormField name={name} label={label} description={description} required={props.required}>
      <div className="relative">
        <Textarea
          id={name}
          {...register(name)}
          {...props}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            maxLength && 'pb-6',
            className
          )}
        />
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            <span className={charCount > maxLength ? 'text-destructive' : ''}>
              {charCount}
            </span>
            /{maxLength}
          </div>
        )}
      </div>
    </FormField>
  );
}

interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string;
  label?: string;
  description?: string;
  min?: number;
  max?: number;
  quickActions?: Array<{ label: string; value: number }>;
}

export function NumberField({
  name,
  label,
  description,
  min,
  max,
  quickActions,
  className,
  ...props
}: NumberFieldProps) {
  const { register, setValue, watch, formState } = useFormContext();
  const error = formState.errors[name];
  const currentValue = watch(name);

  return (
    <FormField name={name} label={label} description={description} required={props.required}>
      <div className="space-y-2">
        <Input
          id={name}
          type="number"
          {...register(name, { valueAsNumber: true })}
          min={min}
          max={max}
          {...props}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
        />
        {quickActions && (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => setValue(name, action.value, { shouldValidate: true })}
                className={cn(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  currentValue === action.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}
