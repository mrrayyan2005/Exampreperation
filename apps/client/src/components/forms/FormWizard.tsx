import { ReactNode, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormProgress } from './ProgressIndicator';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
  fields: string[];
  component: ReactNode;
}

interface FormWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function FormWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  className,
}: FormWizardProps) {
  const { trigger, formState } = useFormContext();
  const currentStepData = steps[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  const canProceed = async () => {
    if (!currentStepData?.fields.length) return true;
    try {
      if (typeof trigger !== 'function') return true;
      const valid = await trigger(currentStepData.fields);
      return valid;
    } catch (error) {
      console.error('Validation error:', error);
      // If validation crashes, we stay on current step and show errors via formState
      return false;
    }
  };

  const handleNext = async () => {
    if (await canProceed()) {
      if (isLastStep) {
        onComplete?.();
      } else {
        onStepChange(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress indicator */}
      <FormProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        stepLabels={steps.map((s) => s.label)}
      />

      {/* Step content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {currentStepData?.description && (
              <p className="text-muted-foreground text-sm">
                {currentStepData.description}
              </p>
            )}
            {currentStepData?.component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isFirstStep}
          className={cn('flex-1', isFirstStep && 'invisible')}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          type={isLastStep ? 'submit' : 'button'}
          onClick={isLastStep ? undefined : handleNext}
          disabled={formState.isSubmitting}
          className="flex-1"
        >
          {isLastStep ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Hook for managing wizard state
export function useWizard(totalSteps: number, initialStep = 1) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const next = () => goToStep(currentStep + 1);
  const back = () => goToStep(currentStep - 1);
  const reset = () => goToStep(initialStep);

  return {
    currentStep,
    goToStep,
    next,
    back,
    reset,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}
