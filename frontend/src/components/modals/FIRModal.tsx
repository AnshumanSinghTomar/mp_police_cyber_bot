import { useState } from "react"

interface Props {
  onClose: () => void
}

export default function FIRModal({ onClose }: Props) {

  const [name, setName] = useState("")
  const [incident, setIncident] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async () => {

    if (loading) return

    if (!name || !incident || !date) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/generate-fir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          incident,
          date
        })
      })

      if (!res.ok) {
        throw new Error("Server error")
      }

      const data = await res.json()

      alert("✅ FIR Generated Successfully: " + data.file)

      onClose()

    } catch (err) {

      console.error(err)

      alert("❌ FIR generation failed. Check backend server.")

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">

      <div className="bg-slate-900 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] p-6 rounded-2xl w-[440px]">

        <h2 className="text-xl text-cyan-400 font-semibold mb-4 flex items-center gap-2">
          🚔 FIR
        </h2>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 mb-3 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-cyan-500"
          placeholder="Full Name"
        />

        <textarea
          value={incident}
          onChange={e => setIncident(e.target.value)}
          className="w-full p-2 mb-3 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-cyan-500"
          placeholder="Describe Incident"
          rows={4}
        />

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full p-2 mb-3 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-cyan-500"
        />

        <div className="flex justify-end gap-3 mt-4">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate FIR"}
          </button>

        </div>

      </div>
    </div>
  )
}
