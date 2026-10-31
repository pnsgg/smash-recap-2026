import { interpolate } from "remotion";
import { rollUp, snap } from "../../PlayerRecapArcade/components/kit";
import { PixelImage } from "../../PlayerRecapArcade/components/PixelImage";
import { PixelText } from "../../PlayerRecapArcade/components/Pixel";
import { Slam } from "../../PlayerRecapArcade/components/Slam";
import { caption, color, display, displayCase, fitDisplay } from "../../PlayerRecapArcade/theme";
import type { OperatorData } from "../data";

/** The other series slide in after the top one, a beat and a half apart. */
const NEXT_AT = 80;
const NEXT_STEP = 25;
const COUNTED_BY = 40;

export const Series: React.FC<{ t: number; data: OperatorData }> = ({ t, data }) => {
  const [first, ...rest] = data.series;
  if (!first) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <Slam frame={t} at={0} text="SERIES" style={display(48, color.gold)} fill={color.gold} />
        <div style={{ ...caption, fontSize: 18 }}>No recurring series yet</div>
      </div>
    );
  }

  const n = first.count;
  const name = displayCase(first.name);

  return (
    <>
      <div style={{ position: "absolute", left: 44, top: [230, 140, 80][rest.length], display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 120, height: 120, flex: "none", outline: `5px solid ${color.gold}`, backgroundColor: color.raised2 }}>
          <PixelImage src={first.imageUrl} rows={30} px={4} mode="photo" levels={5} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...caption, color: color.gold, opacity: snap(t, 0) }}>Your series</div>
          <div style={{ marginTop: 10 }}>
            <Slam frame={t} at={2} text={name} style={display(fitDisplay(name, 48, 360))} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 14 }}>
            <PixelText text={String(rollUp(n, t, 0, COUNTED_BY))} px={6} fill={color.gold} />
            <div style={{ ...caption, lineHeight: 1 }}>{n === 1 ? "edition" : "editions"}</div>
          </div>
        </div>
      </div>

      {rest.map((series, i) => {
        const at = NEXT_AT + i * NEXT_STEP;
        if (t < at) return null;
        const seriesName = displayCase(series.name);
        return (
          <div
            key={series.name}
            style={{
              position: "absolute",
              left: 44,
              right: 44,
              top: rest.length > 1 ? 250 + i * 110 : 330,
              display: "flex",
              alignItems: "center",
              gap: 18,
              transform: `translateX(${interpolate(snap(t, at), [0, 1], [-560, 0])}px)`,
            }}
          >
            <div style={{ width: 80, height: 80, flex: "none", outline: `4px solid ${color.casingDeep}`, backgroundColor: color.raised2 }}>
              <PixelImage src={series.imageUrl} rows={20} px={4} mode="photo" levels={5} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={display(fitDisplay(seriesName, 32, 380), color.muted)}>{seriesName}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 10 }}>
                <PixelText text={String(series.count)} px={5} fill={color.ink} />
                <div style={{ ...caption, lineHeight: 1 }}>{series.count === 1 ? "edition" : "editions"}</div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
