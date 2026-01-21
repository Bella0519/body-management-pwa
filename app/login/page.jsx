"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function sendLink() {
    setErr("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div>
      <h2 style={{ marginTop: 8 }}>登入</h2>
      <p style={{ opacity: 0.7, lineHeight: 1.4 }}>
        輸入 Email，我會寄一封登入連結給你（免密碼）。
      </p>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={inputStyle}
      />
      <button onClick={sendLink} style={btnStyle}>寄登入連結</button>

      {sent && <p style={{ color: "#b1005a" }}>已寄出！去信箱點連結登入～</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.12)",
  outline: "none",
  marginBottom: 10,
  background: "white",
};

const btnStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "none",
  background: "#ffd1e8",
  fontWeight: 700,
};