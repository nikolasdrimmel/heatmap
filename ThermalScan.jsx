import { useState, useRef } from "react";

function tempToColor(temp) {
  if (temp < 31.5) return "#1a0a6b";
  if (temp < 33.0) return "#0066cc";
  if (temp < 34.0) return "#00ccaa";
  if (temp < 35.0) return "#66cc00";
  if (temp < 35.8) return "#ffcc00";
  if (temp < 36.5) return "#ff6600";
  return "#cc0000";
}

function computeRisk(regions) {
  const pairs = [
    ["left_shoulder", "right_shoulder"],
    ["left_arm", "right_arm"],
    ["left_quad", "right_quad"],
    ["left_hamstring", "right_hamstring"],
    ["left_calf", "right_calf"],
  ];
  const byId = Object.fromEntries(regions.map((r) => [r.id, r.temp]));
  const totalDelta = pairs.reduce((sum, [l, r]) => {
    const tL = byId[l] ?? 0;
    const tR = byId[r] ?? 0;
    return sum + Math.abs(tL - tR);
  }, 0);
  return Math.min(100, Math.round((totalDelta / (pairs.length * 2)) * 100));
}

const REGION_SHAPES = {
  head: { type: "ellipse", cx: 200, cy: 48, rx: 32, ry: 38 },
  left_shoulder: { type: "ellipse", cx: 128, cy: 108, rx: 28, ry: 22 },
  right_shoulder: { type: "ellipse", cx: 272, cy: 108, rx: 28, ry: 22 },
  left_arm: { type: "rect", x: 90, y: 132, width: 38, height: 80, rx: 16 },
  right_arm: { type: "rect", x: 272, y: 132, width: 38, height: 80, rx: 16 },
  left_quad: { type: "rect", x: 148, y: 260, width: 44, height: 80, rx: 14 },
  right_quad: { type: "rect", x: 208, y: 260, width: 44, height: 80, rx: 14 },
  left_hamstring: { type: "rect", x: 148, y: 348, width: 44, height: 60, rx: 14 },
  right_hamstring: { type: "rect", x: 208, y: 348, width: 44, height: 60, rx: 14 },
  left_calf: { type: "rect", x: 152, y: 416, width: 36, height: 64, rx: 12 },
  right_calf: { type: "rect", x: 212, y: 416, width: 36, height: 64, rx: 12 },
};

const BODY_PATHS = [
  // torso
  { type: "rect", x: 148, y: 128, width: 104, height: 130, rx: 20, fill: "#2a2a3a" },
  // neck
  { type: "rect", x: 186, y: 84, width: 28, height: 28, rx: 6, fill: "#2a2a3a" },
];

