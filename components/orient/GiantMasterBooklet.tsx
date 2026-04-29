import type { OrientContent } from "@/lib/orient-infographics/types";

const O = {
  ink: "#1a1915",
  inkSoft: "#3d3a2f",
  muted: "#8a8672",
  rule: "#c7c2b0",
  helv: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
};

export function GiantMasterBooklet({ content }: { content: OrientContent }) {
  const t = content;
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
      <svg viewBox="0 0 1180 1080" width="100%" height="auto">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={O.muted} />
          </marker>
        </defs>

        <text x="590" y="78" textAnchor="middle" fontFamily={O.helv} fontSize="12" letterSpacing="2.6" fill={O.muted}>
          {t.giant.kicker.toUpperCase()}
        </text>
        <text x="590" y="122" textAnchor="middle" fontFamily={O.helv} fontSize="52" fontWeight="500" letterSpacing="-0.6" fill={O.ink}>
          {t.giant.title}
        </text>
        <text x="590" y="158" textAnchor="middle" fontFamily={O.helv} fontStyle="italic" fontSize="14" fill={O.muted}>
          {t.giant.sub}
        </text>

        {[1010, 1060, 1110].map((x, i) => (
          <line key={i} x1={x} y1="40" x2={x} y2="1040" stroke={O.rule} strokeWidth="1" strokeDasharray="2 6" opacity="0.6" />
        ))}
        {t.pillars.items.slice(0, 3).map((p, i) => {
          const x = 1010 + i * 50;
          return (
            <g key={i}>
              <text x={x} y="32" textAnchor="end" transform={`rotate(-90 ${x} 32)`} fontFamily={O.helv} fontStyle="italic" fontSize="13" letterSpacing="1.6" fill={O.muted}>
                ~ {p.name}
              </text>
            </g>
          );
        })}

        <text x="80" y="220" fontFamily={O.helv} fontSize="13" letterSpacing="2.4" fill={O.muted}>
          ~ A · STAGES OF PEACE
        </text>
        <line x1="80" y1="236" x2="940" y2="236" stroke={O.rule} strokeWidth="1" />

        <line x1="170" y1="380" x2="830" y2="380" stroke={O.rule} strokeWidth="1" />
        <circle cx="180" cy="380" r="4.5" fill={O.ink} />
        <circle cx="500" cy="380" r="60" fill="none" stroke={O.rule} strokeWidth="1" opacity="0.5" />
        <circle cx="500" cy="380" r="38" fill={O.ink} opacity="0.1" />
        <circle cx="500" cy="380" r="38" fill="none" stroke={O.muted} strokeWidth="1" opacity="0.6" />
        <circle cx="820" cy="380" r="60" fill="none" stroke={O.rule} strokeWidth="1" opacity="0.5" />
        {Array.from({ length: 240 }).map((_, i) => {
          const a = ((i * 137.5) % 360) * (Math.PI / 180);
          const r = 54 * Math.sqrt((i + 1) / 240);
          return <circle key={i} cx={820 + Math.cos(a) * r} cy={380 + Math.sin(a) * r} r="1" fill={i % 3 === 0 ? O.muted : O.ink} />;
        })}

        <line x1="220" y1="380" x2="460" y2="380" stroke={O.muted} strokeWidth="1" markerEnd="url(#arr)" />
        <line x1="540" y1="380" x2="780" y2="380" stroke={O.muted} strokeWidth="1" markerEnd="url(#arr)" />

        {t.stages.items.slice(0, 3).map((s, i) => {
          const x = 180 + i * 320;
          return (
            <g key={i}>
              <text x={x} y="458" textAnchor="middle" fontFamily={O.helv} fontStyle="italic" fontSize="13" letterSpacing="1.4" fill={O.muted}>
                {String(i + 1).padStart(2, "0")} · {s.scope}
              </text>
              <text x={x} y="488" textAnchor="middle" fontFamily={O.helv} fontSize="22" fontWeight="500" letterSpacing="-0.3" fill={O.ink}>
                {s.name}
              </text>
              <text x={x} y="516" textAnchor="middle" fontFamily={O.helv} fontSize="14" fontStyle="italic" fill={O.inkSoft}>
                {s.gloss}
              </text>
            </g>
          );
        })}

        <line x1="500" y1="540" x2="500" y2="610" stroke={O.muted} strokeWidth="1" strokeDasharray="3 5" markerEnd="url(#arr)" />
        <text x="520" y="580" fontFamily={O.helv} fontStyle="italic" fontSize="15" fill={O.muted}>
          {t.giant.transition}
        </text>

        <text x="80" y="650" fontFamily={O.helv} fontSize="13" letterSpacing="2.4" fill={O.muted}>
          ~ B · MOVEMENT &amp; PROGRESSION
        </text>
        <line x1="80" y1="666" x2="940" y2="666" stroke={O.rule} strokeWidth="1" />

        {[[140, 720],[180,708],[220,722],[160,750],[200,748],[180,778]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill={O.ink} />)}
        <rect x="120" y="695" width="120" height="100" fill="none" stroke={O.rule} strokeWidth="1" />

        <path d="M 270 740 Q 430 700, 590 740" fill="none" stroke={O.muted} strokeWidth="1" strokeDasharray="3 5" />
        <path d="M 590 740 l -8 -3 l 0 6 z" fill={O.muted} />

        {(() => {
          const pts = [[640,708],[700,725],[770,705],[830,735],[660,775],[740,792],[810,770],[700,825],[780,832]];
          const links = [[0,1],[1,2],[2,3],[1,4],[1,5],[4,5],[5,6],[2,6],[4,7],[5,7],[5,8],[6,8],[7,8],[0,4],[3,6]];
          return (
            <>
              {links.map(([a,b],i)=><line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={O.rule} strokeWidth="1" opacity="0.85" />)}
              {pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.5" fill={O.ink} />)}
            </>
          );
        })()}

        <line x1="80" y1="890" x2="940" y2="890" stroke={O.rule} strokeWidth="1" />
        <text x="80" y="940" fontFamily={O.helv} fontSize="13" letterSpacing="2.4" fill={O.muted}>
          ~ C · THEMES
        </text>
        <line x1="80" y1="956" x2="940" y2="956" stroke={O.rule} strokeWidth="1" />
        {t.themes.list.slice(0, 8).map((name, i) => {
          const positions = [[160,1030],[320,1000],[480,1030],[660,1000],[220,1080],[400,1100],[580,1080],[760,1100]];
          const [x, y] = positions[i] ?? [160 + i * 80, 1030];
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill={O.ink} />
              <text x={x} y={y - 12} textAnchor="middle" fontFamily={O.helv} fontSize="15" fontStyle="italic" fill={O.ink}>
                {name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
