import { z } from 'zod';

// Monthly Plan Schema
export const monthlyPlanSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(50, 'Subject too long'),
  target: z.string().min(1, 'Description is required').max(300, 'Description too long'),
  targetType: z.enum(['pages', 'chapters', 'topics', 'hours'] as const, {
    message: 'Please select a target type',
  }),
  targetAmount: z.number().min(1, 'Target must be at least 1').max(1000, 'Target too large'),
  priority: z.enum(['High', 'Medium', 'Low'] as const, {
    message: 'Please select a priority',
  }),
  deadline: z.string().min(1, 'Deadline is required'),
});

export type MonthlyPlanFormData = z.infer<typeof monthlyPlanSchema>;

// Daily Goal Schema
export const dailyGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(300, 'Description too long').optional(),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  subject: z.string().optional(),
  estimatedTime: z.number().min(5).max(480).optional(), // minutes
});

export type DailyGoalFormData = z.infer<typeof dailyGoalSchema>;

// Study Session Schema
export const studySessionSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  duration: z.number().min(5, 'Minimum 5 minutes').max(480, 'Maximum 8 hours'),
  sessionType: z.enum(['Study', 'Revision', 'Practice', 'Mock Test']),
  productivity: z.number().min(1).max(5).default(3),
  notes: z.string().max(500).optional(),
});

export type StudySessionFormData = z.infer<typeof studySessionSchema>;

// Profile Schema
export const profileSchema = z.object({
  name: z.string().min(2, 'Name too short').max(50, 'Name too long'),
  bio: z.string().max(300, 'Bio too long').optional(),
  location: z.string().max(50).optional(),
  institution: z.string().max(100).optional(),
  examTypes: z.array(z.string()).min(1, 'Select at least one exam goal'),
  examDate: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
