## High-Level Goal
Generate a responsive, multi-page frontend application for "TTI", a modern tool that creates online surveys from simple text files. The application should be built using Next.js, TypeScript, and the Chakra UI component library.

---

## Visual Style & Design System
The overall aesthetic is minimalist, clean, and trustworthy, with a focus on speed and clarity. Adhere strictly to the following design system:

* **Color Palette:**
    * Primary: #2B6CB0 (for buttons, links, active elements)
    * Secondary Text/Borders: #4A5568
    * Success: #38A169
    * Error: #E53E3E
    * Background: #F7FAFC (light mode)
* **Typography:**
    * Font: "Inter" for all text.
    * H1: 32px, Bold
    * H2: 24px, Bold
    * Body: 16px, Regular
* **Iconography:** Use "Feather Icons" for all icons.
* **Spacing:** Use an 8-point grid system (all margins, padding, and gaps should be multiples of 8px).
* **Components:** Use only components from the Chakra UI library.

---

## Detailed, Step-by-Step Instructions

1.  **Project Setup:**
    * Initialize a new Next.js 14+ project using the App Router.
    * Integrate TypeScript.
    * Set up Chakra UI as the component library and theme provider.

2.  **Main Layout:**
    * Create a main layout component that includes a simple header and footer.
    * The header for an unauthenticated user should show the "TTI" logo and a "Login" button.
    * The header for an authenticated user should show the logo, a link to the "Dashboard", and a user menu with a "Logout" option.

3.  **Landing Page (`/`)**
    * Create a clean landing page.
    * It must have a large, compelling headline (e.g., "Create Surveys as Fast as You Can Type").
    * Include a sub-headline explaining the text-to-survey concept.
    * Feature a primary call-to-action button: "Create Your First Survey".
    * Include a "Login with Google" button.

4.  **Creator Dashboard Page (`/dashboard`)**
    * This page is for authenticated users only.
    * Display a welcome message, e.g., "Welcome back!".
    * Include a prominent "Create New Survey" button.
    * Below, display a grid or list of survey cards.
    * Each survey card should be a `Card` component containing:
        * The survey's title.
        * A small stat showing "Total Responses: 12".
        * A "Copy Link" button with a copy icon.
    * Use placeholder data for the list of surveys.

5.  **Create Survey Page (`/create`)**
    * This page is for authenticated users only.
    * Implement a two-panel, split-screen layout that is responsive. On mobile, the panels should stack vertically.
    * **Left Panel:** A large `Textarea` component for user input. Include a small button for "Upload File".
    * **Right Panel:** A live preview area that shows how the survey will look. For now, you can populate this with static placeholder components representing a survey.
    * Include a primary "Generate Link" button below the panels.

---

## Constraints & Scope

* **Technology:** You MUST use Next.js, TypeScript, and Chakra UI.
* **Styling:** All styling MUST be done using Chakra UI's built-in style props (e.g., `<Box bg="blue.500">`) or the `sx` prop. Do not write separate CSS files or use styled-components.
* **Logic:** This is a UI-only task. Do NOT implement any backend logic, database connections, or user authentication functionality. All data should be mocked, and buttons can have empty `onClick` handlers.
* **Scope:** Generate only the pages and components described above. Do not create additional pages like "Account Settings" or a detailed results view.