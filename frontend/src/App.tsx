import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import FIRModal from "./components/modals/FIRModal";
import SafetyTips from "./components/modals/SafetyTips";
import EmailPhishingModal from "./components/modals/EmailPhishingModal";
import ThreatRadarModal from "./components/modals/ThreatRadarModal";
import URLScannerModal from "./components/modals/URLScannerModal";
import UPIScannerModal from "./components/modals/UPIScannerModal";
import DigitalArrestModal from "./components/modals/DigitalArrestModal";
import LegalSectionsModal from "./components/modals/LegalSectionsModal";
import BreachCheckerModal from "./components/modals/BreachCheckerModal";
import EmergencySOSModal from "./components/modals/EmergencySOSModal";
import CyberGrid from "./components/CyberGrid";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute, { PublicRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

export type Lang = "en" | "hi";

function MainApp() {
  const [showFIR, setShowFIR] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showURL, setShowURL] = useState(false);
  const [showUPI, setShowUPI] = useState(false);
  const [showDigitalArrest, setShowDigitalArrest] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showBreach, setShowBreach] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const openNearby = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        window.open(
          `https://www.google.com/maps/search/cyber+police+stations/@${pos.coords.latitude},${pos.coords.longitude},14z`,
          "_blank"
        ),
      () => window.open("https://www.google.com/maps/search/cyber+police+stations+near+me", "_blank")
    );
  };

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden transition-colors duration-500 ${
        isMatrixMode ? "bg-black text-green-400 font-mono" : "bg-slate-950 text-white"
      }`}
    >
      {/* Background Matrix/Cyber Grid */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-80">
        <CyberGrid />
      </div>

      {/* Top Tactical Command Bar */}
      <Header
        onSOS={() => setShowSOS(true)}
        lang={lang}
        onLangToggle={() => setLang((l) => (l === "en" ? "hi" : "en"))}
        isMatrixMode={isMatrixMode}
        onToggleMatrix={() => setIsMatrixMode((m) => !m)}
      />

      {/* Main Body */}
      <div className="flex flex-1 min-h-0">
        <Sidebar
          onFIR={() => setShowFIR(true)}
          onTips={() => setShowTips(true)}
          onNearby={openNearby}
          onEmailCheck={() => setShowEmail(true)}
          onThreatRadar={() => setShowRadar(true)}
          onURLScan={() => setShowURL(true)}
          onUPIScan={() => setShowUPI(true)}
          onDigitalArrest={() => setShowDigitalArrest(true)}
          onLegalSections={() => setShowLegal(true)}
          onBreachCheck={() => setShowBreach(true)}
          onSOS={() => setShowSOS(true)}
          lang={lang}
        />

        <main className="flex-1 flex flex-col p-3 min-h-0">
          <ChatBox
            lang={lang}
            isMatrixMode={isMatrixMode}
            onOpenLegal={() => setShowLegal(true)}
            onOpenURL={() => setShowURL(true)}
          />
        </main>
      </div>

      {/* Modals Arsenal */}
      {showFIR && <FIRModal onClose={() => setShowFIR(false)} />}
      {showTips && <SafetyTips onClose={() => setShowTips(false)} />}
      {showEmail && <EmailPhishingModal onClose={() => setShowEmail(false)} lang={lang} />}
      {showRadar && <ThreatRadarModal onClose={() => setShowRadar(false)} />}
      {showURL && <URLScannerModal onClose={() => setShowURL(false)} />}
      {showUPI && <UPIScannerModal onClose={() => setShowUPI(false)} />}
      {showDigitalArrest && <DigitalArrestModal onClose={() => setShowDigitalArrest(false)} />}
      {showLegal && <LegalSectionsModal onClose={() => setShowLegal(false)} />}
      {showBreach && <BreachCheckerModal onClose={() => setShowBreach(false)} />}
      {showSOS && <EmergencySOSModal onClose={() => setShowSOS(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
