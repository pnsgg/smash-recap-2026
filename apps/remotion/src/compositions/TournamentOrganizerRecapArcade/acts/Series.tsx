import { interpolate } from "remotion";
import { snap } from "../../PlayerRecapArcade/components/kit";
import { PixelImage } from "../../PlayerRecapArcade/components/PixelImage";
import { PixelText, Sprite } from "../../PlayerRecapArcade/components/Pixel";
import { Slam } from "../../PlayerRecapArcade/components/Slam";
import { TICKET, TICKET_PALETTE } from "../../PlayerRecapArcade/components/sprites";
import { caption, color, display, displayCase, fitDisplay } from "../../PlayerRecapArcade/theme";
import type { OperatorData } from "../data";

const SECOND_AT = 105;
const TICKETS = { left: 44, top: 210, width: 512, height: 150 } as const;
const PRINTED_BY = 60;

export const Series: React.FC<{ t: number; data: OperatorData }> = ({ t, data }) => {
  const [first, second] = data.series;
  if (!first) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <Slam frame={t} at={0} text="SERIES" style={display(48, color.gold)} fill={color.gold} />
        <div style={{ ...caption, fontSize: 18 }}>No recurring series yet</div>
      </div>
    );
  }

  const n = first.count;
  // Tickets shrink so even a 200-edition weekly fits the strip.
  const px = Math.max(1, Math.min(3, Math.floor(Math.sqrt((TICKETS.width * TICKETS.height) / n) / 13)));
  const w = 12 * px + 4;
  const h = 7 * px + 4;
  const cols = Math.floor(TICKETS.width / w);
  const printed = Math.min(n, Math.floor((t / PRINTED_BY) * n));
  const name = displayCase(first.name);

  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40, display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 120, height: 120, flex: "none", outline: `5px solid ${color.gold}`, backgroundColor: color.raised2 }}>
          <PixelImage src={first.imageUrl} rows={30} px={4} mode="photo" levels={5} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...caption, color: color.gold, opacity: snap(t, 0) }}>Your series</div>
          <div style={{ marginTop: 10 }}>
            <Slam frame={t} at={2} text={name} style={display(fitDisplay(name, 48, 360))} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 14 }}>
            <PixelText text={String(printed)} px={6} fill={color.gold} />
            <div style={{ ...caption, lineHeight: 1 }}>{n === 1 ? "edition" : "editions"}</div>
          </div>
        </div>
      </div>

      {Array.from({ length: printed }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: TICKETS.left + (i % cols) * w, top: TICKETS.top + Math.floor(i / cols) * h }}>
          <Sprite rows={TICKET} palette={TICKET_PALETTE} px={px} />
        </div>
      ))}

      {second && t >= SECOND_AT ? (
        <div
          style={{
            position: "absolute",
            left: 44,
            right: 44,
            top: 420,
            display: "flex",
            alignItems: "center",
            gap: 18,
            transform: `translateX(${interpolate(snap(t, SECOND_AT), [0, 1], [-560, 0])}px)`,
          }}
        >
          <div style={{ width: 80, height: 80, flex: "none", outline: `4px solid ${color.casingDeep}`, backgroundColor: color.raised2 }}>
            <PixelImage src={second.imageUrl} rows={20} px={4} mode="photo" levels={5} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={display(fitDisplay(displayCase(second.name), 32, 380), color.muted)}>{displayCase(second.name)}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 10 }}>
              <PixelText text={String(second.count)} px={5} fill={color.ink} />
              <div style={{ ...caption, lineHeight: 1 }}>{second.count === 1 ? "edition" : "editions"}</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
