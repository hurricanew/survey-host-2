# Epic 1: Foundational Setup & Core Survey Generation

Epic Goal: To establish the complete project foundation, including user authentication, and deliver the core value proposition: allowing a creator to sign in, input text for a survey, and generate a unique, shareable link.

## Story 1.1: Project Scaffolding & Initial Setup
As a Developer, I want a complete project scaffold set up in a monorepo...

AC: Monorepo initialized, Next.js/Chakra UI frontend created, NestJS backend created, shared configs set up, basic CI configured, local dev environment runs with a single command.

## Story 1.2: User Authentication
As a Creator, I want to sign up and log in with my Google account...

AC: Google OAuth login flow works, user is created in DB, user is redirected to dashboard, secure session is established, logout function works.

## Story 1.3: Survey Creation UI
As a Creator, I want a simple interface to input my survey text and see a live preview...

AC: Dashboard has "Create" button, creation page has text area and file upload, a real-time preview is shown, "Generate Link" button is present.

## Story 1.4: Text Parsing & Survey Storage
As a Creator, when I submit my formatted text, I want the system to parse and save it...

AC: Backend endpoint accepts survey text, parsing logic correctly interprets syntax, new survey record is created and linked to user, unique slug is generated and returned.

## Story 1.5: Creator Dashboard & Link Generation
As a Creator, I want to see a list of my created surveys on my dashboard...

AC: Dashboard lists all surveys for the logged-in user, each item shows the title and full shareable URL, a "Copy Link" button works.