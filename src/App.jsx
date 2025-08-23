import React, { useEffect, useRef, useState } from "react";
import LockScreen from "./components/LockScreen";
import UnlockedScreen from "./components/UnlockedScreen";
import {
  STORAGE_KEY,
  AUTO_LOCK_MS,
  encryptJson,
  decryptJson,
} from "./utils/crypto";

const BIOMETRIC_KEY = "privacy-notes-biometric";

export default function App() {
  // LOCK STATE
  const [locked, setLocked] = useState(true);
  const [hasVault, setHasVault] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const activityHandler = () => (lastActivityRef.current = Date.now());

  useEffect(() => {
    const payload = localStorage.getItem(STORAGE_KEY);
    setHasVault(!!payload);
  }, []);

  useEffect(() => {
    if (!locked) {
      const id = setInterval(() => {
        if (Date.now() - lastActivityRef.current > AUTO_LOCK_MS) {
          handleLock();
        }
      }, 5_000);
      const handlers = ["mousemove", "keydown", "click", "scroll", "touchstart"];
      handlers.forEach((evt) => window.addEventListener(evt, activityHandler));

      return () => {
        clearInterval(id);
        handlers.forEach((evt) =>
          window.removeEventListener(evt, activityHandler)
        );
      };
    }
  }, [locked]);

  const handleUnlock = async () => {
    try {
      const payloadStr = localStorage.getItem(STORAGE_KEY);

      // First-time setup: no vault yet -> create it with empty notes
      if (!payloadStr) {
        // Sample password for testing
        const samplePassword = "TestPassword123";
        const sampleConfirmPw = "TestPassword123";

        if (samplePassword.length < 6) {
          alert("Master password must be at least 6 characters.");
          return;
        }
        if (samplePassword !== sampleConfirmPw) {
          alert("Passwords do not match.");
          return;
        }
        const encrypted = await encryptJson([], password);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
        setNotes([]);
        setLocked(false);
        setHasVault(true);
        lastActivityRef.current = Date.now();
        setConfirmPw("");

        // ✅ Offer biometric enrollment after first unlock
        setupBiometric(password);

        return;
      }

      // Existing vault -> try decrypt with entered password
      const payload = JSON.parse(payloadStr);
      const decrypted = await decryptJson(payload, password);
      setNotes(Array.isArray(decrypted) ? decrypted : []);
      setLocked(false);
      lastActivityRef.current = Date.now();

      // ✅ Refresh biometric credential
      setupBiometric(password);
    } catch (e) {
      console.error(e);
      alert("Invalid password or corrupted vault.");
    }
  };

  const handleLock = () => {
    setNotes([]);
    setInput("");
    setTags("");
    setSearch("");
    setShowArchived(false);
    setLocked(true);
    setPassword("");
    setConfirmPw("");
  };

  const exportBackup = () => {
    const payloadStr = localStorage.getItem(STORAGE_KEY);
    if (!payloadStr) return alert("No vault to export.");
    const blob = new Blob([payloadStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "privacy-notes-encrypted.json",
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj.ciphertext || !obj.iv || !obj.salt) {
          alert("Invalid backup file.");
          return;
        }
        localStorage.setItem(STORAGE_KEY, reader.result);
        alert("Backup imported. App will lock — unlock with its password.");
        handleLock();
        setHasVault(true);
      } catch {
        alert("Failed to import backup.");
      }
    };
    reader.readAsText(file);
  };

  // ---------- BIOMETRIC HELPERS ----------

  async function setupBiometric(masterPw) {
    if (!window.PublicKeyCredential) return; // not supported

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Privacy Notes" },
          user: {
            id: new Uint8Array([1, 2, 3, 4]),
            name: "user@example.com",
            displayName: "Privacy Notes User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { userVerification: "required" },
          timeout: 60000,
          attestation: "direct",
        },
      });

      if (cred) {
        localStorage.setItem(BIOMETRIC_KEY, masterPw);
        console.log("Biometric credential stored.");
      }
    } catch (err) {
      console.warn("Biometric setup failed", err);
    }
  }

  async function biometricUnlock() {
    if (!window.PublicKeyCredential) {
      alert("Biometrics not supported.");
      return;
    }
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
        },
      });

      if (assertion) {
        const savedPw = localStorage.getItem(BIOMETRIC_KEY);
        if (!savedPw) {
          alert("No biometric password stored. Unlock once with password first.");
          return;
        }
        setPassword(savedPw);
        await handleUnlock();
      }
    } catch (err) {
      console.warn("Biometric unlock failed", err);
    }
  }

  if (locked) {
    return (
      <LockScreen
        hasVault={hasVault}
        onUnlock={handleUnlock}
        onBiometric={biometricUnlock}   // ✅ Added
        password={password}
        setPassword={setPassword}
        confirmPw={confirmPw}
        setConfirmPw={setConfirmPw}
      />
    );
  }

  return (
    <UnlockedScreen
      notes={notes}
      setNotes={setNotes}
      input={input}
      setInput={setInput}
      tags={tags}
      setTags={setTags}
      search={search}
      setSearch={setSearch}
      showArchived={showArchived}
      setShowArchived={setShowArchived}
      onLock={handleLock}
      onExportBackup={exportBackup}
      onImportBackup={importBackup}
    />
  );
}
