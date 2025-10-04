# **App Name**: ExpenseFlow

## Core Features:

- User Authentication and Roles: Secure authentication with automatic company creation and role-based access control (Admin, Manager, Employee).
- Expense Submission: Employees can submit expenses with amount, category, description, and date; supporting multiple currencies.
- Approval Workflow Engine: Multi-level approval workflows based on manager relationships and configurable approval rules (percentage, specific approver, hybrid).
- Conditional Approval Logic: Define rules for automated approval based on predefined conditions.
- Receipt OCR: Tool to automatically extract expense details from receipts using Gemini to automate data entry. AI determines which extracted data is most relevant.
- Currency Conversion: Automatic currency conversion using an external API (https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY})
- Expense Tracking: Dashboard to view and manage expenses based on status (approved, rejected, pending) for all roles.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) for a professional and trustworthy feel.
- Background color: Very light indigo (#F0F2F9) to complement the primary.
- Accent color: Violet (#7952B3) for highlighting key actions and elements.
- Headline font: 'Poppins', a geometric sans-serif with a contemporary, precise feel. Body Font: 'PT Sans' a humanist sans-serif that combines a modern look and a little warmth or personality
- Code font: 'Source Code Pro' for displaying code snippets, monospaced font.
- Use clear, minimalist icons in a consistent style across the app. Based on excalidraw mockup.
- Smooth, subtle animations for transitions and interactions, inspired by Zoho-like UI, for a polished user experience.