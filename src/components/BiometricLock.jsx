import React from "react";

export default function BiometricLock({ onUnlock }) {
  const handleUnlock = async () => {
    if (window.PublicKeyCredential) {
      try {
        // Try WebAuthn / biometric prompt
        await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array([0x8, 0x3, 0x2]), // demo
            timeout: 60000,
            userVerification: "preferred",
          },
        });
        onUnlock(); // success
      } catch (err) {
        alert("Biometric auth failed: " + err.message);
      }
    } else {
      alert("Biometric not supported in this browser.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="p-8 rounded-2xl bg-gray-800 text-center space-y-4 shadow-xl">
        <h1 className="text-2xl font-bold">🔒 Privacy Notes Locked</h1>
        <p className="text-gray-400">Authenticate to continue</p>
        <button
          onClick={handleUnlock}
          className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400"
        >
          Unlock with Biometrics
        </button>
      </div>
    </div>
  );
}
