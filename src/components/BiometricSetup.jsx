// src/components/BiometricSetup.jsx
import React from "react";

export default function BiometricSetup({ onEnabled }) {
  const enableBiometrics = async () => {
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array([0x8C, 0xFA, 0x12, 0x34]),
          rp: { name: "Privacy Notes" },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "Privacy Notes User"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "none"
        }
      });

      if (!credential) {
        alert("Biometric registration failed");
        return;
      }

      localStorage.setItem(
        "biometricCredential",
        JSON.stringify({ id: credential.id })
      );

      alert("✅ Biometrics enabled!");
      onEnabled();
    } catch (err) {
      console.error("Biometric setup failed", err);
      alert("Biometric setup failed. Check console.");
    }
  };

  return (
    <div className="p-4 mt-4 bg-slate-800 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Enable Biometric Unlock</h3>
      <p className="mb-3 text-gray-300 text-sm">
        Use your device’s fingerprint or face recognition for faster unlock.
      </p>
      <button
        onClick={enableBiometrics}
        className="px-4 py-2 bg-yellow-500 rounded font-semibold hover:bg-yellow-400"
      >
        Enable Biometrics
      </button>
    </div>
  );
}
