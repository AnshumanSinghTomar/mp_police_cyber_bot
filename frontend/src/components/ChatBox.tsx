import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import type { Message } from "../types"
import RiskMeter from "./RiskMeter"

export default function ChatBox() {

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const [riskScore, setRiskScore] = useState(0)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const calculateRisk = (text: string) => {

    let score = 10

    const lower = text.toLowerCase()

    if (lower.includes("otp")) score = 85
    else if (lower.includes("bank")) score = 70
    else if (lower.includes("hack")) score = 90
    else if (lower.includes("scam")) score = 80
    else if (lower.includes("fraud")) score = 75
    else if (lower.includes("upi")) score = 60

    setRiskScore(score)
  }

  const sendMessage = async () => {

    if (!input.trim()) return

    calculateRisk(input)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      })

      const data = await res.json()

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "No response"
      }

      setMessages(prev => [...prev, botMsg])

    } catch {

      setMessages(prev => [
        ...prev,
        {
          id: "error",
          role: "assistant",
          content: "⚠️ Backend connection failed."
        }
      ])
    }

    setLoading(false)
  }

  return (

    <div className="flex flex-col h-full bg-cyber-primary rounded-2xl p-4 shadow-lg">

      {/* Risk Meter */}
      <div className="mb-3">
        <RiskMeter score={riskScore} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-3 rounded-xl max-w-[75%] ${
              msg.role === "user"
                ? "chat-user ml-auto"
                : "chat-ai"
            }`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}

        {loading && (
          <div className="bg-gray-700 p-3 rounded-xl w-fit">
            <div className="flex gap-2">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-2 rounded-lg bg-gray-800 outline-none"
          placeholder="Describe cyber complaint..."
        />

        <button
          onClick={sendMessage}
          className="bg-cyber-accent px-4 rounded-lg"
        >
          Send
        </button>
      </div>

    </div>
  )
}