function BodySVG({ regions, onRegionClick, activeId }) {
  const byId = Object.fromEntries((regions || []).map((r) => [r.id, r]));

  function renderShape(id, shape, color, isActive) {
    const strokeProps = isActive
      ? { stroke: "#fff", strokeWidth: 3 }
      : { stroke: "#444", strokeWidth: 1 };
    if (shape.type === "ellipse") {
      return (
        <ellipse
          key={id}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          fill={color}
          style={{ cursor: "pointer", transition: "fill 0.3s" }}
          onClick={() => onRegionClick && onRegionClick(id)}
          {...strokeProps}
        />
      );
    }
    return (
      <rect
        key={id}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rx={shape.rx}
        fill={color}
        style={{ cursor: "pointer", transition: "fill 0.3s" }}
        onClick={() => onRegionClick && onRegionClick(id)}
        {...strokeProps}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 400 500"
      width="340"
      height="425"
      style={{ display: "block", margin: "0 auto" }}
    >
      {BODY_PATHS.map((p, i) =>
        p.type === "rect" ? (
          <rect key={i} x={p.x} y={p.y} width={p.width} height={p.height} rx={p.rx} fill={p.fill} />
        ) : null
      )}
      {Object.entries(REGION_SHAPES).map(([id, shape]) => {
        const region = byId[id];
        const color = region ? tempToColor(region.temp) : "#2a2a3a";
        return renderShape(id, shape, color, activeId === id);
      })}
    </svg>
  );
}

function PulsingBody() {
  return (
    <svg viewBox="0 0 400 500" width="340" height="425" style={{ display: "block", margin: "0 auto" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:0.7}}`}</style>
      {BODY_PATHS.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={p.width} height={p.height} rx={p.rx} fill="#2a2a3a" />
      ))}
      {Object.entries(REGION_SHAPES).map(([id, shape]) =>
        shape.type === "ellipse" ? (
          <ellipse
            key={id}
            cx={shape.cx}
            cy={shape.cy}
            rx={shape.rx}
            ry={shape.ry}
            fill="#2a2a3a"
            style={{ animation: "pulse 1.4s ease-in-out infinite" }}
          />
        ) : (
          <rect
            key={id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx={shape.rx}
            fill="#2a2a3a"
            style={{ animation: "pulse 1.4s ease-in-out infinite" }}
          />
        )
      )}
    </svg>
  );
}

const SCALE = [
  { label: "37.0", color: "#cc0000" },
  { label: "36.5", color: "#ff6600" },
  { label: "35.8", color: "#ffcc00" },
  { label: "35.0", color: "#66cc00" },
  { label: "34.0", color: "#00ccaa" },
  { label: "33.0", color: "#0066cc" },
  { label: "30.0", color: "#1a0a6b" },
];

export default function ThermalScan() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [scan, setScan] = useState(null);
  const [error, setError] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);
  const popupRef = useRef(null);

  const PROMPT = `You are a sports thermography AI. Generate a randomized but realistic infrared thermal body scan result for an elite athlete. Return ONLY a valid JSON object with no markdown, no explanation, in this exact shape:
{
  "athlete": { "name": string, "sport": string, "age": number, "scanDate": string },
  "regions": [
    { "id": string, "label": string, "side": "left"|"right"|"center", "temp": number }
  ],
  "findings": [string, string, string]
}

Regions to include (use these exact ids): head, left_shoulder, right_shoulder, left_arm, right_arm, left_quad, right_quad, left_hamstring, right_hamstring, left_calf, right_calf.

Temp values must be realistic skin temperatures between 30.0 and 37.0°C. Introduce 1–2 notable asymmetries (ΔT > 1.2°C between a bilateral pair) to simulate an injury risk finding. findings[] should be 3 plain-English clinical observations about the asymmetries.`;

  async function generateScan() {
    if (!apiKey.trim()) {
      setError("Please enter your Gemini API key.");
      return;
    }
    setLoading(true);
    setError(null);
    setActiveRegion(null);
    setScan(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: PROMPT }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 1000 },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `API error ${res.status}`);
      }
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setScan(parsed);
    } catch (e) {
      setError(e.message || "Failed to generate scan.");
    } finally {
      setLoading(false);
    }
  }

  const riskScore = scan ? computeRisk(scan.regions) : 0;
  const riskColor = riskScore < 30 ? "#22c55e" : riskScore < 60 ? "#f59e0b" : "#ef4444";
  const riskLabel = riskScore < 30 ? "LOW" : riskScore < 60 ? "MODERATE" : "HIGH";

  const activeRegionData = scan?.regions.find((r) => r.id === activeRegion);

  const s = {
    root: {
      minHeight: "100vh",
      background: "#0f1117",
      color: "#e2e8f0",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "24px 16px",
      boxSizing: "border-box",
    },
    title: {
      textAlign: "center",
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: 2,
      color: "#94a3b8",
      textTransform: "uppercase",
      marginBottom: 20,
    },
    keyRow: {
      display: "flex",
      gap: 8,
      justifyContent: "center",
      marginBottom: 16,
      flexWrap: "wrap",
    },
    input: {
      background: "#1e2130",
      border: "1px solid #334155",
      borderRadius: 8,
      color: "#e2e8f0",
      padding: "10px 14px",
      fontSize: 14,
      width: 280,
      outline: "none",
    },
    btn: {
      background: "linear-gradient(135deg,#3b82f6,#6366f1)",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "10px 22px",
      fontSize: 15,
      fontWeight: 600,
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
      letterSpacing: 0.5,
      whiteSpace: "nowrap",
    },
    error: {
      textAlign: "center",
      color: "#f87171",
      marginBottom: 12,
      fontSize: 14,
    },
    columns: {
      display: "flex",
      gap: 28,
      justifyContent: "center",
      flexWrap: "wrap",
      alignItems: "flex-start",
      marginTop: 8,
    },
    heatmapCard: {
      background: "#161b2e",
      borderRadius: 16,
      padding: "20px 16px",
      minWidth: 360,
      position: "relative",
    },
    scanningOverlay: {
      textAlign: "center",
      color: "#64748b",
      fontSize: 14,
      marginTop: 10,
      letterSpacing: 1,
    },
    popup: {
      position: "absolute",
      background: "#1e293b",
      border: "1px solid #475569",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: 13,
      color: "#e2e8f0",
      pointerEvents: "none",
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      whiteSpace: "nowrap",
      zIndex: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    },
    scale: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      position: "absolute",
      right: 12,
      top: 20,
    },
    scaleTick: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" },
    scaleBox: { width: 14, height: 14, borderRadius: 3 },
    findingsCard: {
      background: "#161b2e",
      borderRadius: 16,
      padding: 24,
      minWidth: 280,
      maxWidth: 340,
      flex: 1,
    },
    athleteName: { fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 },
    meta: { fontSize: 13, color: "#64748b", marginBottom: 18 },
    riskBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: riskColor + "22",
      border: `1px solid ${riskColor}`,
      color: riskColor,
      borderRadius: 20,
      padding: "4px 14px",
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 20,
    },
    findingsTitle: { fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
    finding: { display: "flex", gap: 8, marginBottom: 10, fontSize: 14, lineHeight: 1.5, color: "#cbd5e1" },
    dot: { color: "#f59e0b", flexShrink: 0, marginTop: 1 },
    placeholder: { color: "#334155", fontSize: 14, marginTop: 32, textAlign: "center", lineHeight: 1.8 },
  };

  return (
    <div style={s.root}>
      <div style={s.title}>Thermal Body Scanner</div>

      <div style={s.keyRow}>
        <input
          style={s.input}
          type="password"
          placeholder="Gemini API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateScan()}
        />
        <button style={s.btn} onClick={generateScan} disabled={loading}>
          {loading ? "Scanning..." : "Generate Thermal Scan"}
        </button>
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.columns}>
        <div style={s.heatmapCard}>
          {activeRegionData && (
            <div style={s.popup} ref={popupRef}>
              <strong>{activeRegionData.label}</strong> — {activeRegionData.temp.toFixed(1)}°C
              <span
                style={{ marginLeft: 8, display: "inline-block", width: 10, height: 10, borderRadius: 2, background: tempToColor(activeRegionData.temp), verticalAlign: "middle" }}
              />
            </div>
          )}

          {loading ? (
            <>
              <PulsingBody />
              <div style={s.scanningOverlay}>Scanning athlete...</div>
            </>
          ) : (
            <BodySVG
              regions={scan?.regions}
              onRegionClick={(id) => setActiveRegion((prev) => (prev === id ? null : id))}
              activeId={activeRegion}
            />
          )}

          <div style={s.scale}>
            {SCALE.map((t) => (
              <div key={t.label} style={s.scaleTick}>
                <div style={{ ...s.scaleBox, background: t.color }} />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div style={s.findingsCard}>
          {scan ? (
            <>
              <div style={s.athleteName}>{scan.athlete.name}</div>
              <div style={s.meta}>
                {scan.athlete.sport} · Age {scan.athlete.age} · {scan.athlete.scanDate}
              </div>
              <div style={s.riskBadge}>
                <span style={{ fontSize: 16 }}>⬤</span>
                Risk: {riskLabel} ({riskScore}/100)
              </div>
              <div style={s.findingsTitle}>Clinical Findings</div>
              {scan.findings.map((f, i) => (
                <div key={i} style={s.finding}>
                  <span style={s.dot}>⚠</span>
                  <span>{f}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={s.placeholder}>
              Enter your Gemini API key and click<br />
              <strong style={{ color: "#475569" }}>Generate Thermal Scan</strong><br />
              to produce a body heatmap.<br /><br />
              Click any region on the heatmap<br />to see its temperature.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
