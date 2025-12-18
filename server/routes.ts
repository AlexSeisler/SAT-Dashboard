import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertStudentSchema, insertTopicSchema, insertStudentTopicProgressSchema,
  insertQuestionSchema, insertQuestionAttemptSchema, insertDailyCheckInSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Middleware to parse JSON
  app.use((req, res, next) => {
    if (req.is('application/json')) {
      next();
    } else {
      next();
    }
  });

  // ===== STUDENT ENDPOINTS =====
  
  // Get student by ID
  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  // Get or create demo student for the app
  app.get("/api/students/demo/current", async (req, res) => {
    try {
      let student = await storage.getStudentByEmail("demo@satprep.com");
      
      if (!student) {
        student = await storage.createStudent({
          name: "Demo Student",
          email: "demo@satprep.com",
          targetScore: 1400,
          currentProjectedScore: 1180,
          studyStreak: 5,
          lastStudyDate: new Date(),
        });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error getting demo student:", error);
      res.status(500).json({ error: "Failed to get demo student" });
    }
  });

  // Create new student
  app.post("/api/students", async (req, res) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(data);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  // Update student
  app.patch("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.updateStudent(req.params.id, req.body);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  // ===== DASHBOARD ENDPOINT =====
  
  app.get("/api/dashboard/:studentId", async (req, res) => {
    try {
      const dashboard = await storage.getStudentDashboard(req.params.studentId);
      if (!dashboard) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(dashboard);
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  // ===== TOPIC ENDPOINTS =====
  
  // Get all topics
  app.get("/api/topics", async (req, res) => {
    try {
      const topicsList = await storage.getAllTopics();
      res.json(topicsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  // Get topics by section
  app.get("/api/topics/section/:section", async (req, res) => {
    try {
      const topicsList = await storage.getTopicsBySection(req.params.section);
      res.json(topicsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  // Get single topic
  app.get("/api/topics/:id", async (req, res) => {
    try {
      const topic = await storage.getTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }
      res.json(topic);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch topic" });
    }
  });

  // Get topics with progress for a student
  app.get("/api/topics/progress/:studentId", async (req, res) => {
    try {
      const topicsWithProgress = await storage.getTopicsWithProgress(req.params.studentId);
      res.json(topicsWithProgress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch topics with progress" });
    }
  });

  // ===== STUDENT PROGRESS ENDPOINTS =====
  
  // Get student progress for a topic
  app.get("/api/progress/:studentId/:topicId", async (req, res) => {
    try {
      const progress = await storage.getStudentTopicProgress(
        req.params.studentId,
        req.params.topicId
      );
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Update student progress
  app.post("/api/progress", async (req, res) => {
    try {
      const data = insertStudentTopicProgressSchema.parse(req.body);
      const progress = await storage.upsertStudentTopicProgress(data);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // ===== QUESTION ENDPOINTS =====
  
  // Get questions for a topic (pre-assessment)
  app.get("/api/questions/topic/:topicId", async (req, res) => {
    try {
      const questionsList = await storage.getQuestionsByTopic(req.params.topicId);
      res.json(questionsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Get capstone question for a topic
  app.get("/api/questions/capstone/:topicId", async (req, res) => {
    try {
      const question = await storage.getCapstoneQuestion(req.params.topicId);
      res.json(question || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch capstone question" });
    }
  });

  // ===== QUESTION ATTEMPTS =====
  
  // Record a question attempt
  app.post("/api/attempts", async (req, res) => {
    try {
      const data = insertQuestionAttemptSchema.parse(req.body);
      const attempt = await storage.recordQuestionAttempt(data);
      res.status(201).json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to record attempt" });
    }
  });

  // Get student's question attempts
  app.get("/api/attempts/:studentId", async (req, res) => {
    try {
      const attempts = await storage.getStudentQuestionAttempts(req.params.studentId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attempts" });
    }
  });

  // ===== DAILY CHECK-INS =====
  
  // Create daily check-in
  app.post("/api/checkins", async (req, res) => {
    try {
      const data = insertDailyCheckInSchema.parse(req.body);
      const checkIn = await storage.createDailyCheckIn(data);
      res.status(201).json(checkIn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create check-in" });
    }
  });

  // Get student check-ins
  app.get("/api/checkins/:studentId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const checkIns = await storage.getStudentCheckIns(req.params.studentId, limit);
      res.json(checkIns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch check-ins" });
    }
  });

  // ===== CHAT MESSAGES =====
  
  // Save chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const data = insertChatMessageSchema.parse(req.body);
      const message = await storage.saveChatMessage(data);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to save message" });
    }
  });

  // Get chat history
  app.get("/api/chat/:studentId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChatHistory(req.params.studentId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // ===== RECOMMENDED FOCUS =====
  
  app.get("/api/recommendations/:studentId", async (req, res) => {
    try {
      const recommendations = await storage.getRecommendedFocus(req.params.studentId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // ===== VIDEO CONTENT =====
  
  app.get("/api/video/:topicId", async (req, res) => {
    try {
      const video = await storage.getVideoByTopic(req.params.topicId);
      res.json(video || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video" });
    }
  });

  // ===== SEED DATA ENDPOINT (for development) =====
  
  app.post("/api/seed", async (req, res) => {
    try {
      // Check if topics already exist
      const existingTopics = await storage.getAllTopics();
      if (existingTopics.length > 0) {
        return res.json({ message: "Data already seeded", topics: existingTopics.length });
      }

      // Seed topics
      const mathTopics = [
        { section: "math" as const, name: "Linear Equations", description: "Solving one and two-variable linear equations", order: 1, scoreImpact: 25, testFrequency: 8 },
        { section: "math" as const, name: "Quadratic Functions", description: "Understanding parabolas and quadratic expressions", order: 2, scoreImpact: 20, testFrequency: 6 },
        { section: "math" as const, name: "Systems of Equations", description: "Solving systems using substitution and elimination", order: 3, scoreImpact: 18, testFrequency: 5 },
        { section: "math" as const, name: "Polynomials", description: "Operations with polynomial expressions", order: 4, scoreImpact: 15, testFrequency: 4 },
        { section: "math" as const, name: "Ratios & Percentages", description: "Working with proportional relationships", order: 5, scoreImpact: 15, testFrequency: 7 },
        { section: "math" as const, name: "Geometry Basics", description: "Area, perimeter, and basic geometric properties", order: 6, scoreImpact: 12, testFrequency: 5 },
        { section: "math" as const, name: "Trigonometry", description: "Basic trigonometric functions and relationships", order: 7, scoreImpact: 10, testFrequency: 3 },
        { section: "math" as const, name: "Data Analysis", description: "Statistics, probability, and data interpretation", order: 8, scoreImpact: 18, testFrequency: 6 },
      ];

      const readingTopics = [
        { section: "reading" as const, name: "Main Idea", description: "Identifying central themes in passages", order: 1, scoreImpact: 20, testFrequency: 10 },
        { section: "reading" as const, name: "Supporting Details", description: "Finding evidence and supporting information", order: 2, scoreImpact: 15, testFrequency: 8 },
        { section: "reading" as const, name: "Inference", description: "Drawing conclusions from text", order: 3, scoreImpact: 18, testFrequency: 7 },
        { section: "reading" as const, name: "Vocabulary in Context", description: "Understanding word meanings from context", order: 4, scoreImpact: 12, testFrequency: 6 },
        { section: "reading" as const, name: "Author's Purpose", description: "Understanding why authors write what they write", order: 5, scoreImpact: 15, testFrequency: 5 },
        { section: "reading" as const, name: "Text Structure", description: "Analyzing how texts are organized", order: 6, scoreImpact: 10, testFrequency: 4 },
      ];

      const writingTopics = [
        { section: "writing" as const, name: "Subject-Verb Agreement", description: "Matching subjects with correct verb forms", order: 1, scoreImpact: 18, testFrequency: 8 },
        { section: "writing" as const, name: "Comma Usage", description: "Using commas correctly in various contexts", order: 2, scoreImpact: 15, testFrequency: 9 },
        { section: "writing" as const, name: "Pronoun Agreement", description: "Matching pronouns with their antecedents", order: 3, scoreImpact: 12, testFrequency: 6 },
        { section: "writing" as const, name: "Sentence Structure", description: "Creating clear and effective sentences", order: 4, scoreImpact: 15, testFrequency: 7 },
        { section: "writing" as const, name: "Conciseness", description: "Eliminating wordiness and redundancy", order: 5, scoreImpact: 10, testFrequency: 5 },
        { section: "writing" as const, name: "Transitions", description: "Connecting ideas smoothly between sentences", order: 6, scoreImpact: 12, testFrequency: 6 },
      ];

      const allTopics = [...mathTopics, ...readingTopics, ...writingTopics];
      const createdTopics: any[] = [];
      
      for (const topic of allTopics) {
        const created = await storage.createTopic(topic);
        createdTopics.push(created);
      }

      // Seed questions for the first math topic (Linear Equations)
      const linearEquationsTopic = createdTopics.find(t => t.name === "Linear Equations");
      if (linearEquationsTopic) {
        const questions = [
          {
            topicId: linearEquationsTopic.id,
            questionText: "Solve for x: 2x + 5 = 13",
            questionType: "multiple_choice",
            options: ["x = 4", "x = 9", "x = 3", "x = 6"],
            correctAnswer: "x = 4",
            explanation: "Subtract 5 from both sides to get 2x = 8, then divide by 2 to get x = 4.",
            difficulty: 1,
            isCapstone: false,
          },
          {
            topicId: linearEquationsTopic.id,
            questionText: "If 3(x - 2) = 15, what is the value of x?",
            questionType: "multiple_choice",
            options: ["x = 5", "x = 7", "x = 3", "x = 11"],
            correctAnswer: "x = 7",
            explanation: "Divide both sides by 3 to get x - 2 = 5, then add 2 to get x = 7.",
            difficulty: 2,
            isCapstone: false,
          },
          {
            topicId: linearEquationsTopic.id,
            questionText: "Solve for y: 4y - 8 = 2y + 6",
            questionType: "multiple_choice",
            options: ["y = 7", "y = 1", "y = -7", "y = 14"],
            correctAnswer: "y = 7",
            explanation: "Subtract 2y from both sides to get 2y - 8 = 6, add 8 to get 2y = 14, divide by 2.",
            difficulty: 2,
            isCapstone: false,
          },
          {
            topicId: linearEquationsTopic.id,
            questionText: "A rectangle has a perimeter of 36 units. If the length is 4 more than twice the width, what is the width?",
            questionType: "multiple_choice",
            options: ["4 units", "6 units", "14/3 units", "5 units"],
            correctAnswer: "14/3 units",
            explanation: "Let w = width. Length = 2w + 4. Perimeter = 2w + 2(2w + 4) = 36. Solving: 6w + 8 = 36, w = 14/3.",
            difficulty: 3,
            isCapstone: true,
          },
        ];

        for (const q of questions) {
          await storage.createQuestion(q);
        }
      }

      res.json({ 
        message: "Seed data created successfully", 
        topics: createdTopics.length,
        sections: {
          math: mathTopics.length,
          reading: readingTopics.length,
          writing: writingTopics.length,
        }
      });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  return httpServer;
}
