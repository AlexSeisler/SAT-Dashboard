-- ============================================
-- SAT Dashboard Database Setup Script
-- Run this in Supabase SQL Editor
-- ============================================

-- Create ENUM types
CREATE TYPE mastery_state AS ENUM ('unseen', 'in_progress', 'shaky', 'solid');
CREATE TYPE readiness_state AS ENUM ('on_track', 'borderline', 'at_risk');
CREATE TYPE error_type AS ENUM ('conceptual', 'careless', 'timing');
CREATE TYPE sat_section AS ENUM ('math', 'reading', 'writing');

-- ============================================
-- Students Table
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    target_score INTEGER NOT NULL DEFAULT 1400,
    current_projected_score INTEGER NOT NULL DEFAULT 1000,
    study_streak INTEGER NOT NULL DEFAULT 0,
    last_study_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Topics Table
-- ============================================
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    section sat_section NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    score_impact INTEGER NOT NULL DEFAULT 10,
    test_frequency INTEGER NOT NULL DEFAULT 5
);

-- ============================================
-- Student Topic Progress Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_topic_progress (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic_id VARCHAR NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    mastery_state mastery_state NOT NULL DEFAULT 'unseen',
    pre_assessment_score INTEGER,
    post_assessment_score INTEGER,
    capstone_completed BOOLEAN DEFAULT false,
    last_practiced TIMESTAMP,
    practice_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(student_id, topic_id)
);

-- ============================================
-- Questions Table
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    topic_id VARCHAR NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty INTEGER NOT NULL DEFAULT 2,
    is_capstone BOOLEAN DEFAULT false,
    video_timestamp INTEGER
);

-- ============================================
-- Question Attempts Table
-- ============================================
CREATE TABLE IF NOT EXISTS question_attempts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    question_id VARCHAR NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    error_type error_type,
    time_spent INTEGER,
    attempted_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Daily Check-ins Table
-- ============================================
CREATE TABLE IF NOT EXISTS daily_check_ins (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT NOW(),
    studied_topics JSONB,
    confidence_level INTEGER NOT NULL,
    notes TEXT
);

-- ============================================
-- Chat Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Video Content Table
-- ============================================
CREATE TABLE IF NOT EXISTS video_content (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    topic_id VARCHAR NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER NOT NULL,
    checkpoints JSONB
);

-- ============================================
-- Legacy Users Table (for compatibility)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_student_topic_progress_student_id ON student_topic_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_topic_progress_topic_id ON student_topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_student_id ON question_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id ON question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_attempted_at ON question_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_student_id ON daily_check_ins(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_date ON daily_check_ins(date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_student_id ON chat_messages(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_video_content_topic_id ON video_content(topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_section ON topics(section);

-- ============================================
-- Enable Row Level Security (RLS) - Optional
-- Uncomment if you want to enable RLS policies
-- ============================================
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE student_topic_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify all tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

