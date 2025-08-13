# **2. High Level Architecture**

## **Technical Summary**
TTI will be architected as a modern, full-stack serverless application managed within a monorepo. It will feature a progressive authentication model, initially identifying users with FingerprintJS for immediate access and later prompting for a full Google account. The frontend will be a responsive Next.js and React application, and the backend will consist of serverless functions. This structure is designed for low friction, rapid development, and automatic scaling.

## **Platform and Infrastructure Choice**
* **Platform:** **Vercel** for frontend hosting and serverless function execution. **Render.com** for the database.
* **Key Services:**
    * Vercel: Next.js Hosting, Serverless Functions, Vercel Blob (for potential text file storage).
    * Render.com: Managed PostgreSQL.
    * Google: OAuth 2.0 for authentication.
* **Deployment Host and Regions:** Vercel (Global Edge Network), Render (e.g., US East).

## **Repository Structure**
* **Structure:** **Monorepo**.
* **Monorepo Tool:** **Turborepo** (as configured by `create-next-app`).
* **Package Organization:**
    * `apps/web`: The Next.js frontend application.
    * `apps/api`: The NestJS backend for API services.
    * `packages/shared`: Shared TypeScript types, validation schemas, and utilities for use by both `web` and `api`.

## **High Level Architecture Diagram**
```mermaid
graph TD
    subgraph "User Journey"
        User(New User) -->|First Visit| A[Identified by FingerprintJS];
        A -->|Creates Surveys 1-3| B[Guest Session];
        B -->|Creates 4th Survey| C[Prompted to Sign Up];
        C -->|Authenticates| D[Full Account via Google OAuth];
    end

    subgraph "System Interaction"
        B -- API Calls w/ Fingerprint ID --> API(Serverless API);
        D -- API Calls w/ User Token --> API;
        API -- Stores/Retrieves Data --> DB[(Render PostgreSQL)];
    end

    style D fill:#90EE90
```