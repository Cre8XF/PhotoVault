// ============================================================================
// PAGE: LoginPage.jsx – Firebase Auth med e-post, brukernavn og glemt passord
// ============================================================================
import React, { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";


const LoginPage = ({ onLogin, onRegister, setNotification, colors }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const auth = getAuth();

  // 🔐 Logg inn
  const handleLogin = async () => {
    if (!email || !password) {
      setNotification({
        message: "Fyll inn e-post og passord.",
        type: "error",
      });
      return;
    }
    try {
      const u = await signInWithEmailAndPassword(auth, email, password);
      setNotification({
        message: `Velkommen tilbake, ${u.user.displayName || u.user.email}`,
        type: "success",
      });
      onLogin({ email: u.user.email, uid: u.user.uid, name: u.user.displayName });
    } catch (err) {
      console.error("Login error:", err);
      setNotification({ message: "Feil e-post eller passord.", type: "error" });
    }
  };

  // 🆕 Registrer ny bruker
const handleRegister = async () => {
  if (!email || !password || !username) {
    setNotification({
      message: "Fyll inn e-post, passord og brukernavn.",
      type: "error",
    });
    return;
  }

  try {
    // Opprett ny bruker
    const u = await createUserWithEmailAndPassword(auth, email, password);

    // 👉 Legg til brukernavn (displayName)
    await updateProfile(u.user, { displayName: username });

    // 🔄 Tving Firebase til å oppdatere data lokalt
    await u.user.reload();

    setNotification({
      message: `Bruker opprettet: ${username}`,
      type: "success",
    });

    onRegister({
      email: u.user.email,
      uid: u.user.uid,
      name: username,
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === "auth/email-already-in-use") {
      setNotification({
        message: "E-posten er allerede registrert.",
        type: "error",
      });
    } else if (err.code === "auth/invalid-email") {
      setNotification({ message: "Ugyldig e-postadresse.", type: "error" });
    } else if (err.code === "auth/weak-password") {
      setNotification({
        message: "Passordet må være minst 6 tegn.",
        type: "error",
      });
    } else {
      setNotification({
        message: "Feil ved registrering. Se konsollen for detaljer.",
        type: "error",
      });
    }
  }
};


  // 🔄 Glemt passord
  const handleResetPassword = async () => {
    if (!email) {
      setNotification({
        message: "Skriv inn e-posten din først.",
        type: "error",
      });
      return;
    }
    try {
      setSendingReset(true);
      await sendPasswordResetEmail(auth, email);
      setNotification({
        message: "E-post for tilbakestilling sendt.",
        type: "success",
      });
    } catch (err) {
      console.error("Reset error:", err);
      setNotification({ message: "Kunne ikke sende e-post.", type: "error" });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${colors.bg}`}
    >
      <div className={`w-full max-w-md ${colors.cardBg} ${colors.glass}`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${colors.text}`}>
          Logg inn
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Brukernavn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full p-3 rounded-xl border border-purple-500/50 ${colors.text} ${colors.cardBg.replace(
              "/60",
              "/90"
            )}`}
          />

          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-xl border border-purple-500/50 ${colors.text} ${colors.cardBg.replace(
              "/60",
              "/90"
            )}`}
          />

          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-xl border border-purple-500/50 ${colors.text} ${colors.cardBg.replace(
              "/60",
              "/90"
            )}`}
          />

          <div className="flex space-x-4 pt-2">
            <button
              onClick={handleLogin}
              className={`flex-1 px-4 py-2 rounded-xl ${colors.buttonPrimary} font-semibold`}
            >
              Logg inn
            </button>
            <button
              onClick={handleRegister}
              className={`flex-1 px-4 py-2 rounded-xl ${colors.buttonSecondary} ${colors.textSecondary} font-semibold`}
            >
              Registrer
            </button>
          </div>

          <button
            onClick={handleResetPassword}
            disabled={sendingReset}
            className={`w-full mt-4 text-sm underline ${
              sendingReset
                ? "opacity-60 cursor-not-allowed"
                : colors.textSecondary
            }`}
          >
            {sendingReset ? "Sender e-post …" : "Glemt passord?"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
