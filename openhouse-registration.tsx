import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Briefcase,
  Cpu,
  Palette,
  ShieldCheck,
  CircleSlash,
  Check,
  Users,
  School,
  Loader2,
  PartyPopper,
  ChevronRight,
} from "lucide-react";

/* ---------------------------------------------------------
   Token system
   Color:
     ink        #1B1030  (near-black violet, primary text/display)
     canvas     #F6F4FC  (page background, violet-tinted off-white)
     surface    #FFFFFF  (cards)
     primary    #6C4CE0  (violet — IT / interactive accent)
     line       #E4DFF5  (hairline borders)
     muted      #6E6690  (secondary text)
   Major accent colors (also used in chart + tiles):
     biz #FFB238  it #6C4CE0  media #FF6FA8  security #17B8C4  none #A79FC7
   Type: Kanit (display / eyebrows / numbers) + Sarabun (body, form labels)
   Signature: a live sticky "ticker" bar — a stacked proportion strip of
   who's interested in what, growing in real time as students register,
   echoing an event scoreboard.
--------------------------------------------------------- */

const INK = "#1B1030";
const CANVAS = "#F6F4FC";
const SURFACE = "#FFFFFF";
const PRIMARY = "#6C4CE0";
const LINE = "#E4DFF5";
const MUTED = "#6E6690";

const MAJORS = [
  { key: "biz", label: "เทคโนโลยีธุรกิจดิจิทัล", short: "ธุรกิจดิจิทัล", color: "#FFB238", Icon: Briefcase },
  { key: "it", label: "เทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล", short: "IT & นวัตกรรม", color: "#6C4CE0", Icon: Cpu },
  { key: "media", label: "ดิจิทัลมีเดียอาร์ต", short: "มีเดียอาร์ต", color: "#FF6FA8", Icon: Palette },
  { key: "security", label: "วิศวกรรมความปลอดภัย", short: "วิศวกรรมความปลอดภัย", color: "#17B8C4", Icon: ShieldCheck },
  { key: "none", label: "ยังไม่แน่ใจ / ไม่สนใจ", short: "ยังไม่แน่ใจ", color: "#A79FC7", Icon: CircleSlash },
];

const TITLES = ["เด็กชาย", "เด็กหญิง", "นาย", "นางสาว", "นาง"];
const GENDERS = ["ชาย", "หญิง", "ไม่ระบุ"];
const GRADES = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6", "ปวช.1", "ปวช.2", "ปวช.3", "อื่นๆ"];

const EMPTY_FORM = {
  title: "",
  fullName: "",
  gender: "",
  age: "",
  grade: "",
  school: "",
  phone: "",
  lineId: "",
  major: "",
};

