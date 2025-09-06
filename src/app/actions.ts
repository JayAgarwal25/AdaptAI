'use server';

import { z } from 'zod';
import { generateQuizFromContent } from '@/ai/flows/generate-quiz-from-content';
import { repurposeContentIntoSummary } from '@/ai/flows/repurpose-content-into-summary';
import type { HistoryItem, OutputType } from '@/types';

const inputSchema = z.object({
  content: z.string().min(20, 'Content must be at least 20 characters long.'),
  outputType: z.enum(['summary', 'notes', 'quiz', 'video']),
  language: z.string(),
});

export type RepurposeResult = {
  success: boolean;
  data?: any;
  error?: string;
  outputType: OutputType;
};

export async function repurposeContent(
  prevState: any,
  formData: FormData
): Promise<RepurposeResult> {
  const validatedFields = inputSchema.safeParse({
    content: formData.get('content'),
    outputType: formData.get('outputType'),
    language: formData.get('language'),
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    return {
      success: false,
      error: errorMessages.content?.[0] || 'Invalid input provided.',
      outputType: (formData.get('outputType') as OutputType) || 'summary',
    };
  }

  const { content, outputType, language } = validatedFields.data;

  try {
    switch (outputType) {
      case 'summary': {
        const result = await repurposeContentIntoSummary({ content, language });
        return { success: true, data: result, outputType };
      }
      case 'notes': {
        const result = await (await import('@/ai/flows/repurpose-content-into-notes')).repurposeContentIntoNotes({ content, language });
        return { success: true, data: result, outputType };
      }
      case 'quiz': {
        const result = await generateQuizFromContent({ content, language });
        return { success: true, data: result, outputType };
      }
      case 'video': {
        const result = await repurposeContentIntoSummary({ content, language });
        const videoScript = `This is a generated script for a short-form video based on your content.\n\n---\n\n${result.summary}`;
        return { success: true, data: { summary: videoScript }, outputType };
      }
      default:
        return {
          success: false,
          error: 'Invalid output type selected.',
          outputType,
        };
    }
  } catch (error) {
    console.error('AI action error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while processing your content.',
      outputType,
    };
  }
}
