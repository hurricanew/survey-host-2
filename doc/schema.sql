-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for registered users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for surveys, supporting both guest and registered creators
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    structure JSONB NOT NULL,
    creator_fingerprint_id TEXT,
    creator_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying of surveys
CREATE INDEX idx_surveys_creator_user_id ON surveys(creator_user_id);
CREATE INDEX idx_surveys_creator_fingerprint_id ON surveys(creator_fingerprint_id);

-- Table for individual survey submissions
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_fingerprint_id TEXT NOT NULL,
    answers JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent a respondent from submitting to the same survey more than once
    UNIQUE (survey_id, respondent_fingerprint_id)
);

-- Index for efficiently fetching all responses for a given survey
CREATE INDEX idx_responses_survey_id ON responses(survey_id);