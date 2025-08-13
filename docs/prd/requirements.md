# Requirements

## Functional
FR1: Users must be able to create an account and log in using their Google account.

FR2: The system shall use FingerprintJS to provide a lightweight identification mechanism for survey respondents to discourage repeat submissions.

FR3: An authenticated user must be able to create a new survey by uploading a formatted text file.

FR4: An authenticated user must be able to create a new survey by pasting formatted text directly into a text area in the UI.

FR5: The system must parse the provided text and generate a unique, shareable URL for the live survey.

FR6: The generated survey URL must display a clean, responsive, and interactive survey-taking page built with Chakra UI.

FR7: The system shall collect all survey responses and store them securely in the PostgreSQL database, associated with the correct survey and user.

FR8: A survey creator must be able to see a simple dashboard listing their created surveys and the total number of responses received for each.

FR9: The system must integrate a basic analytics tool to track key user events such as sign-ups, survey creations, and survey completions.

## Non-Functional
NFR1: The entire application, especially the survey-taking interface, must be fully responsive and function correctly on the latest versions of major desktop and mobile browsers.

NFR2: The application must be secure, implementing standard security practices (e.g., input validation, protection against XSS/CSRF) to protect user data.

NFR3: The application's initial page load time should be optimized to achieve a Lighthouse performance score of 90 or higher.

NFR4: The infrastructure must be scalable to handle the target of 1,000 active users and their survey respondents without significant performance degradation.

NFR5: The frontend and serverless functions will be hosted on Vercel, and the PostgreSQL database will be hosted on Render.com.