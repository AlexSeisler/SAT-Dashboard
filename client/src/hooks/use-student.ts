import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Student, StudentDashboard, TopicWithProgress, RecommendedFocus, Topic, Question, DailyCheckIn } from "@shared/schema";

// Student hooks
export function useCurrentStudent() {
  return useQuery<Student>({
    queryKey: ["/api/students/demo/current"],
  });
}

export function useDashboard(studentId: string | undefined) {
  return useQuery<StudentDashboard>({
    queryKey: ["/api/dashboard", studentId],
    enabled: !!studentId,
  });
}

// Topics hooks
export function useTopics() {
  return useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });
}

export function useTopicsWithProgress(studentId: string | undefined) {
  return useQuery<TopicWithProgress[]>({
    queryKey: ["/api/topics/progress", studentId],
    enabled: !!studentId,
  });
}

export function useTopic(topicId: string | undefined) {
  return useQuery<Topic>({
    queryKey: ["/api/topics", topicId],
    enabled: !!topicId,
  });
}

// Recommendations
export function useRecommendations(studentId: string | undefined) {
  return useQuery<RecommendedFocus[]>({
    queryKey: ["/api/recommendations", studentId],
    enabled: !!studentId,
  });
}

// Questions
export function useTopicQuestions(topicId: string | undefined) {
  return useQuery<Question[]>({
    queryKey: ["/api/questions/topic", topicId],
    enabled: !!topicId,
  });
}

export function useCapstoneQuestion(topicId: string | undefined) {
  return useQuery<Question | null>({
    queryKey: ["/api/questions/capstone", topicId],
    enabled: !!topicId,
  });
}

// Progress mutations
export function useUpdateProgress() {
  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      topicId: string;
      masteryState?: string;
      preAssessmentScore?: number;
      postAssessmentScore?: number;
      capstoneCompleted?: boolean;
      practiceCount?: number;
    }) => {
      const response = await apiRequest("POST", "/api/progress", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics/progress", variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations", variables.studentId] });
    },
  });
}

// Question attempt mutation
export function useRecordAttempt() {
  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      questionId: string;
      selectedAnswer: string;
      isCorrect: boolean;
      errorType?: string;
      timeSpent?: number;
    }) => {
      const response = await apiRequest("POST", "/api/attempts", data);
      return response.json();
    },
  });
}

// Daily check-in
export function useCheckIns(studentId: string | undefined) {
  return useQuery<DailyCheckIn[]>({
    queryKey: ["/api/checkins", studentId],
    enabled: !!studentId,
  });
}

export function useCreateCheckIn() {
  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      studiedTopics?: string[];
      confidenceLevel: number;
      notes?: string;
    }) => {
      const response = await apiRequest("POST", "/api/checkins", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkins", variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", variables.studentId] });
    },
  });
}

// Update student
export function useUpdateStudent() {
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; studyStreak?: number; lastStudyDate?: Date }) => {
      const response = await apiRequest("PATCH", `/api/students/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students/demo/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}
