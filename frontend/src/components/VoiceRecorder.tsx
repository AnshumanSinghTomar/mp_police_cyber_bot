import { useState } from "react"

export default function VoiceRecorder() {

  const [recording,setRecording]=useState(false)

  const start = () => {
    const rec = new MediaRecorder(
      //@ts-ignore
      new MediaStream()
    )
    setRecording(true)
    setTimeout(()=>setRecording(false),5000)
  }

  return (
    <button
      onClick={start}
      className="bg-purple-600 px-3 py-2 rounded"
    >
      🎙️ {recording ? "Recording..." : "Record Complaint"}
    </button>
  )
}
