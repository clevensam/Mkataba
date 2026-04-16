# Trustfy - Secure Contract Platform

Trustfy is a professional, full-stack contract management platform specifically designed for the Tanzanian market. It enables users to create, digitally sign, and manage legally structured contracts with ease and security.

## 🚀 Features

- **Professional Templates**: A curated library of contract templates including Rental Agreements, Car Sales, Employment Contracts, Loans, and more.
- **Interactive Editor**: Fill out complex legal documents through a simple, guided interface.
- **Digital Signatures**: Securely sign contracts directly within the application using an integrated signature pad.
- **PDF Generation**: Download high-quality, professional PDF versions of your signed contracts or blank templates.
- **Personal Dashboard**: Track the status of all your documents (Drafts, Pending Review, Signed) in one centralized location.
- **Admin Dashboard**: Specialized tools for platform administrators to manage templates and seed initial data.
- **Responsive Design**: Fully optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend**:
  - [React 18+](https://reactjs.org/) with [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/) for type safety
  - [Tailwind CSS](https://tailwindcss.com/) for modern, utility-first styling
  - [Lucide React](https://lucide.dev/) for consistent iconography
  - [Framer Motion](https://www.framer.com/motion/) for smooth animations
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Utilities**:
  - [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/) for PDF generation
  - [Signature Pad](https://github.com/szimek/signature_pad) for digital signatures
  - [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for robust form handling

## 📦 Project Structure

```text
├── src/
│   ├── components/       # Reusable UI and Layout components
│   ├── pages/            # Main application views (Dashboard, Editor, etc.)
│   ├── services/         # API and third-party service integrations
│   ├── lib/              # Utility functions and shared logic
│   ├── firebase.ts       # Firebase initialization and config
│   └── App.tsx           # Main routing and application entry
├── server.ts             # Express server entry point
├── firestore.rules       # Firebase security rules
├── firebase-blueprint.json # Data model definition
├── metadata.json         # Application metadata
└── package.json          # Project dependencies and scripts
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
GEMINI_API_KEY=your_api_key_here
APP_URL=your_app_url_here
```

### Development

Start the development server (Express + Vite):
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

Build the frontend for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 🔒 Security

Trustfy implements strict Firebase Security Rules to ensure that:
- Users can only access their own documents.
- Sensitive PII is protected.
- Data integrity is maintained through schema validation.

## 📄 License

© 2026 Trustfy Platform. All rights reserved.
