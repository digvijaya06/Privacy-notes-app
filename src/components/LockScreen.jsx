import React, { useState } from "react";
import { Lock, Eye, EyeOff, TimerReset } from "lucide-react";

export default function LockScreen({ 
  hasVault, 
  onUnlock, 
  password, 
  setPassword, 
  confirmPw, 
  setConfirmPw 
}) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <div className="bg-gradient-to-r from-yellow-400 to-pink-500 h-1 rounded-t-xl mb-6"></div>

        <div className="flex items-center gap-3 mb-2">
          <Lock className="text-yellow-400" size={28} />
          <h1 className="text-2xl font-bold">
            {hasVault ? "Unlock Vault" : "Create Vault"}
          </h1>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {hasVault
            ? "Enter your master password to decrypt your notes."
            : "Set a master password. Keep it safe — without it, notes cannot be recovered."}
        </p>

        <label className="block text-sm mb-2">Master password</label>
        <div className="relative mb-4">
          <input
            type={showPw ? "text" : "password"}
            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={hasVault ? "Enter password" : "Create a strong password"}
          />
          <button
            className="absolute right-3 top-2.5 text-gray-300 hover:text-gray-100"
            onClick={() => setShowPw((s) => !s)}
            title={showPw ? "Hide" : "Show"}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {!hasVault && (
          <>
            <label className="block text-sm mb-2">Confirm password</label>
            <input
              type={showPw ? "text" : "password"}
              className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Re-enter password"
            />
          </>
        )}

        <button
          onClick={onUnlock}
          className="w-full px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition"
        >
          {hasVault ? "Unlock" : "Create & Unlock"}
        </button>

        {hasVault && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
            <TimerReset size={14} />
            <span>Auto-lock after 5 minutes of inactivity.</span>
          </div>
        )}
      </div>
    </div>
  );
}
