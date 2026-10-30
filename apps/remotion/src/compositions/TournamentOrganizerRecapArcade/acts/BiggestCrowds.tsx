import { random } from "remotion";
import { rollUp, snap } from "../../PlayerRecapArcade/components/kit";
import { PixelImage } from "../../PlayerRecapArcade/components/PixelImage";
import { PixelText, Sprite } from "../../PlayerRecapArcade/components/Pixel";
import { Slam } from "../../PlayerRecapArcade/components/Slam";
import { HEAD } from "../../PlayerRecapArcade/components/sprites";
import { caption, color, display, displayCase, fitDisplay, font } from "../../PlayerRecapArcade/theme";
import type { OperatorData } from "../data";

const TABLE_AT = 140;
const STANDS = { left: 44, top: 250, width: 512, height: 250 } as const;
const FILLED_BY = 60;

const HAIR = [color.ground, "#3b2a1e", color.accentEdge, color.gold, color.cardMuted];
const SHIRT = [color.accent, color.ink, color.gold, color.cyan, color.osd, color.casingDeep];

const Logo: React.FC<{ src: string | null; side: number }> = ({ src, side }) => (
  <div style={{ width: side, height: side, flex: "none", outline: `4px solid ${color.casingDeep}`, backgroundColor: color.raised2 }}>
    <PixelImage src={src} rows={side / 4} px={4} mode="photo" levels={5} />
  </div>
);

const Record: React.FC<{ t: number; record: OperatorData["biggest"][number] }> = ({ t, record }) => {
  const n = record.attendees;
  // The largest head that lets every attendee fit in the stands.
  const pitch = Math.max(4, Math.floor(Math.sqrt((STANDS.width * STANDS.height) / n)));
  const px = Math.max(1, Math.floor(pitch / 6));
  const cols = Math.floor(STANDS.width / pitch);
  const shown = Math.min(n, Math.floor((t / FILLED_BY) * n));
  const name = displayCase(record.tournamentName);
  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40, display: "flex", alignItems: "center", gap: 20 }}>
        <Logo src={record.tournamentImageUrl} side={96} />
        <div style={{ minWidth: 0 }}>
          <Slam frame={t} at={0} text="RECORD CROWD" style={display(32, color.gold)} fill={color.gold} />
          <div style={{ ...display(fitDisplay(name, 32, 380)), marginTop: 12, opacity: snap(t, 6) }}>{name}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 44, top: 170, display: "flex", alignItems: "flex-end", gap: 12 }}>
        <PixelText text={String(rollUp(n, t, 0, FILLED_BY))} px={8} fill={color.ink} />
        <div style={{ ...caption, fontSize: 18, lineHeight: 1 }}>attendees</div>
      </div>
      {Array.from({ length: shown }, (_, i) => {
        // The stands fill from the front row up.
        const row = Math.floor(i / cols);
        const col = i % cols;
        const palette = {
          h: HAIR[Math.floor(random(`hair-${i}`) * HAIR.length)]!,
          f: "#e8b98f",
          b: SHIRT[Math.floor(random(`shirt-${i}`) * SHIRT.length)]!,
        };
        const bob = Math.floor((t + i * 3) / 8) % 2 === 0 ? 0 : px;
        return (
          <div key={i} style={{ position: "absolute", left: STANDS.left + col * pitch, top: STANDS.top + STANDS.height - (row + 1) * pitch + bob }}>
            <Sprite rows={HEAD} palette={palette} px={px} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: STANDS.left - 8, width: STANDS.width + 16, top: STANDS.top + STANDS.height + 4, height: 8, backgroundColor: color.casingDeep }} />
    </>
  );
};

const Table: React.FC<{ t: number; biggest: OperatorData["biggest"] }> = ({ t, biggest }) => (
  <>
    <div style={{ position: "absolute", left: 44, top: 40 }}>
      <Slam frame={t} at={0} text="BIGGEST CROWDS" style={display(32, color.gold)} fill={color.gold} />
      <div style={{ ...caption, marginTop: 12, opacity: snap(t, 4) }}>Your tournaments by attendees</div>
    </div>
    <div style={{ position: "absolute", left: 44, right: 44, top: 116 }}>
      {biggest.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, height: 84, opacity: t >= 8 + i * 8 ? 1 : 0 }}>
          <PixelText text={String(i + 1)} px={4} fill={i === 0 ? color.gold : color.muted} />
          <Logo src={b.tournamentImageUrl} side={56} />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: font.text,
              fontWeight: 800,
              fontSize: 20,
              color: i === 0 ? color.gold : color.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {b.tournamentName}
          </div>
          <PixelText text={String(b.attendees)} px={5} fill={i === 0 ? color.gold : color.ink} />
        </div>
      ))}
    </div>
  </>
);

export const BiggestCrowds: React.FC<{ t: number; data: OperatorData }> = ({ t, data }) => {
  const record = data.biggest[0];
  if (!record) {
    return <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...caption, fontSize: 18 }}>No attendance reported</div>;
  }
  return t < TABLE_AT ? <Record t={t} record={record} /> : <Table t={t - TABLE_AT} biggest={data.biggest} />;
};
