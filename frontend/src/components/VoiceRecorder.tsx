import { useState } from "react";

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);

  const start = () => {
    try {
      // Demo recording state toggle
      setRecording(true);
      setTimeout(() => setRecording(false), 5000);
    } catch (e) {
      console.warn("Media recorder not supported:", e);
    }
  };

  return (
    <button
      onClick={start}
      className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
    >
      🎙️ {recording ? "Listening..." : "Record Audio Complaint"}
    </button>
  );
}
