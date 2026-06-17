export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MetaMediaResponse {
  id: string;
}

export interface MetaPublishResponse {
  id: string;
}

export interface MetaErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export interface InstagramConfigData {
  id: string;
  instagramBusinessId: string;
  pageAccessToken: string;
  systemTokenStatus: string;
  promptSettings: string;
  scheduleHour: number;
  lastPostedAt: string | null;
  isActive: boolean;
}

export interface PostLogData {
  id: string;
  topicTitle: string;
  captionGenerated: string | null;
  imageUrl: string | null;
  status: string;
  errorMessage: string | null;
  postedAt: string;
}

export interface DashboardData {
  config: InstagramConfigData | null;
  recentLogs: PostLogData[];
}
