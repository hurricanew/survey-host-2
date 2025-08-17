# Database Setup Instructions

## Quick Setup with Supabase (Recommended)

1. Go to https://supabase.com
2. Create a free account
3. Create a new project named "survey-host-dev"
4. Get the database URL from the project settings
5. Update the DATABASE_URL in apps/api/.env

## Manual PostgreSQL Setup

If you have PostgreSQL installed locally:

```bash
# Create database
createdb survey_host_dev

# Update .env file
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/survey_host_dev"
```

## Current Status

The application is ready to connect to a PostgreSQL database. Once you have a database URL:

1. Update apps/api/.env with the correct DATABASE_URL
2. Run migrations: `npx prisma migrate dev --name init`
3. Start the API server

The dashboard and save functionality are already implemented and will work once connected to a proper database.