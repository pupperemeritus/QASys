# Q&A System - Next.js Frontend

This is the frontend for a Question & Answering application, built with Next.js and TypeScript. It provides a chat interface for users to interact with the Q&A system.

## Features

- **Interactive Chat UI:** A clean interface for sending and receiving messages.
- **User Authentication:** Supports user registration and login via Firebase.
- **PDF Upload:** Allows authenticated users to upload PDF documents.
- **Chat History:**
  - For authenticated users, chat history is saved to and retrieved from Firestore.
  - For guest users, chat history is persisted in the browser's local storage.
- **Markdown Support:** Renders AI responses with basic Markdown formatting.

## Getting Started

### Prerequisites

- Node.js and npm (or yarn/pnpm).
- A configured Firebase project for the frontend.
- The FastAPI backend must be running.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/pupperemeritus/QASys.git
   cd QASys
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root of your project and add the following Firebase and backend configuration:

   ```
   NEXT_PUBLIC_apiKey=your-firebase-api-key
   NEXT_PUBLIC_authDomain=your-firebase-auth-domain
   NEXT_PUBLIC_projectId=your-firebase-project-id
   NEXT_PUBLIC_storageBucket=your-firebase-storage-bucket
   NEXT_PUBLIC_messagingSenderId=your-firebase-messaging-sender-id
   NEXT_PUBLIC_appId=your-firebase-app-id
   NEXT_PUBLIC_measurementId=your-firebase-measurement-id

   NEXT_PUBLIC_FASTAPI_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
   ```

### Running the Development Server

```bash
npm run dev
```
