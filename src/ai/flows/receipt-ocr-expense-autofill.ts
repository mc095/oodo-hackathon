// src/ai/flows/receipt-ocr-expense-autofill.ts
'use server';
/**
 * @fileOverview An AI agent that extracts expense details from a receipt image using OCR.
 *
 * - receiptOcrExpenseAutofill - A function that handles the receipt OCR and expense autofill process.
 * - ReceiptOcrExpenseAutofillInput - The input type for the receiptOcrExpenseAutofill function.
 * - ReceiptOcrExpenseAutofillOutput - The return type for the receiptOcrExpenseAutofill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiptOcrExpenseAutofillInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReceiptOcrExpenseAutofillInput = z.infer<typeof ReceiptOcrExpenseAutofillInputSchema>;

const ReceiptOcrExpenseAutofillOutputSchema = z.object({
  amount: z.string().describe('The amount on the receipt.'),
  date: z.string().describe('The date on the receipt.'),
  vendor: z.string().describe('The vendor on the receipt.'),
  category: z.string().describe('The expense category on the receipt.'),
  description: z.string().describe('A description of the expense.'),
});
export type ReceiptOcrExpenseAutofillOutput = z.infer<typeof ReceiptOcrExpenseAutofillOutputSchema>;

export async function receiptOcrExpenseAutofill(input: ReceiptOcrExpenseAutofillInput): Promise<ReceiptOcrExpenseAutofillOutput> {
  return receiptOcrExpenseAutofillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'receiptOcrExpenseAutofillPrompt',
  input: {schema: ReceiptOcrExpenseAutofillInputSchema},
  output: {schema: ReceiptOcrExpenseAutofillOutputSchema},
  prompt: `You are an expert expense data extractor.

You will be provided with an image of a receipt. Extract the following information from the receipt:
- amount
- date
- vendor
- category
- description

Return the extracted information in JSON format.

Receipt: {{media url=receiptDataUri}}`,
});

const receiptOcrExpenseAutofillFlow = ai.defineFlow(
  {
    name: 'receiptOcrExpenseAutofillFlow',
    inputSchema: ReceiptOcrExpenseAutofillInputSchema,
    outputSchema: ReceiptOcrExpenseAutofillOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
