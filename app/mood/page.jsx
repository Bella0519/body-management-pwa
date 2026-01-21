"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MoodPage() {
  const [userId, setUserId] = useState(null);
  const [score, setScore] = useState(3);
  const [note, setNote] = useState("");

  const todayLocal = useMemo(() => {
    const d = new Date();
    const taipei = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
    const y = taipei.getFullYear();
    const m = String(taipei.getMonth() + 1).padStart(2, "0");
    const day = String(taipei.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  async function save() {
    if (!userId) return alert("請先登入");
    const { error } = await supabase.from("mood_journals").upsert({
      user_id: userId,
      date_local: todayLocal,
      mood_score: score,
      note: note || null,
    });
    if (error) return alert(error.message);
    alert("已存心情～");
  }

  return (
    <div>
      <a href="/" style={{ textDecoration: "none" }}>← 回首頁</a>
      <h2>😊 心情日記</h2>
      <div style={{ opacity: 0.7 }}>今天：{todayLocal}</div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {[1,2,3,4,5].map((n) => (
          <button
            key={n}
            onClick={() => setScore(n)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 16,
              border: score === n ? "2px solid #ff67b3" : "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 800
            }}
          >
            {["🥲","😐","🙂","😄","🤩"][n-1]}
          </button>
        ))}
      </div>

      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="一句話（可空白）" style={inputStyle} />
      <button onClick={save} style={btnStyle}>存今天心情</button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.12)",
  margin: "14px 0 14px",
  background: "white",
};

const btnStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "none",
  background: "#ffd1e8",
  fontWeight: 800,
};