import React, { useState } from "react";
import { Lock, Eye, EyeOff, TimerReset } from "lucide-react";

export default function LockScreen({
  onUnlock,
  password,
  setPassword,
  confirmPw,
  setConfirmPw,
  isNewUser = false   // ✅ pass this prop from App.jsx (true when no password set yet)
}) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <div className="bg-gradient-to-r from-yellow-400 to-pink-500 h-1 rounded-t-xl mb-6"></div>

        <div className="flex items-center gap-3 mb-4">
          <Lock className="text-yellow-400" size={28} />
          <h2 className="text-lg font-semibold">
            {isNewUser ? "Create Master Password" : "Enter Master Password"}
          </h2>
        </div>

        {/* Password Field */}
        <label className="block text-sm mb-2">Master password</label>
        <div className="relative mb-4">
          <input
            type={showPw ? "text" : "password"}
            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isNewUser ? "Create a strong password" : "Enter password"}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-300 hover:text-gray-100"
            onClick={() => setShowPw((s) => !s)}
            title={showPw ? "Hide" : "Show"}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password only if new user */}
        {isNewUser && (
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

        {/* Unlock / Create Button */}
        <button
          onClick={onUnlock}
          className="w-full px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition"
        >
          {isNewUser ? "Create & Unlock" : "Unlock"}
        </button>

        {!isNewUser && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
            <TimerReset size={14} />
            <span>Auto-lock after 5 minutes of inactivity.</span>
          </div>
        )}
      </div>
    </div>
  );
}
