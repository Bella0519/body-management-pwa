"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function InbodyPage() {
  const [userId, setUserId] = useState(null);

  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0,16)); // yyyy-mm-ddThh:mm
  const [weight, setWeight] = useState("");
  const [pbf, setPbf] = useState("");
  const [smm, setSmm] = useState("");
  const [bmr, setBmr] = useState("");
  const [vfl, setVfl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  function conditionFromTime(isoLocal) {
    // 粗判：06:00~11:00 叫 FASTED_AM，其它 MAKEUP_PM
    const dt = new Date(isoLocal);
    const h = dt.getHours();
    if (h >= 6 && h <= 11) return "FASTED_AM";
    return "MAKEUP_PM";
  }

  async function save() {
    if (!userId) return alert("請先登入");
    const dt = new Date(occurredAt).toISOString();
    const measured_condition = conditionFromTime(occurredAt);

    const { error } = await supabase.from("inbody_records").insert({
      user_id: userId,
      occurred_at: dt,
      measured_condition,
      weight_kg: weight ? Number(weight) : null,
      pbf_percent: pbf ? Number(pbf) : null,
      smm_kg: smm ? Number(smm) : null,
      bmr_kcal: bmr ? Number(bmr) : null,
      vfl: vfl ? Number(vfl) : null
    });
    if (error) return alert(error.message);
    alert("已存 InBody～");
  }

  return (
    <div>
      <a href="/" style={{ textDecoration: "none" }}>← 回首頁</a>
      <h2>📊 InBody</h2>

      <label>量測時間（可下午補登記）</label>
      <input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} style={inputStyle} />

      <label>體重 kg</label>
      <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" style={inputStyle} />

      <label>體脂率 %</label>
      <input value={pbf} onChange={(e) => setPbf(e.target.value)} inputMode="decimal" style={inputStyle} />

      <label>骨骼肌量 kg</label>
      <input value={smm} onChange={(e) => setSmm(e.target.value)} inputMode="decimal" style={inputStyle} />

      <label>BMR kcal</label>
      <input value={bmr} onChange={(e) => setBmr(e.target.value)} inputMode="numeric" style={inputStyle} />

      <label>內臟脂肪等級（可空）</label>
      <input value={vfl} onChange={(e) => setVfl(e.target.value)} inputMode="numeric" style={inputStyle} />

      <button onClick={save} style={btnStyle}>存 InBody</button>

      <p style={{ opacity: 0.7, lineHeight: 1.4 }}>
        之後你想加更多欄位（體脂肪量、腰臀比、分數、腿部肌肉 Lv…）我會直接幫你擴充 UI + extra jsonb。
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