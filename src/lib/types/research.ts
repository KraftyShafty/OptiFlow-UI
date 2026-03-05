// Research notebook, source, brief, and task types.

import type {
  Citation,
  ResearchTaskStatus,
  ResearchTaskType,
  ResearchTaskTargetType,
  StrategyName,
} from "./common";

export interface ResearchSourceRecord {
  id: string;
  notebook_id: string;
  source_type: string;
  title: string;
  url?: string | null;
  published_at_utc?: string | null;
  source_hash: string;
  summary_excerpt?: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

export interface ResearchChunkRecord {
  chunk_id: string;
  source_id: string;
  source_title: string;
  chunk_index: number;
  text: string;
  score: number;
  token_count: number;
}

export interface ResearchBriefSummaryRecord {
  id: string;
  notebook_id: string;
  version: number;
  supersedes_brief_id?: string | null;
  thesis_summary: string;
  contradiction_summary?: string | null;
  unresolved_questions: string[];
  delta_summary?: string | null;
  source_ids: string[];
  citations: Citation[];
  model_provider: Record<string, unknown>;
  created_at: string;
}

export type ResearchBriefRecord = ResearchBriefSummaryRecord;

export interface ResearchNotebookRecord {
  id: string;
  symbol: string;
  strategy_name?: StrategyName | null;
  event_calendar_item_id?: string | null;
  current_brief_id?: string | null;
  unresolved_questions_summary?: string | null;
  contradiction_summary?: string | null;
  latest_source_bundle_hash?: string | null;
  source_count: number;
  current_brief?: ResearchBriefSummaryRecord | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchNotebookDetailRecord extends ResearchNotebookRecord {
  sources: ResearchSourceRecord[];
}

export interface ResearchTaskEventRecord {
  id?: number | null;
  task_id: string;
  stage: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface ResearchTaskRecord {
  id: string;
  task_type: ResearchTaskType;
  target_type: ResearchTaskTargetType;
  target_id: string;
  status: ResearchTaskStatus;
  requested_by: "local_user" | "system";
  model_provider: string;
  source_ids: string[];
  started_at?: string | null;
  finished_at?: string | null;
  duration_ms?: number | null;
  result_ref_type?: string | null;
  result_ref_id?: string | null;
  result_payload: Record<string, unknown>;
  created_at: string;
}
