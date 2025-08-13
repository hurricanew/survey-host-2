TTI Product Requirements Document (PRD)
1. Goals and Background Context
Goals
Primary Goal: To successfully launch a Minimum Viable Product (MVP) within 3 months that validates the core hypothesis: a text-file-first workflow is a faster, more desirable method for creating online surveys for our target audience.

User Adoption: Acquire 1,000 active users within the first 6 months post-launch.

User Success: Ensure the primary user journey—creating and deploying a 10-question survey—can be completed in under 90 seconds, proving our value proposition of speed.

Business Validation: Confirm that the text-to-survey engine is the primary driver of adoption and user satisfaction.

Background Context
Existing survey creation platforms are powerful but often slow and complex, involving cumbersome GUI builders. This creates a barrier for content creators, educators, and researchers who need to generate and deploy simple assessments quickly. Our product addresses this gap by providing a streamlined web application that instantly transforms a simple text file into a modern, shareable online survey. The core focus is on creation efficiency, a modern user experience, and a low-friction identity system to maximize engagement.

Change Log
Date	Version	Description	Author
10-Aug-2025	1.0	Initial PRD draft based on Project Brief.	John (PM)

Export to Sheets
2. Requirements
Functional
FR1: Users must be able to create an account and log in using their Google account.

FR2: The system shall use FingerprintJS to provide a lightweight identification mechanism for survey respondents to discourage repeat submissions.

FR3: An authenticated user must be able to create a new survey by uploading a formatted text file.

FR4: An authenticated user must be able to create a new survey by pasting formatted text directly into a text area in the UI.

FR5: The system must parse the provided text and generate a unique, shareable URL for the live survey.

FR6: The generated survey URL must display a clean, responsive, and interactive survey-taking page built with Chakra UI.

FR7: The system shall collect all survey responses and store them securely in the PostgreSQL database, associated with the correct survey and user.

FR8: A survey creator must be able to see a simple dashboard listing their created surveys and the total number of responses received for each.

FR9: The system must integrate a basic analytics tool to track key user events such as sign-ups, survey creations, and survey completions.

Non-Functional
NFR1: The entire application, especially the survey-taking interface, must be fully responsive and function correctly on the latest versions of major desktop and mobile browsers.

NFR2: The application must be secure, implementing standard security practices (e.g., input validation, protection against XSS/CSRF) to protect user data.

NFR3: The application's initial page load time should be optimized to achieve a Lighthouse performance score of 90 or higher.

NFR4: The infrastructure must be scalable to handle the target of 1,000 active users and their survey respondents without significant performance degradation.

NFR5: The frontend and serverless functions will be hosted on Vercel, and the PostgreSQL database will be hosted on Render.com.

3. User Interface Design Goals
Overall UX Vision
The user experience will be defined by speed and simplicity. For the survey creator, the interface should feel like a powerful utility that gets out of their way. For the survey respondent, the experience should be clean, intuitive, and trustworthy, ensuring a high completion rate. The design will be minimalist, prioritizing clarity and content over ornamentation.

Key Interaction Paradigms
Creator Workflow: The primary interaction for creators will be a split-pane or toggle view: text input on one side and a live preview of the survey on the other. This provides immediate feedback and reinforces the power of the text-based workflow.

Respondent Workflow: Survey-taking will be a simple, linear, one-question-at-a-time or single-page scrollable format, optimized for mobile-first engagement.

Core Screens and Views
The MVP will require the following conceptual screens:

Landing Page, Login Page, Dashboard, Survey Creation Page, Survey Taking Page, and Submission Confirmation Page.

Accessibility: WCAG AA
The application will be designed to meet WCAG 2.1 Level AA compliance.

Branding
Branding is to be determined, but the overall aesthetic should be modern, clean, and professional.

Target Device and Platforms: Web Responsive
The application will be fully responsive for all modern devices.

4. Technical Assumptions
Repository Structure: Monorepo
The project will be developed within a single monorepo (e.g., using Turborepo). This simplifies sharing code and types between the frontend and backend.

Service Architecture
The backend will be built using a Serverless architecture, leveraging serverless functions (e.g., Vercel Functions / Next.js API Routes) to minimize infrastructure management and provide automatic scaling.

