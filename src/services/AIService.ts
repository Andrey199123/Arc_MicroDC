import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface WebResearchSource {
  index: number;
  title: string;
  url: string;
  searchSnippet: string;
  pageExcerpt?: string;
  score?: number;
  publishedDate?: string;
  fetched: boolean;
}

export interface WebResearchResult {
  query: string;
  provider: string;
  sources: WebResearchSource[];
  renderedContext: string;
  fallbackReason?: string;
}

export class AIService {
  // Actions
  static useSMARTGoalChat() {
    return useAction(api.ai.smartGoalChat);
  }

  static useSMARTGoalChatV2() {
    return useAction(api.ai.smartGoalChatV2);
  }

  static useValidateSMARTGoal() {
    return useAction(api.ai.validateSMARTGoal);
  }

  static useWebResearch() {
    return useAction(api.webResearch.researchWeb);
  }

  static useGenerateTasksForGoal() {
    return useAction(api.ai.generateTasksForGoal);
  }

  static useGenerateMilestonesForGoal() {
    return useAction(api.goalBreakdownEngine.generateMilestonesForGoal);
  }

  static useGenerateWeeklyTasksForMilestone() {
    return useAction(api.goalBreakdownEngine.generateWeeklyTasksForMilestone);
  }
}
