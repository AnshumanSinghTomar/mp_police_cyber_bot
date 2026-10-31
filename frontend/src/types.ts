export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  threat?: string
  level?: "LOW" | "MEDIUM" | "HIGH"
  canAutoFIR?: boolean
  userMsg?: string
  firFile?: string
  actions?: string[]
}

export interface Complaint {
  id: string
  text: string
  timestamp: string
}

export interface ChatResponse {
  reply: string
  fir?: string
}
