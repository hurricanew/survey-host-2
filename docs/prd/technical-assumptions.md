# Technical Assumptions

## Repository Structure: Monorepo
The project will be developed within a single monorepo (e.g., using Turborepo). This simplifies sharing code and types between the frontend and backend.

## Service Architecture
The backend will be built using a Serverless architecture, leveraging serverless functions (e.g., Vercel Functions / Next.js API Routes) to minimize infrastructure management and provide automatic scaling.

## Testing Requirements
The project must include both Unit and Integration tests to ensure a solid foundation of quality for the MVP.

## Additional Technical Assumptions and Requests
Frontend: Must use a React-based framework to support Chakra UI.

Database: Must use PostgreSQL, hosted on Render.com.

Hosting: The primary hosting platform will be Vercel.