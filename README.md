
# MediStore - Pharmacy Management System

MediStore is a Next.js-based application designed for pharmacy management, including billing, stock control, and staff management.

## Features (Current State)

*   **New Bill Creation:** Generate bills for patients, including medication items.
*   **View Bills:** Browse and view details of generated bills.
*   **Stock Management:** Add new stock and view current inventory. (Data for 'Add Stock' and 'View Stock' is currently in-memory and will be lost on server restart).
*   **Staff Management:** Add, edit, and manage staff accounts. (Staff data is saved to a local `src/data/staff.json` file).
*   **Pharmacy Profile:** Configure pharmacy details. (Data saved to a local API in-memory store, will be lost on server restart).
*   **Settings:** Configure application appearance, tax settings, and manage doctor lists for billing. (Settings are saved to browser localStorage).
*   **Authentication:** Simple role-based (Admin/Staff) login.

## Requirements

*   **Node.js:** Version 18.x or later (includes npm). You can download it from [nodejs.org](https://nodejs.org/).
*   **Git:** For cloning the repository.

## Getting Started

Follow these steps to set up and run the application locally:

**1. Clone the Repository**

```bash
git clone <your-repository-url>
cd <repository-directory-name>
```
Replace `<your-repository-url>` with the actual URL of your GitHub repository and `<repository-directory-name>` with the name of the cloned folder.

**2. Install Dependencies**

Navigate to the project directory and install the required npm packages:

```bash
npm install
```

**3. Environment Variables (Optional for Local File-Based Staff Data)**

The application is configured to potentially use Firebase services. For the current file-based staff management, Firebase environment variables are not strictly necessary for the staff feature to run, but they are present in `apphosting.yaml` for potential future Firebase integration or deployment to Firebase App Hosting.

If you were to use Firebase backend features (e.g., Firestore for data persistence other than staff, Firebase Authentication), you would need to:
    * Create a `.env.local` file in the root of your project.
    * Add your Firebase project credentials:
      ```env
      FIREBASE_PROJECT_ID="your-firebase-project-id"
      FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
      FIREBASE_PRIVATE_KEY="your-firebase-private-key"
      # Ensure the private key is correctly formatted (e.g., newlines as \n if necessary)
      ```
    * **Note:** The `src/lib/firebase-admin.ts` is currently set to a non-initializing placeholder to prevent errors if these variables are not set. To use Firebase Admin SDK, you'd need to restore its initialization logic.

**4. Data Files**

*   **Staff Data:** Staff information is stored in `src/data/staff.json`. This file will be created if it doesn't exist when the API is first called, or you can use the sample provided. Data persistence for staff relies on this file.
*   **Other Data:**
    *   Pharmacy Profile and Added Stock: Currently use in-memory storage within their respective API routes or frontend state, meaning data will be lost on server/application restart.
    *   Doctors List & Tax Settings (from Settings page): Saved in browser localStorage.

**5. Run the Development Server**

Start the Next.js development server:

```bash
npm run dev
```

This command typically starts the application on `http://localhost:3000` (or `http://localhost:9002` if `-p 9002` is still in the script and no other process is using it). Check your terminal output for the exact local URL.

**6. Access the Application**

Open your web browser and navigate to the URL provided in the terminal (e.g., `http://localhost:3000`).

*   **Default Login:**
    *   **Admin:** Try `admin` / `password` (or any password, as admin validation is basic).
    *   **Staff:** Use usernames from `src/data/staff.json` (e.g., `alice`, `bob`) with any password. Ensure the staff member is "Active".

## Available Scripts

*   `npm run dev`: Starts the Next.js development server with Turbopack.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts a Next.js production server (requires `npm run build` first).
*   `npm run lint`: Runs ESLint to check for code quality issues.
*   `npm run typecheck`: Runs TypeScript to check for type errors.

## Key Technologies

*   **Next.js:** React framework for server-side rendering and static site generation.
*   **React:** JavaScript library for building user interfaces.
*   **TypeScript:** Superset of JavaScript that adds static typing.
*   **Tailwind CSS:** Utility-first CSS framework for styling.
*   **ShadCN UI:** Re-usable UI components.
*   **Genkit (Google AI):** For AI-related functionalities (currently not in active use in core features but configured).
*   **Lucide Icons:** Icon library.

## Important Notes on Data Persistence

*   **Staff Management:** Data is persisted to `src/data/staff.json`.
*   **Stock Management (Add Stock, View Stock):** Stock data added via the "Add Stock" page is stored in-memory on the client-side (`ViewStockPage` state) and will be lost when you refresh the page or close the browser. The "Add Stock" form does not currently save to any persistent backend.
*   **Pharmacy Profile:** Data is stored in-memory in the API route (`src/app/api/pharmacy-profile/route.ts`) and will be lost on server restart.
*   **Settings Page Data (Doctors, Tax):** Saved in the browser's localStorage.
*   **Bill Data:** Bills created on the "New Bill" page are stored in client-side state (`todaysBills` in `src/app/page.tsx`) and will be lost on page refresh or navigation away, unless explicitly passed to another component or persisted. They are not saved to a backend.

This setup is suitable for local development and testing. For a production deployment requiring reliable data persistence, a dedicated database solution would be necessary for features like stock, pharmacy profile, and bills.

## Deployment

This application can be deployed to platforms like Vercel, Netlify, or Firebase App Hosting.

*   **Firebase App Hosting:** The `apphosting.yaml` file is configured for Firebase App Hosting. Remember the limitations of file-based storage on serverless platforms; data in `staff.json` may not be reliably persistent across deployments or instance restarts on such platforms. A proper database would be needed for robust data storage.

---

This README should provide a good starting point for anyone looking to run or contribute to your project!
