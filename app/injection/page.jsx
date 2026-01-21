"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function InjectionPage() {
  const [userId, setUserId] = useState(null);
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0,16));
  const [note, setNote] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  async function save() {
    if (!userId) return alert("請先登入");
    const { error } = await supabase.from("injections").insert({
      user_id: userId,
      occurred_at: new Date(occurredAt).toISOString(),
      drug_name: "週四打針",
      note: note || null,
    });
    if (error) return alert(error.message);
    alert("已存打針～");
    setNote("");
  }

  return (
    <div>
      <a href="/" style={{ textDecoration: "none" }}>← 回首頁</a>
      <h2>💉 打針紀錄</h2>

      <label>時間</label>
      <input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} style={inputStyle} />

      <label>備註（可空）</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：部位/感受" style={inputStyle} />

      <button onClick={save} style={btnStyle}>存本次打針</button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.12)",
  margin: "8px 0 14px",
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