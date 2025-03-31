<h1 align="start">
  Themis - Your AI-Powered Legal Assistant
</h1>


## Introduction

Themis is a modern, AI-driven web application designed to assist legal professionals in automating document review, extracting key insights, and enabling efficient legal research. It leverages Natural Language Processing (NLP), Retrieval-Augmented Generation (RAG), and secure document management to enhance legal workflows.


## Features

### 1. Document Upload & Management
- Upload legal documents in various formats (PDF, DOCX)
- Smart categorization and tagging system
- Built-in version control functionality

### 2. Automated Document Review
- Key information extraction (names, dates, clauses)
- Inconsistency detection
- Automatic sensitive data redaction

### 3. Legal Case Law Summarization
- Automated case law summary generation
- Citation analysis and reference tracking
- Key precedent identification

### 4. Legal Insights & Analytics
- Historical legal data trend analysis
- Contract risk assessment tools
- Performance metrics visualization

### 5. AI-Powered Q&A System
- Document-based query processing
- Integration with IPC and BNS databases
- PineconeDB vector search implementation
- Toggle between document-only and full knowledge base

### 6. Document Drafting Assistance
- Template library for legal documents
- Context-aware clause suggestions
- Smart drafting recommendations

## Tech Stack

- **Next.js**: For building the React-based website.
- **TailwindCSS**: For styling with utility-first CSS.
- **Shadcn UI**: For UI components.
- **Magic UI**: For UI components.
- **Clerk**: For user authentication.

## Quick Start

### Prerequisites

Make sure that you have installed

- Node.js
- Git
- npm / yarn / pnpm / bun

1. Clone this repository:

   ```bash
   git clone 
   cd hackathon3.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup env variables:

   ```bash
    # app
    NEXT_PUBLIC_URL=http://localhost:3000
    NEXT_PUBLIC_DOMAIN=localhost:3000

    # clerk
    CLERK_SECRET_KEY=
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to http://localhost:3000 to see the website in action.