function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700;800&family=Sarabun:wght@400;500;600;700&display=swap');
      .of-display { font-family: 'Kanit', system-ui, sans-serif; }
      .of-body { font-family: 'Sarabun', system-ui, sans-serif; }
      * { font-family: 'Sarabun', system-ui, sans-serif; }
      h1, h2, h3, .of-num, button, label.of-eyebrow { font-family: 'Kanit', system-ui, sans-serif; }
    `}</style>
  );
}

function Eyebrow({ children }) {
  return (
    <div
      className="of-eyebrow text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: PRIMARY, letterSpacing: "0.14em" }}
    >
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block mb-5">
      <span className="block text-sm font-medium mb-2" style={{ color: INK }}>
        {label} {required && <span style={{ color: "#E14C6D" }}>*</span>}
      </span>
      {children}
    </label>
  );
}

const inputBase = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: `1.5px solid ${LINE}`,
  fontSize: "15px",
  color: INK,
  background: SURFACE,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 120ms ease",
};

function TextInput(props) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? PRIMARY : LINE,
        ...(props.style || {}),
      }}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? PRIMARY : LINE,
        appearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236E6690' stroke-width='2'><path d='M4 6l4 4 4-4'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: "36px",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            type="button"
            key={o}
            onClick={() => onChange(o)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              border: `1.5px solid ${active ? PRIMARY : LINE}`,
              background: active ? PRIMARY : SURFACE,
              color: active ? "#fff" : INK,
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function MajorTile({ major, active, onClick }) {
  const { label, color, Icon } = major;
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-3 p-4 rounded-2xl text-left transition-all w-full"
      style={{
        border: `2px solid ${active ? color : LINE}`,
        background: active ? `${color}14` : SURFACE,
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: 44,
          height: 44,
          background: active ? color : `${color}20`,
          color: active ? "#fff" : color,
        }}
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <span className="text-sm font-semibold leading-snug" style={{ color: INK }}>
        {label}
      </span>
      {active && (
        <span
          className="absolute top-3 right-3 flex items-center justify-center rounded-full"
          style={{ width: 20, height: 20, background: color, color: "#fff" }}
        >
          <Check size={13} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

/* --------------------------- Ticker (signature element) --------------------------- */

function Ticker({ total, counts, loading }) {
  const maxTotal = Math.max(total, 1);
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20"
      style={{ background: INK, borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3 mb-1.5">
          <Users size={14} color="#fff" opacity={0.75} />
          <span className="of-num text-sm font-semibold" style={{ color: "#fff" }}>
            {loading ? "กำลังนับ…" : `ลงทะเบียนแล้ว ${total.toLocaleString("th-TH")} คน`}
          </span>
          <span className="text-xs opacity-60" style={{ color: "#fff" }}>
            · อัปเดตแบบเรียลไทม์
          </span>
        </div>
        <div className="flex w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
          {MAJORS.map((m) => {
            const c = counts[m.key] || 0;
            const pct = (c / maxTotal) * 100;
            return pct > 0 ? (
              <div
                key={m.key}
                style={{ width: `${pct}%`, background: m.color, transition: "width 400ms ease" }}
                title={`${m.label}: ${c}`}
              />
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Register view --------------------------- */

function RegisterView({ onSubmitted, refreshCounts }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => {
    const val = e && e.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const validate = () => {
    const e = {};
    if (!form.title) e.title = "กรุณาเลือกคำนำหน้า";
    if (!form.fullName.trim()) e.fullName = "กรุณากรอกชื่อ-นามสกุล";
    if (!form.gender) e.gender = "กรุณาเลือกเพศ";
    if (!form.age || Number(form.age) < 5 || Number(form.age) > 99) e.age = "กรุณากรอกอายุให้ถูกต้อง";
    if (!form.grade) e.grade = "กรุณาเลือกระดับชั้น";
    if (!form.school.trim()) e.school = "กรุณากรอกชื่อโรงเรียน";
    if (!/^0[0-9]{8,9}$/.test(form.phone.trim())) e.phone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)";
    if (!form.major) e.major = "กรุณาเลือกสาขาวิชาที่สนใจ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const record = { ...form, id, timestamp: new Date().toISOString() };
      const result = await window.storage.set(`registrations:${id}`, JSON.stringify(record), true);
      if (!result) throw new Error("บันทึกไม่สำเร็จ");
      setSuccess(true);
      setForm(EMPTY_FORM);
      refreshCounts();
    } catch (err) {
      console.error("Registration save error:", err);
      setErrors({ submit: "เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div
          className="mx-auto mb-5 flex items-center justify-center rounded-full"
          style={{ width: 72, height: 72, background: `${PRIMARY}18`, color: PRIMARY }}
        >
          <PartyPopper size={34} />
        </div>
        <h2 className="of-display text-2xl font-bold mb-2" style={{ color: INK }}>
          ลงทะเบียนสำเร็จ!
        </h2>
        <p className="text-sm mb-8" style={{ color: MUTED }}>
          ขอบคุณที่มาร่วมงาน Open House กับคณะเทคโนโลยีสารสนเทศ
          พี่ ๆ ทีมงานจะติดต่อกลับตามข้อมูลที่ให้ไว้
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-3 rounded-full font-semibold text-sm inline-flex items-center gap-2"
          style={{ background: PRIMARY, color: "#fff" }}
        >
          ลงทะเบียนคนถัดไป <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-4 pb-6 sm:px-6">
      {/* Personal info */}
      <section className="mb-8">
        <Eyebrow>ข้อมูลส่วนตัว</Eyebrow>
        <div className="grid grid-cols-2 gap-x-4">
          <div className="col-span-2 sm:col-span-1">
            <Field label="คำนำหน้า" required>
              <Select value={form.title} onChange={set("title")} options={TITLES} placeholder="เลือกคำนำหน้า" />
              {errors.title && <ErrorText>{errors.title}</ErrorText>}
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="ชื่อ-นามสกุล" required>
              <TextInput
                type="text"
                placeholder="เช่น สมชาย ใจดี"
                value={form.fullName}
                onChange={set("fullName")}
              />
              {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="เพศ" required>
              <PillGroup options={GENDERS} value={form.gender} onChange={set("gender")} />
              {errors.gender && <ErrorText>{errors.gender}</ErrorText>}
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="อายุ" required>
              <TextInput
                type="number"
                inputMode="numeric"
                placeholder="เช่น 17"
                value={form.age}
                onChange={set("age")}
              />
              {errors.age && <ErrorText>{errors.age}</ErrorText>}
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="ระดับชั้น" required>
              <Select value={form.grade} onChange={set("grade")} options={GRADES} placeholder="เลือกระดับชั้น" />
              {errors.grade && <ErrorText>{errors.grade}</ErrorText>}
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="ชื่อโรงเรียน" required>
              <TextInput
                type="text"
                placeholder="เช่น โรงเรียนสาธิต"
                value={form.school}
                onChange={set("school")}
              />
              {errors.school && <ErrorText>{errors.school}</ErrorText>}
            </Field>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mb-8">
        <Eyebrow>ข้อมูลติดต่อ</Eyebrow>
        <div className="grid grid-cols-2 gap-x-4">
          <div className="col-span-2 sm:col-span-1">
            <Field label="เบอร์โทรศัพท์" required>
              <TextInput
                type="tel"
                inputMode="tel"
                placeholder="0812345678"
                value={form.phone}
                onChange={set("phone")}
              />
              {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="LINE ID">
              <TextInput type="text" placeholder="ไม่บังคับ" value={form.lineId} onChange={set("lineId")} />
            </Field>
          </div>
        </div>
      </section>

      {/* Major interest */}
      <section className="mb-8">
        <Eyebrow>สาขาวิชาที่สนใจ (คณะเทคโนโลยีสารสนเทศ)</Eyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MAJORS.map((m) => (
            <MajorTile
              key={m.key}
              major={m}
              active={form.major === m.key}
              onClick={() => setForm((f) => ({ ...f, major: m.key }))}
            />
          ))}
        </div>
        {errors.major && <ErrorText>{errors.major}</ErrorText>}
      </section>

      {errors.submit && <ErrorText>{errors.submit}</ErrorText>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
        style={{ background: submitting ? "#B4A4F2" : PRIMARY, color: "#fff" }}
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" /> กำลังบันทึก…
          </>
        ) : (
          "ส่งข้อมูลลงทะเบียน"
        )}
      </button>
    </form>
  );
}

function ErrorText({ children }) {
  return (
    <div className="text-xs mt-1.5" style={{ color: "#E14C6D" }}>
      {children}
    </div>
  );
}

/* --------------------------- Dashboard view --------------------------- */

function DashboardView({ registrations, loading, error }) {
  const total = registrations.length;

  const counts = MAJORS.map((m) => ({
    key: m.key,
    label: m.short,
    fullLabel: m.label,
    color: m.color,
    value: registrations.filter((r) => r.major === m.key).length,
  }));

  const schoolCounts = {};
  registrations.forEach((r) => {
    if (r.school) schoolCounts[r.school] = (schoolCounts[r.school] || 0) + 1;
  });
  const topSchools = Object.entries(schoolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recent = [...registrations]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin" style={{ color: PRIMARY }} />
        <span className="text-sm" style={{ color: MUTED }}>
          กำลังโหลดข้อมูลแดชบอร์ด…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 text-sm" style={{ color: "#E14C6D" }}>
        ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองรีเฟรชอีกครั้ง
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-6 sm:px-6">
      <Eyebrow>ภาพรวมงาน Open House</Eyebrow>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="ลงทะเบียนทั้งหมด" value={total} accent={INK} />
        {counts
          .filter((c) => c.key !== "none")
          .slice(0, 3)
          .map((c) => (
            <StatCard key={c.key} label={c.label} value={c.value} accent={c.color} />
          ))}
      </div>

      <div
        className="rounded-2xl p-4 sm:p-6 mb-8"
        style={{ background: SURFACE, border: `1px solid ${LINE}` }}
      >
        <h3 className="of-display text-base font-semibold mb-4" style={{ color: INK }}>
          สาขาวิชาที่นักเรียนสนใจ
        </h3>
        {total === 0 ? (
          <EmptyState text="ยังไม่มีข้อมูลการลงทะเบียน — เมื่อมีนักเรียนลงทะเบียน กราฟจะแสดงที่นี่" />
        ) : (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={counts} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={LINE} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: MUTED }} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={110}
                  tick={{ fontSize: 12.5, fill: INK, fontFamily: "Sarabun" }}
                />
                <Tooltip
                  formatter={(v) => [`${v} คน`, "จำนวน"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ""}
                  contentStyle={{ borderRadius: 10, border: `1px solid ${LINE}`, fontFamily: "Sarabun" }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={26}>
                  {counts.map((c) => (
                    <Cell key={c.key} fill={c.color} />
                  ))}
                  <LabelList dataKey="value" position="right" style={{ fill: INK, fontSize: 12, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl p-4 sm:p-5" style={{ background: SURFACE, border: `1px solid ${LINE}` }}>
          <h3 className="of-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: INK }}>
            <School size={16} /> โรงเรียนที่มาร่วมงานมากที่สุด
          </h3>
          {topSchools.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูล" compact />
          ) : (
            <ul className="space-y-2.5">
              {topSchools.map(([school, count]) => (
                <li key={school} className="flex items-center justify-between text-sm">
                  <span style={{ color: INK }} className="truncate pr-2">
                    {school}
                  </span>
                  <span className="of-num font-semibold shrink-0" style={{ color: PRIMARY }}>
                    {count} คน
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl p-4 sm:p-5" style={{ background: SURFACE, border: `1px solid ${LINE}` }}>
          <h3 className="of-display text-sm font-semibold mb-3" style={{ color: INK }}>
            ลงทะเบียนล่าสุด
          </h3>
          {recent.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูล" compact />
          ) : (
            <ul className="space-y-2.5">
              {recent.map((r) => {
                const m = MAJORS.find((x) => x.key === r.major);
                return (
                  <li key={r.id} className="flex items-center justify-between text-sm gap-2">
                    <span style={{ color: INK }} className="truncate">
                      {r.title}{r.fullName}
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${m?.color || MUTED}20`, color: m?.color || MUTED }}
                    >
                      {m?.short || "-"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${LINE}` }}>
      <div className="of-num text-2xl font-bold mb-1" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-xs leading-snug" style={{ color: MUTED }}>
        {label}
      </div>
    </div>
  );
}

function EmptyState({ text, compact }) {
  return (
    <div
      className={`text-center text-sm ${compact ? "py-6" : "py-14"}`}
      style={{ color: MUTED }}
    >
      {text}
    </div>
  );
}

/* --------------------------- App shell --------------------------- */

export default function App() {
  const [tab, setTab] = useState("register");
  const [registrations, setRegistrations] = useState([]);
  const [loadingDash, setLoadingDash] = useState(true);
  const [dashError, setDashError] = useState(false);
  const [tickerLoading, setTickerLoading] = useState(true);

  const loadRegistrations = useCallback(async () => {
    try {
      const listResult = await window.storage.list("registrations:", true);
      const keys = listResult?.keys || [];
      if (keys.length === 0) {
        setRegistrations([]);
        setLoadingDash(false);
        setTickerLoading(false);
        return;
      }
      const results = await Promise.all(
        keys.map(async (k) => {
          try {
            const res = await window.storage.get(k, true);
            return res ? JSON.parse(res.value) : null;
          } catch {
            return null;
          }
        })
      );
      setRegistrations(results.filter(Boolean));
    } catch (err) {
      console.error("Failed to load registrations:", err);
      setDashError(true);
    } finally {
      setLoadingDash(false);
      setTickerLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const tickerCounts = {};
  MAJORS.forEach((m) => {
    tickerCounts[m.key] = registrations.filter((r) => r.major === m.key).length;
  });

  return (
    <div className="min-h-screen of-body" style={{ background: CANVAS, paddingBottom: 64 }}>
      <FontLoader />

      {/* Header */}
      <header className="max-w-3xl mx-auto px-4 pt-8 pb-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: MUTED, letterSpacing: "0.16em" }}>
              คณะเทคโนโลยีสารสนเทศ
            </div>
            <h1 className="of-display text-2xl sm:text-3xl font-bold" style={{ color: INK }}>
              OPEN HOUSE 2026
            </h1>
          </div>
        </div>

        <div
          className="inline-flex p-1 rounded-full"
          style={{ background: SURFACE, border: `1px solid ${LINE}` }}
        >
          {[
            { key: "register", label: "ลงทะเบียน" },
            { key: "dashboard", label: "แดชบอร์ด" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: tab === t.key ? PRIMARY : "transparent",
                color: tab === t.key ? "#fff" : MUTED,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {tab === "register" ? (
        <RegisterView refreshCounts={loadRegistrations} />
      ) : (
        <DashboardView registrations={registrations} loading={loadingDash} error={dashError} />
      )}

      <Ticker total={registrations.length} counts={tickerCounts} loading={tickerLoading} />
    </div>
  );
}
