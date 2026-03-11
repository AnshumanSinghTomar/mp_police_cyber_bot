export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
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
