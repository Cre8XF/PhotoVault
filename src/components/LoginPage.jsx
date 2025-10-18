import React, { useState } from "react";
import { Camera } from "lucide-react";

const LoginPage = ({ bg, glass, text, textMuted, input, button, onSignIn, onSignUp }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <div className={"animate-fade-in " + glass + " rounded-3xl p-8 w-full max-w-md shadow-2xl"}>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className={button + " p-4 rounded-2xl"}>
            <Camera className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className={"text-4xl font-bold " + text + " mb-2"}>PhotoVault</h1>
        <p className={textMuted}>Your memories, beautifully organized</p>
      </div>

      <div className="space-y-4">
        {isSignUp && (
          <input type="text" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} className={"w-full px-4 py-3 rounded-xl " + input + " border focus:outline-none focus:ring-2 focus:ring-purple-500"} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className={"w-full px-4 py-3 rounded-xl " + input + " border focus:outline-none focus:ring-2 focus:ring-purple-500"} />
        <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className={"w-full px-4 py-3 rounded-xl " + input + " border focus:outline-none focus:ring-2 focus:ring-purple-500"} />
        <button onClick={()=> isSignUp ? onSignUp(email, password, name) : onSignIn(email, password)} className={"w-full " + button + " text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105"}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
        <div className="text-center mt-4">
          <button onClick={()=>setIsSignUp(!isSignUp)} className={textMuted + " hover:text-purple-500 text-sm"}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
