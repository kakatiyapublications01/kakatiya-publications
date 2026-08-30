export interface LiveSessionPayload {
  sessionId: string;
  page?: string;
  visitorId?: string | null;
}

export interface LiveSessionDoc {
  sessionId: string;
  lastSeenAt: string; // ISO 8601
  createdAt: string;  // ISO 8601
  page: string;
  visitorId?: string | null;
}

export interface LiveSessionResponse {
  success: boolean;
  count: number;
}
