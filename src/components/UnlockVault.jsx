// src/components/UnlockVault.jsx
import React, { useState } from "react";

export default function UnlockVault({ onUnlock }) {
  const [password, setPassword] = useState("");

  const unlockWithPassword = () => {
    if (password.trim() !== "") {
      onUnlock("password"); // tell App it was password unlock
    }
  };

  const unlockWithBiometrics = async () => {
    try {
      const stored = localStorage.getItem("biometricCredential");
      if (!stored) {
        alert("Biometric not set up yet!");
        return;
      }

      const credentialRequestOptions = {
        publicKey: {
          challenge: new Uint8Array([0x8C, 0xFA, 0x12]), // demo challenge
          allowCredentials: [
            {
              id: Uint8Array.from(
                atob(JSON.parse(stored).id.replace(/_/g, "/").replace(/-/g, "+")),
                (c) => c.charCodeAt(0)
              ),
              type: "public-key"
            }
          ],
          userVerification: "required",
        },
      };

      const assertion = await navigator.credentials.get(credentialRequestOptions);

      if (assertion) {
        onUnlock("biometric"); // unlock using fingerprint/face
      }
    } catch (err) {
      console.error("Biometric unlock failed", err);
      alert("Biometric unlock failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 rounded-2xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">🔐 Unlock Vault</h2>

      <input
        type="password"
        placeholder="Enter master password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 mb-4 rounded bg-slate-800 border border-slate-700"
      />

      <button
        onClick={unlockWithPassword}
        className="w-full p-3 bg-yellow-500 rounded font-semibold hover:bg-yellow-400"
      >
        Unlock
      </button>

      <div className="my-3 text-gray-400">or</div>

      <button
        onClick={unlockWithBiometrics}
        className="w-full p-3 bg-blue-500 rounded font-semibold hover:bg-blue-400"
      >
        Unlock with Biometrics
      </button>
    </div>
  );
}
