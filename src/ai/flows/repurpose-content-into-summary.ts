'use server';

/**
 * @fileOverview A content repurposing AI agent that summarizes content in a chosen language.
 *
 * - repurposeContentIntoSummary - A function that handles the content summarization process.
 * - RepurposeContentIntoSummaryInput - The input type for the repurposeContentIntoSummary function.
 * - RepurposeContentIntoSummaryOutput - The return type for the repurposeContentIntoSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RepurposeContentIntoSummaryInputSchema = z.object({
  content: z
    .string()
    .describe('The content to be summarized, can be text, a document, or video transcript.'),
  language: z
    .string()
    .describe('The target language for the summary.'),
});
export type RepurposeContentIntoSummaryInput = z.infer<typeof RepurposeContentIntoSummaryInputSchema>;

const RepurposeContentIntoSummaryOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the content in the chosen language.'),
  progress: z.string().describe('A short summary of the flow execution.'),
});
export type RepurposeContentIntoSummaryOutput = z.infer<typeof RepurposeContentIntoSummaryOutputSchema>;

export async function repurposeContentIntoSummary(input: RepurposeContentIntoSummaryInput): Promise<RepurposeContentIntoSummaryOutput> {
  return repurposeContentIntoSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'repurposeContentIntoSummaryPrompt',
  input: {schema: RepurposeContentIntoSummaryInputSchema},
  output: {schema: RepurposeContentIntoSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes content into a concise summary in the chosen language.

  Summarize the following content in {{language}}:
  Content: {{{content}}}
  `,
});

const repurposeContentIntoSummaryFlow = ai.defineFlow(
  {
    name: 'repurposeContentIntoSummaryFlow',
    inputSchema: RepurposeContentIntoSummaryInputSchema,
    outputSchema: RepurposeContentIntoSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Content was summarized into a concise summary in the chosen language.'
    };
  }
);
