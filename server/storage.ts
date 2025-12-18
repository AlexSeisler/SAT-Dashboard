import { 
  students, topics, studentTopicProgress, questions, questionAttempts, 
  dailyCheckIns, chatMessages, videoContent,
  type Student, type InsertStudent, type Topic, type InsertTopic,
  type StudentTopicProgress, type InsertStudentTopicProgress,
  type Question, type InsertQuestion, type QuestionAttempt, type InsertQuestionAttempt,
  type DailyCheckIn, type InsertDailyCheckIn, type ChatMessage, type InsertChatMessage,
  type VideoContent, type InsertVideoContent, type TopicWithProgress, type RecommendedFocus,
  type ReadinessState, type StudentDashboard
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, data: Partial<InsertStudent>): Promise<Student | undefined>;
  
  // Topic operations
  getAllTopics(): Promise<Topic[]>;
  getTopicsBySection(section: string): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Student topic progress
  getStudentTopicProgress(studentId: string, topicId: string): Promise<StudentTopicProgress | undefined>;
  getAllStudentProgress(studentId: string): Promise<StudentTopicProgress[]>;
  upsertStudentTopicProgress(progress: InsertStudentTopicProgress): Promise<StudentTopicProgress>;
  
  // Questions
  getQuestionsByTopic(topicId: string): Promise<Question[]>;
  getCapstoneQuestion(topicId: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Question attempts
  recordQuestionAttempt(attempt: InsertQuestionAttempt): Promise<QuestionAttempt>;
  getStudentQuestionAttempts(studentId: string): Promise<QuestionAttempt[]>;
  
  // Daily check-ins
  createDailyCheckIn(checkIn: InsertDailyCheckIn): Promise<DailyCheckIn>;
  getStudentCheckIns(studentId: string, limit?: number): Promise<DailyCheckIn[]>;
  
  // Chat messages
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(studentId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Video content
  getVideoByTopic(topicId: string): Promise<VideoContent | undefined>;
  
  // Dashboard data
  getStudentDashboard(studentId: string): Promise<StudentDashboard | null>;
  getTopicsWithProgress(studentId: string): Promise<TopicWithProgress[]>;
  getRecommendedFocus(studentId: string): Promise<RecommendedFocus[]>;
}

export class DatabaseStorage implements IStorage {
  // Student operations
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.email, email));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async updateStudent(id: string, data: Partial<InsertStudent>): Promise<Student | undefined> {
    const [student] = await db.update(students).set(data).where(eq(students.id, id)).returning();
    return student || undefined;
  }

  // Topic operations
  async getAllTopics(): Promise<Topic[]> {
    return db.select().from(topics).orderBy(topics.section, topics.order);
  }

  async getTopicsBySection(section: string): Promise<Topic[]> {
    return db.select().from(topics).where(eq(topics.section, section as any)).orderBy(topics.order);
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic || undefined;
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const [topic] = await db.insert(topics).values(insertTopic).returning();
    return topic;
  }

  // Student topic progress
  async getStudentTopicProgress(studentId: string, topicId: string): Promise<StudentTopicProgress | undefined> {
    const [progress] = await db.select().from(studentTopicProgress)
      .where(and(
        eq(studentTopicProgress.studentId, studentId),
        eq(studentTopicProgress.topicId, topicId)
      ));
    return progress || undefined;
  }

  async getAllStudentProgress(studentId: string): Promise<StudentTopicProgress[]> {
    return db.select().from(studentTopicProgress)
      .where(eq(studentTopicProgress.studentId, studentId));
  }

  async upsertStudentTopicProgress(progress: InsertStudentTopicProgress): Promise<StudentTopicProgress> {
    const existing = await this.getStudentTopicProgress(progress.studentId, progress.topicId);
    
    if (existing) {
      const updateData: Partial<StudentTopicProgress> = {
        ...progress,
        lastPracticed: new Date(),
        practiceCount: (existing.practiceCount || 0) + 1,
      };
      
      if (progress.masteryState !== undefined) {
        updateData.masteryState = progress.masteryState as any;
      }
      if (progress.preAssessmentScore !== undefined) {
        updateData.preAssessmentScore = progress.preAssessmentScore;
      }
      if (progress.postAssessmentScore !== undefined) {
        updateData.postAssessmentScore = progress.postAssessmentScore;
      }
      if (progress.capstoneCompleted !== undefined) {
        updateData.capstoneCompleted = progress.capstoneCompleted;
      }
      
      const [updated] = await db.update(studentTopicProgress)
        .set(updateData)
        .where(eq(studentTopicProgress.id, existing.id))
        .returning();
      return updated;
    }
    
    const newProgress = {
      ...progress,
      lastPracticed: new Date(),
      practiceCount: 1,
    };
    const [created] = await db.insert(studentTopicProgress).values(newProgress).returning();
    return created;
  }

  // Questions
  async getQuestionsByTopic(topicId: string): Promise<Question[]> {
    return db.select().from(questions)
      .where(and(eq(questions.topicId, topicId), eq(questions.isCapstone, false)))
      .orderBy(questions.difficulty);
  }

  async getCapstoneQuestion(topicId: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions)
      .where(and(eq(questions.topicId, topicId), eq(questions.isCapstone, true)));
    return question || undefined;
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  // Question attempts
  async recordQuestionAttempt(attempt: InsertQuestionAttempt): Promise<QuestionAttempt> {
    const [record] = await db.insert(questionAttempts).values(attempt).returning();
    return record;
  }

  async getStudentQuestionAttempts(studentId: string): Promise<QuestionAttempt[]> {
    return db.select().from(questionAttempts)
      .where(eq(questionAttempts.studentId, studentId))
      .orderBy(desc(questionAttempts.attemptedAt));
  }

  // Daily check-ins
  async createDailyCheckIn(checkIn: InsertDailyCheckIn): Promise<DailyCheckIn> {
    const [record] = await db.insert(dailyCheckIns).values(checkIn).returning();
    return record;
  }

  async getStudentCheckIns(studentId: string, limit = 30): Promise<DailyCheckIn[]> {
    return db.select().from(dailyCheckIns)
      .where(eq(dailyCheckIns.studentId, studentId))
      .orderBy(desc(dailyCheckIns.date))
      .limit(limit);
  }

  // Chat messages
  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [record] = await db.insert(chatMessages).values(message).returning();
    return record;
  }

  async getChatHistory(studentId: string, limit = 50): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(eq(chatMessages.studentId, studentId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Video content
  async getVideoByTopic(topicId: string): Promise<VideoContent | undefined> {
    const [video] = await db.select().from(videoContent).where(eq(videoContent.topicId, topicId));
    return video || undefined;
  }

  // Dashboard data
  async getTopicsWithProgress(studentId: string): Promise<TopicWithProgress[]> {
    const allTopics = await this.getAllTopics();
    const progress = await this.getAllStudentProgress(studentId);
    
    const progressMap = new Map(progress.map(p => [p.topicId, p]));
    
    return allTopics.map(topic => ({
      ...topic,
      progress: progressMap.get(topic.id),
    }));
  }

  async getRecommendedFocus(studentId: string): Promise<RecommendedFocus[]> {
    const topicsWithProgress = await this.getTopicsWithProgress(studentId);
    
    // Calculate priority based on mastery state, score impact, and recency
    const recommendations = topicsWithProgress
      .filter(t => !t.progress || t.progress.masteryState !== "solid")
      .map(topic => {
        let priority = 0;
        const mastery = topic.progress?.masteryState || "unseen";
        
        // Shaky topics get highest priority (need review)
        if (mastery === "shaky") priority = 1;
        else if (mastery === "in_progress") priority = 2;
        else priority = 3;
        
        // Adjust by score impact
        const scoreImpact = topic.scoreImpact;
        
        let reason = "";
        if (mastery === "shaky") {
          reason = `This topic needs review to solidify your understanding. High test frequency means it's worth your time.`;
        } else if (mastery === "in_progress") {
          reason = `You're making progress here. A bit more practice will move this to solid mastery.`;
        } else {
          reason = `New topic with high score impact (${scoreImpact} points). Starting here could boost your overall score.`;
        }

        return {
          topic,
          reason,
          scoreImpact,
          priority,
        };
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.scoreImpact - a.scoreImpact;
      })
      .slice(0, 3);

    return recommendations;
  }

  async getStudentDashboard(studentId: string): Promise<StudentDashboard | null> {
    const student = await this.getStudent(studentId);
    if (!student) return null;

    const topicsWithProgress = await this.getTopicsWithProgress(studentId);
    const recommendations = await this.getRecommendedFocus(studentId);
    
    // Calculate readiness state based on projected score vs target
    const scoreGap = student.targetScore - student.currentProjectedScore;
    let readinessState: ReadinessState;
    if (scoreGap <= 50) readinessState = "on_track";
    else if (scoreGap <= 150) readinessState = "borderline";
    else readinessState = "at_risk";

    // Calculate streak info
    const now = new Date();
    const lastStudy = student.lastStudyDate ? new Date(student.lastStudyDate) : null;
    const daysSinceLastStudy = lastStudy 
      ? Math.floor((now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const needsRecovery = daysSinceLastStudy > 1 && student.studyStreak > 0;

    // Get recent activity (last 5 progress updates)
    const recentActivity = topicsWithProgress
      .filter(t => t.progress?.lastPracticed)
      .sort((a, b) => {
        const aTime = a.progress?.lastPracticed ? new Date(a.progress.lastPracticed).getTime() : 0;
        const bTime = b.progress?.lastPracticed ? new Date(b.progress.lastPracticed).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map(t => t.progress!);

    return {
      student,
      readinessState,
      scoreGap,
      topRecommendations: recommendations,
      recentActivity,
      streakInfo: { current: student.studyStreak, needsRecovery },
    };
  }
}

export const storage = new DatabaseStorage();
