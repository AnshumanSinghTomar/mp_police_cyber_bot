import { useState } from "react"
import Sidebar from "./components/Sidebar"
import ChatBox from "./components/ChatBox"
import FIRModal from "./components/modals/FIRModal"
import SafetyTips from "./components/modals/SafetyTips"
import CyberGrid from "./components/CyberGrid"

export default function App() {

  const [showFIR, setShowFIR] = useState(false)
  const [showTips, setShowTips] = useState(false)

  const openNearby = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords
      window.open(
        `https://www.google.com/maps/search/police+stations/@${latitude},${longitude},15z`,
        "_blank"
      )
    })
  }

  return (
    <div className="h-screen flex bg-slate-950 text-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <CyberGrid />
      </div>

      {/* Sidebar */}
      <Sidebar
        onFIR={() => setShowFIR(true)}
        onTips={() => setShowTips(true)}
        onNearby={openNearby}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col p-6">
        <ChatBox />
      </main>

      {/* Modals */}
      {showFIR && <FIRModal onClose={() => setShowFIR(false)} />}
      {showTips && <SafetyTips onClose={() => setShowTips(false)} />}

    </div>
  )
}
