"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function cardStyle() {
  return {
    background: "white",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  };
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);

  const [settings, setSettings] = useState(null);
  const [wakeAt, setWakeAt] = useState("");
  const [waterToday, setWaterToday] = useState(0);

  const todayLocal = useMemo(() => {
    // Asia/Taipei 的日期字串（YYYY-MM-DD）
    const d = new Date();
    const taipei = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
    const y = taipei.getFullYear();
    const m = String(taipei.getMonth() + 1).padStart(2, "0");
    const day = String(taipei.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUserId(sess?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data: s } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();
      setSettings(s || null);

      // 今日喝水加總
      const start = new Date(`${todayLocal}T00:00:00+08:00`).toISOString();
      const end = new Date(`${todayLocal}T23:59:59+08:00`).toISOString();
      const { data: waters } = await supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", userId)
        .gte("occurred_at", start)
        .lte("occurred_at", end);
      const sum = (waters || []).reduce((a, r) => a + (r.amount_ml || 0), 0);
      setWaterToday(sum);

      // 今日起床時間（若有）
      const { data: dc } = await supabase
        .from("daily_checkins")
        .select("wake_at")
        .eq("user_id", userId)
        .eq("date_local", todayLocal)
        .maybeSingle();
      if (dc?.wake_at) setWakeAt(dc.wake_at);
    })();
  }, [userId, todayLocal]);

  if (!session) {
    return (
      <div>
        <h1 style={{ marginTop: 6 }}>身體管理系統</h1>
        <p style={{ opacity: 0.7 }}>先登入，之後就像 App 一樣使用。</p>
        <a href="/login" style={{ ...btnStyle, display: "inline-block", textDecoration: "none" }}>
          去登入
        </a>
      </div>
    );
  }

  const goal = settings?.water_goal_ml ?? 1800;
  const quick1 = settings?.water_quick_add_1_ml ?? 300;
  const quick2 = settings?.water_quick_add_2_ml ?? 500;

  return (
    <div>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ marginTop: 6, marginBottom: 6 }}>身體管理</h1>
        <button onClick={() => supabase.auth.signOut()} style={smallBtnStyle}>登出</button>
      </header>

      <div style={{ opacity: 0.7, marginBottom: 12 }}>今天：{todayLocal}</div>

      {/* 我起床了 */}
      <div style={cardStyle()}>
        <h3 style={{ margin: 0 }}>💊 起床 & 吃藥</h3>
        <p style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.4 }}>
          按「我起床了」會自動排今天 2 次吃藥時間（起床後 X / Y 小時）
        </p>
        <button onClick={onWake} style={btnStyle}>🔘 我起床了</button>
        {wakeAt && <div style={{ marginTop: 8, opacity: 0.75 }}>已記錄起床：{new Date(wakeAt).toLocaleString()}</div>}
      </div>

      {/* 喝水 */}
      <div style={cardStyle()}>
        <h3 style={{ margin: 0 }}>💧 喝水</h3>
        <div style={{ marginTop: 8, fontWeight: 700 }}>{waterToday} / {goal} ml</div>
        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button onClick={() => addWater(quick1)} style={btnStyle}>+{quick1}</button>
          <button onClick={() => addWater(quick2)} style={btnStyle}>+{quick2}</button>
        </div>
      </div>

      {/* 快捷入口 */}
      <div style={cardStyle()}>
        <h3 style={{ margin: 0 }}>✨ 快捷</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <a href="/meal" style={tileStyle}>📸 飲食拍照</a>
          <a href="/inbody" style={tileStyle}>📊 InBody</a>
          <a href="/mood" style={tileStyle}>😊 心情日記</a>
          <a href="/injection" style={tileStyle}>💉 週四打針</a>
        </div>
      </div>
    </div>
  );

  async function onWake() {
    if (!userId) return;

    const now = new Date();
    // upsert daily_checkins
    const { error: e1 } = await supabase.from("daily_checkins").upsert({
      user_id: userId,
      date_local: todayLocal,
      wake_at: now.toISOString(),
    });
    if (e1) return alert(e1.message);

    // 產生兩筆吃藥排程
    const dose1Min = settings?.med_dose1_after_wake_min ?? 120;
    const dose2Min = settings?.med_dose2_after_wake_min ?? 360;

    const planned1 = new Date(now.getTime() + dose1Min * 60000);
    const planned2 = new Date(now.getTime() + dose2Min * 60000);

    const { error: e2 } = await supabase.from("med_schedules").upsert([
      { user_id: userId, date_local: todayLocal, dose_no: 1, planned_at: planned1.toISOString(), status: "PLANNED" },
      { user_id: userId, date_local: todayLocal, dose_no: 2, planned_at: planned2.toISOString(), status: "PLANNED" },
    ]);
    if (e2) return alert(e2.message);

    setWakeAt(now.toISOString());
    alert("已記錄起床！今天吃藥時間已排好～");
  }

  async function addWater(amount) {
    if (!userId) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("water_logs").insert({
      user_id: userId,
      occurred_at: now,
      amount_ml: amount,
    });
    if (error) return alert(error.message);
    setWaterToday((v) => v + amount);
  }
}

const btnStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "none",
  background: "#ffd1e8",
  fontWeight: 800,
};

const smallBtnStyle = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
};

const tileStyle = {
  display: "block",
  padding: 14,
  borderRadius: 16,
  textDecoration: "none",
  background: "#fff1f7",
  border: "1px solid rgba(0,0,0,0.06)",
  color: "#111",
  fontWeight: 700,
  textAlign: "center",
};