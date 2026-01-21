"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MealPage() {
  const [userId, setUserId] = useState(null);
  const [mealType, setMealType] = useState("DINNER");
  const [portion, setPortion] = useState(1.0);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  async function save() {
    if (!userId) return alert("請先登入");
    const occurredAt = new Date().toISOString();

    let photoUrl = null;
    if (file) {
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("meal-photos").upload(path, file, { upsert: false });
      if (upErr) return alert(upErr.message);
      const { data } = supabase.storage.from("meal-photos").getPublicUrl(path);
      photoUrl = data.publicUrl;
    }

    const { error } = await supabase.from("meal_entries").insert({
      user_id: userId,
      occurred_at: occurredAt,
      meal_type: mealType,
      portion_factor: portion,
      photo_url: photoUrl,
      is_estimated: true,
      note,
    });
    if (error) return alert(error.message);
    alert("已存餐點～");
    setFile(null);
    setNote("");
  }

  return (
    <div>
      <a href="/" style={{ textDecoration: "none" }}>← 回首頁</a>
      <h2>📸 飲食拍照</h2>

      <label>餐別</label>
      <select value={mealType} onChange={(e) => setMealType(e.target.value)} style={inputStyle}>
        <option value="BREAKFAST">早餐</option>
        <option value="LUNCH">午餐</option>
        <option value="DINNER">晚餐</option>
        <option value="SNACK">點心</option>
      </select>

      <label>份量</label>
      <select value={portion} onChange={(e) => setPortion(Number(e.target.value))} style={inputStyle}>
        <option value={0.5}>少量(0.5x)</option>
        <option value={1.0}>正常(1x)</option>
        <option value={1.5}>偏多(1.5x)</option>
      </select>

      <label>照片（可選）</label>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={inputStyle} />

      <label>備註（可選）</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：超商/外送/家裡" style={inputStyle} />

      <button onClick={save} style={btnStyle}>存餐點</button>
      <p style={{ opacity: 0.7, lineHeight: 1.4 }}>
        下一版我會把「照片 → 熱量/蛋白質估算」接上，先把資料與照片累積起來最重要。
      </p>
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