Testing Requirements
The project must include both Unit and Integration tests to ensure a solid foundation of quality for the MVP.

Additional Technical Assumptions and Requests
Frontend: Must use a React-based framework to support Chakra UI.

Database: Must use PostgreSQL, hosted on Render.com.

Hosting: The primary hosting platform will be Vercel.

5. Epic List
Epic 1: Foundational Setup & Core Survey Generation

Goal: Establish the complete project foundation, including user authentication, and deliver the core value proposition: allowing a creator to turn a text file into a shareable survey link.

Epic 2: Public Survey Completion & Basic Analytics

Goal: Build the public-facing survey interface to enable response collection, update the creator's dashboard to show response counts, and integrate the foundational analytics tool.

6. Epic 1: Foundational Setup & Core Survey Generation
Epic Goal: To establish the complete project foundation, including user authentication, and deliver the core value proposition: allowing a creator to sign in, input text for a survey, and generate a unique, shareable link.

Story 1.1: Project Scaffolding & Initial Setup
As a Developer, I want a complete project scaffold set up in a monorepo...

AC: Monorepo initialized, Next.js/Chakra UI frontend created, NestJS backend created, shared configs set up, basic CI configured, local dev environment runs with a single command.

Story 1.2: User Authentication
As a Creator, I want to sign up and log in with my Google account...

AC: Google OAuth login flow works, user is created in DB, user is redirected to dashboard, secure session is established, logout function works.

Story 1.3: Survey Creation UI
As a Creator, I want a simple interface to input my survey text and see a live preview...

AC: Dashboard has "Create" button, creation page has text area and file upload, a real-time preview is shown, "Generate Link" button is present.

Story 1.4: Text Parsing & Survey Storage
As a Creator, when I submit my formatted text, I want the system to parse and save it...

AC: Backend endpoint accepts survey text, parsing logic correctly interprets syntax, new survey record is created and linked to user, unique slug is generated and returned.

Story 1.5: Creator Dashboard & Link Generation
As a Creator, I want to see a list of my created surveys on my dashboard...

AC: Dashboard lists all surveys for the logged-in user, each item shows the title and full shareable URL, a "Copy Link" button works.

7. Epic 2: Public Survey Completion & Basic Analytics
Epic Goal: To build the public-facing survey interface, enabling response collection and storage, and integrate the foundational analytics tool.

Story 2.1: Public Survey-Taking Interface
As a survey Respondent, I want to view a survey at its unique URL...

AC: Valid survey URL renders the survey page, questions are displayed correctly, interface is responsive, "Submit" button is visible, invalid URL shows a "Not Found" page.

Story 2.2: Response Submission & Storage
As a survey Respondent, when I submit my answers, I want them to be securely recorded...

AC: Backend endpoint accepts submissions, FingerprintJS identifier is used, submission is validated, a new "response" record is created in the DB, duplicate submissions are discouraged, user is shown a confirmation page.

Story 2.3: Update Dashboard with Response Count
As a Creator, I want to see the total number of responses for each of my surveys...

AC: Dashboard displays a live response count next to each survey, count updates in near real-time, count is accurate.

Story 2.4: Basic Analytics Integration
As the Product Team, we want basic event tracking integrated...

AC: Analytics tool (e.g., PostHog) is integrated, key events (user_signup, survey_created, survey_completed, etc.) are tracked, events are associated with user IDs, no negative performance impact.

8. Checklist Results Report
I have validated the PRD against the standard Product Manager checklist. The document is comprehensive, well-structured, and ready for the next phase.

Overall Readiness: High

MVP Scope Appropriateness: Just Right

Readiness for Architecture Phase: Ready

Critical Gaps or Concerns: None

Category Analysis
Category	Status	Critical Issues
1. Problem Definition & Context	✅ PASS	None
2. MVP Scope Definition	✅ PASS	None
3. User Experience Requirements	✅ PASS	None
4. Functional Requirements	✅ PASS	None
5. Non-Functional Requirements	✅ PASS	None
6. Epic & Story Structure	✅ PASS	None
7. Technical Guidance	✅ PASS	None
8. Cross-Functional Requirements	⚠️ PARTIAL	Implicitly covered but could be more detailed in architecture. Not a blocker.
9. Clarity & Communication	✅ PASS	None