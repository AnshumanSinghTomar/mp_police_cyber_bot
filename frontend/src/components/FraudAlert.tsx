export default function FraudAlert() {

  const alerts = [
    "UPI Refund Scam Active",
    "Fake KYC Calls Increasing",
    "Telegram Job Fraud Detected"
  ]

  return (
    <div className="bg-red-600/20 border-b border-red-500 text-red-400 p-2 text-sm text-center animate-pulse">
      🚨 LIVE ALERT: {alerts[Math.floor(Math.random()*alerts.length)]}
    </div>
  )
}
