import React from 'react';

const BG = '#0d1117';

function colorLerp(t, stops) {
  const ct = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    if (ct <= stops[i + 1][0]) {
      const f = (ct - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
      const [r0, g0, b0] = stops[i][1];
      const [r1, g1, b1] = stops[i + 1][1];
      return `rgb(${~~(r0+f*(r1-r0))},${~~(g0+f*(g1-g0))},${~~(b0+f*(b1-b0))})`;
    }
  }
  const last = stops[stops.length - 1][1];
  return `rgb(${last.join(',')})`;
}

const THERMAL_STOPS = [
  [0,    [60,  0,   128]],
  [0.12, [0,   0,   230]],
  [0.27, [0,   200, 255]],
  [0.43, [0,   245, 80 ]],
  [0.58, [230, 255, 0  ]],
  [0.72, [255, 150, 0  ]],
  [0.85, [255, 20,  0  ]],
  [1.0,  [255, 255, 255]],
];

function thermalColor(temp) {
  return colorLerp((temp - 33.5) / 5, THERMAL_STOPS);
}

function asymColor(diff) {
  return colorLerp(Math.max(0, diff) / 2, [
    [0, [255, 255, 255]],
    [1, [139, 0,   0  ]],
  ]);
}

// Temperature data — pair: [leftTemp, rightTemp], center: singleTemp
const frontData = {
  head:    { center: 36.8 },
  neck:    { center: 36.5 },
  shoulder:{ pair: [36.2, 36.6] },
  pec:     { pair: [36.0, 36.4] },
  abdomen: { center: 36.6 },
  hip:     { pair: [36.1, 36.3] },
  uArm:    { pair: [35.6, 36.0] },
  forearm: { pair: [35.0, 35.6] },
  hand:    { pair: [34.2, 35.0] },
  thigh:   { pair: [36.1, 36.5] },
  knee:    { pair: [35.8, 35.8] },
  calf:    { pair: [35.3, 35.7] },
  foot:    { pair: [34.5, 34.8] },
};

const backData = {
  head:     { center: 36.6 },
  neck:     { center: 36.4 },
  shoulder: { pair: [36.3, 36.5] },
  uBack:    { pair: [36.4, 36.9] },
  lBack:    { pair: [36.7, 36.2] },
  glute:    { pair: [36.2, 36.5] },
  uArm:     { pair: [35.5, 36.0] },
  forearm:  { pair: [35.0, 35.5] },
  hand:     { pair: [34.3, 35.1] },
  hamstring:{ pair: [35.9, 36.4] },
  kneeB:    { pair: [35.7, 35.9] },
  calf:     { pair: [35.2, 35.6] },
  heel:     { pair: [34.4, 34.7] },
};

const e = (region, side, cx, cy, rx, ry) => ({ region, side, cx, cy, rx, ry });

const FRONT_SHAPES = [
  e('head',    'center', 100, 42,  28, 32),
  e('neck',    'center', 100, 78,  13, 11),
  e('shoulder','left',   56,  98,  22, 17),
  e('shoulder','right',  144, 98,  22, 17),
  e('pec',     'left',   82,  124, 22, 30),
  e('pec',     'right',  118, 124, 22, 30),
  e('abdomen', 'center', 100, 167, 25, 28),
  e('hip',     'left',   82,  207, 22, 20),
  e('hip',     'right',  118, 207, 22, 20),
  e('uArm',    'left',   44,  138, 14, 44),
  e('uArm',    'right',  156, 138, 14, 44),
  e('forearm', 'left',   41,  208, 11, 34),
  e('forearm', 'right',  159, 208, 11, 34),
  e('hand',    'left',   38,  256, 11, 20),
  e('hand',    'right',  162, 256, 11, 20),
  e('thigh',   'left',   80,  268, 22, 47),
  e('thigh',   'right',  120, 268, 22, 47),
  e('knee',    'left',   78,  328, 18, 15),
  e('knee',    'right',  122, 328, 18, 15),
  e('calf',    'left',   75,  373, 13, 33),
  e('calf',    'right',  125, 373, 13, 33),
  e('foot',    'left',   68,  415, 18, 11),
  e('foot',    'right',  132, 415, 18, 11),
];

