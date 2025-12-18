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
      // Check if topics already exist - allow re-seeding by clearing first
      const existingTopics = await storage.getAllTopics();
      if (existingTopics.length > 0) {
        // Clear existing topics and related data for fresh seed
        // Note: This will cascade delete related questions, progress, etc.
        const { db } = await import("./db");
        const { topics, questions, studentTopicProgress } = await import("@shared/schema");
        
        // Delete in order to respect foreign key constraints
        await db.delete(studentTopicProgress);
        await db.delete(questions);
        await db.delete(topics);
      }

      // Seed topics
      const mathTopics = [
        // Heart of Algebra
        { section: "math" as const, name: "Variables and Constants", description: "Differentiates changing quantities from fixed values", order: 1, scoreImpact: 20, testFrequency: 10 },
        { section: "math" as const, name: "Linear Equations and Expressions", description: "Solves and interprets linear relationships", order: 2, scoreImpact: 25, testFrequency: 12 },
        { section: "math" as const, name: "Coordinate Plane", description: "Graphs points, lines, and functions", order: 3, scoreImpact: 18, testFrequency: 8 },
        { section: "math" as const, name: "Slope and Intercepts", description: "Analyzes rate of change and starting values", order: 4, scoreImpact: 20, testFrequency: 9 },
        { section: "math" as const, name: "Linear Inequalities", description: "Solves and graphs inequality relationships", order: 5, scoreImpact: 15, testFrequency: 7 },
        { section: "math" as const, name: "Solution Sets", description: "Identifies values that satisfy equations or inequalities", order: 6, scoreImpact: 16, testFrequency: 8 },
        { section: "math" as const, name: "Constraints", description: "Applies real-world limits to mathematical models", order: 7, scoreImpact: 12, testFrequency: 5 },
        { section: "math" as const, name: "Systems of Linear Equations", description: "Solves using elimination, substitution, or graphing", order: 8, scoreImpact: 22, testFrequency: 10 },
        
        // Problem Solving and Data Analysis
        { section: "math" as const, name: "Ratios and Proportions", description: "Compares quantities and parts to wholes", order: 9, scoreImpact: 18, testFrequency: 9 },
        { section: "math" as const, name: "Percentages", description: "Converts and interprets percent relationships", order: 10, scoreImpact: 20, testFrequency: 10 },
        { section: "math" as const, name: "Data Interpretation", description: "Reads tables, graphs, and charts", order: 11, scoreImpact: 15, testFrequency: 8 },
        { section: "math" as const, name: "Confidence Intervals", description: "Understands estimation accuracy and margin of error", order: 12, scoreImpact: 10, testFrequency: 4 },
        { section: "math" as const, name: "Simple and Compound Interest", description: "Calculates interest over time", order: 13, scoreImpact: 12, testFrequency: 5 },
        
        // Passport to Advanced Math
        { section: "math" as const, name: "Function Notation", description: "Works with inputs, outputs, and functional relationships", order: 14, scoreImpact: 18, testFrequency: 8 },
        { section: "math" as const, name: "Quadratic Equations", description: "Solves using factoring and completing the square", order: 15, scoreImpact: 22, testFrequency: 9 },
        { section: "math" as const, name: "Polynomial Analysis", description: "Interprets higher-level algebraic expressions", order: 16, scoreImpact: 15, testFrequency: 6 },
        { section: "math" as const, name: "Functions in Context", description: "Applies equations to real-world scenarios", order: 17, scoreImpact: 20, testFrequency: 8 },
      ];

      const readingTopics = [
        // Test Structure
        { section: "reading" as const, name: "Test Structure and Adaptive Format", description: "Explains the two-module adaptive design and timing of the Reading and Writing section", order: 1, scoreImpact: 5, testFrequency: 1 },
        
        // Craft and Structure
        { section: "reading" as const, name: "Vocabulary in Context", description: "Tests understanding word meaning based on surrounding text clues", order: 2, scoreImpact: 18, testFrequency: 10 },
        { section: "reading" as const, name: "High-Utility Words", description: "Emphasizes commonly used academic and functional vocabulary", order: 3, scoreImpact: 15, testFrequency: 8 },
        { section: "reading" as const, name: "Text Structure", description: "Evaluates how passages are organized (cause-effect, compare-contrast, etc.)", order: 4, scoreImpact: 12, testFrequency: 7 },
        { section: "reading" as const, name: "Author's Purpose and Tone", description: "Identifies why an author wrote a passage and how language reflects intent", order: 5, scoreImpact: 20, testFrequency: 9 },
        
        // Reading Comprehension
        { section: "reading" as const, name: "Basic Reading Comprehension", description: "Assesses understanding of explicitly stated ideas", order: 6, scoreImpact: 22, testFrequency: 12 },
        { section: "reading" as const, name: "Higher-Level Comprehension", description: "Requires analysis, synthesis, and reasoning beyond surface details", order: 7, scoreImpact: 25, testFrequency: 11 },
        { section: "reading" as const, name: "Central Ideas", description: "Focuses on identifying and supporting a passage's main point", order: 8, scoreImpact: 23, testFrequency: 10 },
        { section: "reading" as const, name: "Details and Evidence", description: "Requires selecting the most relevant and convincing support", order: 9, scoreImpact: 20, testFrequency: 9 },
        { section: "reading" as const, name: "Inferences", description: "Draws logical conclusions from implied information", order: 10, scoreImpact: 22, testFrequency: 10 },
        { section: "reading" as const, name: "Comparing Two Texts", description: "Analyzes similarities, differences, and responses between paired passages", order: 11, scoreImpact: 15, testFrequency: 6 },
        { section: "reading" as const, name: "Informational Graphics", description: "Interprets tables, charts, and graphs alongside text", order: 12, scoreImpact: 12, testFrequency: 5 },
      ];

      const writingTopics = [
        // Writing: Effective Presentation
        { section: "writing" as const, name: "Word Choice and Precision", description: "Tests selecting the most accurate and appropriate words", order: 1, scoreImpact: 18, testFrequency: 9 },
        { section: "writing" as const, name: "Concision", description: "Focuses on eliminating redundancy and unnecessary language", order: 2, scoreImpact: 20, testFrequency: 10 },
        { section: "writing" as const, name: "Style and Tone Consistency", description: "Ensures language matches the passage's overall formality and intent", order: 3, scoreImpact: 15, testFrequency: 7 },
        { section: "writing" as const, name: "Author's Goals", description: "Aligns structure and details with the writer's purpose", order: 4, scoreImpact: 16, testFrequency: 8 },
        { section: "writing" as const, name: "Flow and Coherence", description: "Improves readability and logical progression of ideas", order: 5, scoreImpact: 18, testFrequency: 8 },
        { section: "writing" as const, name: "Syntax", description: "Evaluates sentence structure and clarity", order: 6, scoreImpact: 20, testFrequency: 9 },
        { section: "writing" as const, name: "Organization", description: "Assesses logical sequencing, introductions, transitions, and conclusions", order: 7, scoreImpact: 22, testFrequency: 10 },
        { section: "writing" as const, name: "Development and Support", description: "Ensures claims are clearly stated and well supported", order: 8, scoreImpact: 20, testFrequency: 9 },
        { section: "writing" as const, name: "Transitions", description: "Uses words and phrases to guide readers between ideas", order: 9, scoreImpact: 18, testFrequency: 8 },
        
        // Writing: Standard English Conventions
        { section: "writing" as const, name: "Sentence Structure", description: "Covers fragments, run-ons, modifiers, and parallelism", order: 10, scoreImpact: 25, testFrequency: 12 },
        { section: "writing" as const, name: "Verb Tense and Consistency", description: "Ensures grammatical alignment throughout passages", order: 11, scoreImpact: 20, testFrequency: 10 },
        { section: "writing" as const, name: "Pronoun Clarity and Agreement", description: "Tests correct reference, number, and point of view", order: 12, scoreImpact: 22, testFrequency: 11 },
        { section: "writing" as const, name: "Frequently Confused Words", description: "Distinguishes commonly misused word pairs", order: 13, scoreImpact: 15, testFrequency: 7 },
        { section: "writing" as const, name: "Logical Comparisons", description: "Ensures valid and meaningful comparisons", order: 14, scoreImpact: 12, testFrequency: 6 },
        { section: "writing" as const, name: "Punctuation Rules", description: "Covers commas, semicolons, colons, dashes, quotation marks, and parentheses", order: 15, scoreImpact: 23, testFrequency: 11 },
        { section: "writing" as const, name: "Possessives", description: "Tests correct use of apostrophes in nouns and pronouns", order: 16, scoreImpact: 15, testFrequency: 7 },
        
        // Essay-related topics (mapped to writing section)
        { section: "writing" as const, name: "Essay Overview", description: "Explains the purpose, format, timing, and expectations of the SAT argumentative analysis essay", order: 17, scoreImpact: 8, testFrequency: 2 },
        { section: "writing" as const, name: "Essay Scoring Criteria", description: "Describes how essays are scored across Reading, Analysis, and Writing dimensions", order: 18, scoreImpact: 8, testFrequency: 2 },
        { section: "writing" as const, name: "Reading for the Essay", description: "Focuses on understanding the author's argument, evidence, and reasoning", order: 19, scoreImpact: 10, testFrequency: 3 },
        { section: "writing" as const, name: "Analysis Skills", description: "Emphasizes evaluating how an author builds an argument using evidence, logic, and rhetorical techniques", order: 20, scoreImpact: 12, testFrequency: 4 },
        { section: "writing" as const, name: "Writing Quality", description: "Covers organization, clarity, grammar, and adherence to formal Standard Written English", order: 21, scoreImpact: 15, testFrequency: 5 },
        { section: "writing" as const, name: "Use of Evidence", description: "Teaches how to identify, explain, and evaluate evidence used to support an argument", order: 22, scoreImpact: 12, testFrequency: 4 },
        { section: "writing" as const, name: "Reasoning and Logic", description: "Examines assumptions, conclusions, and the logical strength of arguments", order: 23, scoreImpact: 15, testFrequency: 5 },
        { section: "writing" as const, name: "Style and Persuasion", description: "Analyzes rhetorical choices such as repetition, structure, and tone", order: 24, scoreImpact: 12, testFrequency: 4 },
        { section: "writing" as const, name: "Objective Writing", description: "Reinforces writing without personal opinion, relying only on the given passage", order: 25, scoreImpact: 10, testFrequency: 3 },
      ];

      const allTopics = [...mathTopics, ...readingTopics, ...writingTopics];
      const createdTopics: any[] = [];
      
      for (const topic of allTopics) {
        const created = await storage.createTopic(topic);
        createdTopics.push(created);
      }

      // Seed questions for the first math topic (Linear Equations and Expressions)
      const linearEquationsTopic = createdTopics.find(t => t.name === "Linear Equations and Expressions");
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
