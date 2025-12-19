import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for mastery states and readiness
export const masteryStateEnum = pgEnum("mastery_state", ["unseen", "in_progress", "shaky", "solid"]);
export const readinessStateEnum = pgEnum("readiness_state", ["on_track", "borderline", "at_risk"]);
export const errorTypeEnum = pgEnum("error_type", ["conceptual", "careless", "timing"]);
export const satSectionEnum = pgEnum("sat_section", ["math", "reading", "writing"]);

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  targetScore: integer("target_score").notNull().default(1400),
  currentProjectedScore: integer("current_projected_score").notNull().default(1000),
  studyStreak: integer("study_streak").notNull().default(0),
  lastStudyDate: timestamp("last_study_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SAT Topics - organized by section
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: satSectionEnum("section").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  scoreImpact: integer("score_impact").notNull().default(10),
  testFrequency: integer("test_frequency").notNull().default(5),
});

// Student topic progress
export const studentTopicProgress = pgTable("student_topic_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  masteryState: masteryStateEnum("mastery_state").notNull().default("unseen"),
  preAssessmentScore: integer("pre_assessment_score"),
  postAssessmentScore: integer("post_assessment_score"),
  capstoneCompleted: boolean("capstone_completed").default(false),
  lastPracticed: timestamp("last_practiced"),
  practiceCount: integer("practice_count").notNull().default(0),
});

// Questions for assessments
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull().default("multiple_choice"),
  options: jsonb("options").$type<string[]>(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: integer("difficulty").notNull().default(2),
  isCapstone: boolean("is_capstone").default(false),
  videoTimestamp: integer("video_timestamp"),
});

// Student question attempts
export const questionAttempts = pgTable("question_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  questionId: varchar("question_id").notNull().references(() => questions.id),
  selectedAnswer: text("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  errorType: errorTypeEnum("error_type"),
  timeSpent: integer("time_spent"),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

// Daily check-ins
export const dailyCheckIns = pgTable("daily_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  date: timestamp("date").defaultNow(),
  studiedTopics: jsonb("studied_topics").$type<string[]>(),
  confidenceLevel: integer("confidence_level").notNull(),
  notes: text("notes"),
});

// Chat messages for the adaptive chatbot
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  context: text("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video content for learning zones
export const videoContent = pgTable("video_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  duration: integer("duration").notNull(),
  checkpoints: jsonb("checkpoints").$type<{ time: number; questionId: string }[]>(),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  topicProgress: many(studentTopicProgress),
  questionAttempts: many(questionAttempts),
  dailyCheckIns: many(dailyCheckIns),
  chatMessages: many(chatMessages),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  studentProgress: many(studentTopicProgress),
  questions: many(questions),
  videoContent: many(videoContent),
}));

export const studentTopicProgressRelations = relations(studentTopicProgress, ({ one }) => ({
  student: one(students, { fields: [studentTopicProgress.studentId], references: [students.id] }),
  topic: one(topics, { fields: [studentTopicProgress.topicId], references: [topics.id] }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  topic: one(topics, { fields: [questions.topicId], references: [topics.id] }),
  attempts: many(questionAttempts),
}));

export const questionAttemptsRelations = relations(questionAttempts, ({ one }) => ({
  student: one(students, { fields: [questionAttempts.studentId], references: [students.id] }),
  question: one(questions, { fields: [questionAttempts.questionId], references: [questions.id] }),
}));

export const dailyCheckInsRelations = relations(dailyCheckIns, ({ one }) => ({
  student: one(students, { fields: [dailyCheckIns.studentId], references: [students.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  student: one(students, { fields: [chatMessages.studentId], references: [students.id] }),
}));

export const videoContentRelations = relations(videoContent, ({ one }) => ({
  topic: one(topics, { fields: [videoContent.topicId], references: [topics.id] }),
}));

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export const insertStudentTopicProgressSchema = createInsertSchema(studentTopicProgress).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions)
  .omit({ id: true })
  .extend({
    options: z.array(z.string()).nullable().optional(),
  });
export const insertQuestionAttemptSchema = createInsertSchema(questionAttempts).omit({ id: true, attemptedAt: true });
export const insertDailyCheckInSchema = createInsertSchema(dailyCheckIns)
  .omit({ id: true, date: true })
  .extend({
    studiedTopics: z.array(z.string()).nullable().optional(),
  });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertVideoContentSchema = createInsertSchema(videoContent).omit({ id: true });

// Types
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type StudentTopicProgress = typeof studentTopicProgress.$inferSelect;
export type InsertStudentTopicProgress = z.infer<typeof insertStudentTopicProgressSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type QuestionAttempt = typeof questionAttempts.$inferSelect;
export type InsertQuestionAttempt = z.infer<typeof insertQuestionAttemptSchema>;
export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;
export type InsertDailyCheckIn = z.infer<typeof insertDailyCheckInSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type VideoContent = typeof videoContent.$inferSelect;
export type InsertVideoContent = z.infer<typeof insertVideoContentSchema>;

// Utility types for frontend
export type MasteryState = "unseen" | "in_progress" | "shaky" | "solid";
export type ReadinessState = "on_track" | "borderline" | "at_risk";
export type ErrorType = "conceptual" | "careless" | "timing";
export type SatSection = "math" | "reading" | "writing";

export interface TopicWithProgress extends Topic {
  progress?: StudentTopicProgress;
}

export interface RecommendedFocus {
  topic: Topic;
  reason: string;
  scoreImpact: number;
  priority: number;
}

export interface StudentDashboard {
  student: Student;
  readinessState: ReadinessState;
  scoreGap: number;
  topRecommendations: RecommendedFocus[];
  recentActivity: StudentTopicProgress[];
  streakInfo: { current: number; needsRecovery: boolean };
}

// Keep legacy user types for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
