import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(120),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  institution: z.string().max(150).optional().default('Independent Researcher'),
  primary_domain: z
    .enum([
      'ACADEMIC_SCIENTIFIC',
      'CLINICAL_BIOTECH',
      'MARKET_COMPETITIVE',
      'POLICY_REGULATORY',
      'TECH_ENGINEERING',
      'FINANCIAL_MACRO',
    ])
    .optional()
    .default('ACADEMIC_SCIENTIFIC'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const workspaceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  domain: z.enum([
    'ACADEMIC_SCIENTIFIC',
    'CLINICAL_BIOTECH',
    'MARKET_COMPETITIVE',
    'POLICY_REGULATORY',
    'TECH_ENGINEERING',
    'FINANCIAL_MACRO',
  ]),
  research_question: z.string().min(10, 'Research question must be at least 10 characters').max(1000),
  description: z.string().max(2000).optional().nullable(),
});

export const sourceIngestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  authors: z.string().max(255).optional().default('Unknown Author'),
  publication_year: z.coerce
    .number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(2030, 'Year must be 2030 or earlier')
    .optional()
    .nullable(),
  source_type: z
    .enum([
      'PEER_REVIEWED_PAPER',
      'TECHNICAL_REPORT',
      'POLICY_BRIEF',
      'MARKET_ANALYSIS',
      'RAW_FIELD_NOTES',
      'WEB_ARTICLE_TRANSCRIPT',
    ])
    .default('PEER_REVIEWED_PAPER'),
  source_url: z.string().url().optional().or(z.literal('')),
  raw_content: z.string().optional(),
});

export const synthesisCreateSchema = z.object({
  title: z.string().min(3, 'Synthesis title must be at least 3 characters').max(200),
  source_ids: z.array(z.string().uuid()).min(2, 'Select at least 2 sources to synthesize'),
  synthesis_mode: z.enum([
    'LITERATURE_REVIEW',
    'CONTRADICTION_MATRIX',
    'GAP_ANALYSIS',
    'EXECUTIVE_DECISION_BRIEF',
  ]),
  focus_directive: z.string().max(1000).optional().nullable(),
});

export const chatQuestionSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(2000),
});

export function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return next(err);
    }
  };
}
