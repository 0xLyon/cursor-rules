import type { RuleWithActionsAndCategories } from "@/utils/types";
import type { Category, GroupItem, RuleType } from "@prisma/client";

export type StaticMatch = {
  type: Extract<RuleType, "STATIC">;
};

export type GroupMatch = {
  type: Extract<RuleType, "GROUP">;
  groupItem: Pick<GroupItem, "id" | "type" | "value">;
};

export type CategoryMatch = {
  type: Extract<RuleType, "CATEGORY">;
  category: Pick<Category, "id" | "name">;
};

export type AiMatch = {
  type: Extract<RuleType, "AI">;
};

export type MatchReason = StaticMatch | GroupMatch | CategoryMatch | AiMatch;

export type MatchingRuleResult = {
  match?: RuleWithActionsAndCategories;
  matchReasons?: MatchReason[];
  potentialMatches?: (RuleWithActionsAndCategories & {
    instructions: string;
  })[];
};
