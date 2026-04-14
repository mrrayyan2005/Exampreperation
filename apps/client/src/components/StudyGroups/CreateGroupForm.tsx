import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  BookOpen,
  Shield,
  Globe,
  Lock,
  Zap,
  Trophy,
  Share2,
  UserCheck,
  Palette,
  Rocket,
  GraduationCap,
  Building2,
  Landmark,
  Plane,
  Target,
  Calendar,
  Settings,
  ChevronRight,
  Users,
} from 'lucide-react';
import type { CreateStudyGroupRequest } from '@/api/studyGroupApi';
import { UseMutationResult } from '@tanstack/react-query';

interface CreateGroupFormProps {
  step: number;
  setStep: (step: number) => void;
  createGroupMutation: UseMutationResult<any, unknown, CreateStudyGroupRequest, unknown>;
  onSuccess?: () => void;
}

const examTypes = [
  { value: 'UPSC', label: 'UPSC', icon: Landmark, color: 'bg-emerald-500', description: 'Union Public Service Commission' },
  { value: 'SSC', label: 'SSC', icon: Building2, color: 'bg-blue-500', description: 'Staff Selection Commission' },
  { value: 'Banking', label: 'Banking', icon: Landmark, color: 'bg-amber-500', description: 'IBPS, SBI & Other Banks' },
  { value: 'Railway', label: 'Railway', icon: Plane, color: 'bg-rose-500', description: 'RRB & Railway Exams' },
  { value: 'State PSC', label: 'State PSC', icon: Building2, color: 'bg-violet-500', description: 'State Public Service' },
  { value: 'Defense', label: 'Defense', icon: Shield, color: 'bg-cyan-500', description: 'NDA, CDS, AFCAT' },
  { value: 'Teaching', label: 'Teaching', icon: GraduationCap, color: 'bg-pink-500', description: 'CTET, TET, NET' },
  { value: 'Other', label: 'Other', icon: BookOpen, color: 'bg-slate-500', description: 'Other Competitive Exams' },
];

const settings = [
  { key: 'allowMemberInvites', label: 'Member Invites', description: 'Members can invite others', icon: Share2 },
  { key: 'requireApproval', label: 'Join Approval', description: 'Approve members before joining', icon: UserCheck },
  { key: 'allowDataSharing', label: 'Data Sharing', description: 'Share study analytics', icon: Zap },
  { key: 'allowLeaderboard', label: 'Leaderboard', description: 'Show rankings & progress', icon: Trophy },
];

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  step,
  setStep,
  createGroupMutation,
  onSuccess,
}) => {
  const isInitialMount = useRef(true);

  const [formData, setFormData] = useState<CreateStudyGroupRequest>(() => ({
    name: '',
    description: '',
    examTypes: [],
    targetDate: '',
    privacy: 'public',
    settings: {
      allowMemberInvites: true,
      requireApproval: false,
      maxMembers: 50,
      allowDataSharing: true,
      allowLeaderboard: true,
    },
    tags: [],
  }));

  // Reset form when step resets to 1 (dialog reopened)
  useEffect(() => {
    if (step === 1 && !isInitialMount.current) {
      setFormData({
        name: '',
        description: '',
        examTypes: [],
        targetDate: '',
        privacy: 'public',
        settings: {
          allowMemberInvites: true,
          requireApproval: false,
          maxMembers: 50,
          allowDataSharing: true,
          allowLeaderboard: true,
        },
        tags: [],
      });
    }
    isInitialMount.current = false;
  }, [step]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up the data before sending - remove empty targetDate entirely
    const cleanedData: CreateStudyGroupRequest = {
      name: formData.name,
      description: formData.description,
      examTypes: formData.examTypes,
      privacy: formData.privacy,
      settings: formData.settings,
      tags: formData.tags,
    };
    // Only add targetDate if it has a value
    if (formData.targetDate && formData.targetDate.trim() !== '') {
      cleanedData.targetDate = formData.targetDate;
    }
    createGroupMutation.mutate(cleanedData, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length >= 3;
    if (step === 2) return formData.examTypes.length > 0;
    return true;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`flex items-center gap-2 transition-all duration-300 ${
            s < step ? 'text-primary' : s === step ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              s < step
                ? 'bg-primary text-primary-foreground'
                : s === step
                ? 'bg-primary/20 text-primary border-2 border-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s < step ? <Rocket className="w-4 h-4" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`w-12 h-1 rounded-full transition-all duration-300 ${
                s < step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-semibold">Let&apos;s Create Something Amazing</h3>
        <p className="text-sm text-muted-foreground">Give your study group a catchy name and description</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Group Name
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., UPSC Warriors 2025"
              className="h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {formData.name.length >= 3 && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Rocket className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex justify-between">
            <span>Make it memorable and relevant</span>
            <span className={formData.name.length > 50 ? 'text-destructive' : ''}>{formData.name.length}/50</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Description
          </Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What's this group about? What will you study together?"
            rows={3}
            className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {['Daily Goals', 'Weekly Tests', 'Mock Interviews', 'Doubt Solving'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const newDesc = formData.description
                    ? `${formData.description} ${tag.toLowerCase()}`
                    : tag;
                  setFormData({ ...formData, description: newDesc });
                }}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold">Choose Your Battle</h3>
        <p className="text-sm text-muted-foreground">Select the exam type you&apos;re preparing for</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {examTypes.map((exam) => {
          const isSelected = formData.examTypes.includes(exam.value);
          const Icon = exam.icon;
          return (
            <button
              key={exam.value}
              type="button"
              onClick={() => setFormData({ ...formData, examTypes: [exam.value] })}
              className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                isSelected
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${exam.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-semibold text-sm">{exam.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{exam.description}</div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Rocket className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Target Date (Optional)
        </Label>
        <div className="relative">
          <Input
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="h-11"
          />
          {formData.targetDate && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary">
              {Math.ceil((new Date(formData.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold">Customize Your Space</h3>
        <p className="text-sm text-muted-foreground">Set privacy and configure group features</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone can find and join' },
          { value: 'private', label: 'Private', icon: Lock, desc: 'Invite-only access' },
        ].map((option) => {
          const isSelected = formData.privacy === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, privacy: option.value })}
              className={`relative p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="font-semibold text-sm">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Group Features</Label>
        <div className="grid grid-cols-2 gap-3">
          {settings.map((setting) => {
            const isEnabled = formData.settings?.[setting.key as keyof typeof formData.settings] as boolean;
            const Icon = setting.icon;
            return (
              <button
                key={setting.key}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, [setting.key]: !isEnabled },
                  })
                }
                className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  isEnabled
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg ${isEnabled ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Icon className={`w-4 h-4 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{setting.label}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{setting.description}</div>
                  </div>
                </div>
                <div
                  className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 transition-colors ${
                    isEnabled ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}
                >
                  {isEnabled && <Rocket className="w-3 h-3 text-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-muted/50 space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{formData.name || 'Your Group Name'}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                {formData.examTypes[0] || 'Select Exam'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {formData.privacy === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {formData.privacy}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderStepIndicator()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      <div className="flex gap-3 pt-4">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex-1"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={createGroupMutation.isPending}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {createGroupMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Creating...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Create Group
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
};

export default CreateGroupForm;