const BACK_SHAPES = [
  e('head',     'center', 100, 42,  28, 32),
  e('neck',     'center', 100, 78,  13, 11),
  e('shoulder', 'left',   60,  100, 24, 18),
  e('shoulder', 'right',  140, 100, 24, 18),
  e('uBack',    'left',   84,  134, 22, 30),
  e('uBack',    'right',  116, 134, 22, 30),
  e('lBack',    'left',   83,  178, 20, 24),
  e('lBack',    'right',  117, 178, 20, 24),
  e('glute',    'left',   82,  215, 24, 22),
  e('glute',    'right',  118, 215, 24, 22),
  e('uArm',     'left',   44,  138, 14, 44),
  e('uArm',     'right',  156, 138, 14, 44),
  e('forearm',  'left',   41,  208, 11, 34),
  e('forearm',  'right',  159, 208, 11, 34),
  e('hand',     'left',   38,  256, 11, 20),
  e('hand',     'right',  162, 256, 11, 20),
  e('hamstring','left',   80,  270, 22, 45),
  e('hamstring','right',  120, 270, 22, 45),
  e('kneeB',    'left',   78,  328, 18, 15),
  e('kneeB',    'right',  122, 328, 18, 15),
  e('calf',     'left',   75,  373, 13, 33),
  e('calf',     'right',  125, 373, 13, 33),
  e('heel',     'left',   72,  415, 15, 12),
  e('heel',     'right',  128, 415, 15, 12),
];

function shapeColor(shape, data, mode) {
  const d = data[shape.region];
  if (!d) return 'transparent';
  if (mode === 'thermal') {
    return d.center !== undefined
      ? thermalColor(d.center)
      : thermalColor(shape.side === 'left' ? d.pair[0] : d.pair[1]);
  }
  if (d.center !== undefined) return asymColor(0);
  const [lt, rt] = d.pair;
  return shape.side === 'left'
    ? asymColor(Math.max(0, lt - rt))
    : asymColor(Math.max(0, rt - lt));
}

function BodySVG({ shapes, data, mode }) {
  return (
    <svg viewBox="0 0 200 440" width={190} height={430} style={{ display: 'block' }}>
      <rect width={200} height={440} fill={BG} />
      {shapes.map((s, i) => (
        <ellipse
          key={i}
          cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
          fill={shapeColor(s, data, mode)}
          stroke={BG}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

function ScaleBar({ gradId, stops, flip }) {
  const y1 = flip ? '0' : '1';
  const y2 = flip ? '1' : '0';
  return (
    <svg width={32} height={430} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1={y1} x2="0" y2={y2}>
          {stops.map(([offset, color]) => (
            <stop key={offset} offset={`${offset * 100}%`} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <rect x={8} y={20} width={14} height={390} fill={`url(#${gradId})`} rx={3} />
    </svg>
  );
}

const THERMAL_SCALE = [
  [0,    'rgb(60,0,128)'],
  [0.12, 'rgb(0,0,230)'],
  [0.27, 'rgb(0,200,255)'],
  [0.43, 'rgb(0,245,80)'],
  [0.58, 'rgb(230,255,0)'],
  [0.72, 'rgb(255,150,0)'],
  [0.85, 'rgb(255,20,0)'],
  [1.0,  'rgb(255,255,255)'],
];

const ASYM_SCALE = [
  [0, 'rgb(255,255,255)'],
  [1, 'rgb(139,0,0)'],
];

const rowStyle = { display: 'flex', alignItems: 'center', gap: '6px' };

export default function ThermalBodyScan() {
  return (
    <div style={{ background: BG, padding: '24px', display: 'inline-flex', flexDirection: 'column', gap: '20px' }}>
      <div style={rowStyle}>
        <BodySVG shapes={FRONT_SHAPES} data={frontData} mode="thermal" />
        <BodySVG shapes={BACK_SHAPES}  data={backData}  mode="thermal" />
        <ScaleBar gradId="thermalGrad" stops={THERMAL_SCALE} flip={false} />
      </div>
      <div style={rowStyle}>
        <BodySVG shapes={FRONT_SHAPES} data={frontData} mode="asymmetry" />
        <BodySVG shapes={BACK_SHAPES}  data={backData}  mode="asymmetry" />
        <ScaleBar gradId="asymGrad" stops={ASYM_SCALE} flip={true} />
      </div>
    </div>
  );
}
