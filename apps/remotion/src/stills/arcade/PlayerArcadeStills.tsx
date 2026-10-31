import { Still } from "remotion";
import type { PlayerRecapProps } from "@shared";
import { licanePlayerRecap } from "@shared/fixtures/player-recap";
import { PixelImage } from "../../compositions/PlayerRecapArcade/components/PixelImage";
import { PixelText, Sprite } from "../../compositions/PlayerRecapArcade/components/Pixel";
import { stageArt } from "../../compositions/PlayerRecapArcade/components/StageView";
import { StageDiorama, tileMood } from "../../compositions/PlayerRecapArcade/components/Stage";
import { GOLD, LAMP_LOST, LAMP_WON, STAR } from "../../compositions/PlayerRecapArcade/components/sprites";
import { deriveArcade, type ArcadeData } from "../../compositions/PlayerRecapArcade/data";
import { caption, color, display, displayCase, fitDisplay, font, percent } from "../../compositions/PlayerRecapArcade/theme";
import { loadFonts } from "../../lib/fonts";
import type { StillFormatKey } from "../formats";
import { STILL_FORMAT_KEYS, STILL_FORMATS, stillIdSuffix } from "../formats";
import { Panel, StillFigure, StillPage, type PanelSpec } from "./kit";

loadFonts();

const LAMPS = {
  won: { k: "#050606", a: color.gold, g: color.ground },
  lost: { k: "#050606", a: color.accent, g: color.ground },
} as const;

const Name: React.FC<{ text: string; width: number; max?: number; fill?: string }> = ({ text, width, max = 48, fill = color.ink }) => (
  <div style={display(fitDisplay(displayCase(text), max, width), fill)}>{displayCase(text)}</div>
);

const Logo: React.FC<{ src: string | null; side: number }> = ({ src, side }) => (
  <div style={{ width: side, height: side, flex: "none", border: `5px solid ${color.casingDeep}`, backgroundColor: color.raised }}>
    <PixelImage src={src} rows={side / 6} px={6} mode="photo" levels={5} />
  </div>
);

const playerPanels = (d: ArcadeData): PanelSpec[] => {
  const panels: (PanelSpec | null)[] = [
    d.main
      ? {
          key: "main",
          render: ({ width, height }) => (
            <Panel label="Main" tone={color.gold} width={width} height={height}>
              <div style={{ position: "absolute", right: 10, bottom: 0, height: height - 20, display: "flex", alignItems: "flex-end" }}>
                <PixelImage src={d.main!.renderUrl} rows={Math.floor((height - 40) / 4)} maxCols={Math.floor(width / 2 / 4)} px={4} />
              </div>
              <div style={{ position: "absolute", left: 22, bottom: 24, width: width / 2 }}>
                <Name text={d.main!.characterName} width={width / 2} />
                <div style={{ marginTop: 14 }}>
                  <StillFigure value={String(d.main!.count)} px={8} unit="games" fill={color.gold} />
                </div>
              </div>
            </Panel>
          ),
        }
      : null,
    d.topStage
      ? {
          key: "stage",
          render: ({ width, height }) => {
            const art = stageArt(d.topStage!.stageId);
            return (
              <Panel label="" width={width} height={height}>
                {/* The stage fills the panel; its numbers sit on a dark strip along the bottom */}
                <div style={{ position: "absolute", left: 0, top: 0, width: width - 12, height: height - 12, overflow: "hidden" }}>
                  {art ? (
                    <PixelImage src={art} rows={Math.ceil(height / 4) + 2} px={4} mode="art" levels={6} />
                  ) : (
                    <StageDiorama stage={d.topStage!} width={Math.max(width, (height * 3) / 2)} mood={tileMood(d.topStage!.stageId)} />
                  )}
                </div>
                <div style={{ position: "absolute", left: 0, top: 0, ...caption, fontSize: 22, color: color.ink, backgroundColor: "rgba(11,15,13,0.85)", padding: "12px 22px" }}>
                  Most played stage
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 22px", backgroundColor: "rgba(11,15,13,0.88)" }}>
                  <Name text={d.topStage!.stageName} width={width - 56} max={32} />
                  <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
                    <StillFigure value={String(d.topStage!.count)} px={5} unit="games" />
                    <StillFigure value={percent(d.topStage!.winRate)} px={5} unit="won" fill={color.gold} />
                  </div>
                </div>
              </Panel>
            );
          },
        }
      : null,
    d.rival
      ? {
          key: "rival",
          render: ({ width, height }) => {
            const r = d.rival!;
            const face = Math.min(150, height - 120);
            const lead = (mine: number, theirs: number, base: string) => (mine > theirs ? color.gold : base);
            const score = `${r.playerWonSet}-${r.opponentWonSet}`;
            const scorePx = score.length > 3 ? 6 : 8;
            return (
              <Panel label="Rival · most played opponent" tone={color.accent} width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 58 }}>
                  <Logo src={d.avatarUrl} side={face} />
                </div>
                <div style={{ position: "absolute", right: 22, top: 58 }}>
                  <Logo src={r.avatarUrl} side={face} />
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 58, height: face, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div style={display(32, color.gold)}>VS</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <PixelText text={String(r.playerWonSet)} px={scorePx} fill={lead(r.playerWonSet, r.opponentWonSet, color.ink)} />
                    <PixelText text="-" px={scorePx} fill={color.muted} />
                    <PixelText text={String(r.opponentWonSet)} px={scorePx} fill={lead(r.opponentWonSet, r.playerWonSet, color.accent)} />
                  </div>
                </div>
                <div style={{ position: "absolute", left: 22, right: 22, bottom: 20, display: "flex", justifyContent: "space-between" }}>
                  <div style={display(fitDisplay(displayCase(d.tag), 32, (width - 60) / 2))}>{displayCase(d.tag)}</div>
                  <div style={display(fitDisplay(displayCase(r.gamerTag ?? `#${r.opponentPlayerId}`), 32, (width - 60) / 2), color.accent)}>
                    {displayCase(r.gamerTag ?? `#${r.opponentPlayerId}`)}
                  </div>
                </div>
              </Panel>
            );
          },
        }
      : null,
    d.deciding.count > 0
      ? {
          key: "deciding",
          render: ({ width, height }) => {
            const n = d.deciding.count;
            const boardW = width - 44;
            const boardH = height - 150;
            let pitch = 30;
            while (pitch > 6 && Math.ceil(n / Math.floor(boardW / pitch)) * pitch > boardH) pitch--;
            const cols = Math.floor(boardW / pitch);
            const px = Math.max(1, Math.floor((pitch - 2) / 9));
            return (
              <Panel label="Sets decided by one game" width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 60 }}>
                  {Array.from({ length: n }, (_, i) => (
                    <div key={i} style={{ position: "absolute", left: (i % cols) * pitch, top: Math.floor(i / cols) * pitch }}>
                      <Sprite rows={i < d.deciding.winCount ? LAMP_WON : LAMP_LOST} palette={i < d.deciding.winCount ? LAMPS.won : LAMPS.lost} px={px} />
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", left: 22, bottom: 22, display: "flex", gap: 24, alignItems: "flex-end" }}>
                  <StillFigure value={`${d.deciding.winCount}/${n}`} px={6} unit="won" fill={color.gold} />
                  <StillFigure value={percent(d.deciding.winRate)} px={4} />
                </div>
              </Panel>
            );
          },
        }
      : null,
    d.cleanSweeps > 0
      ? {
          key: "perfect",
          render: ({ width, height }) => {
            const stars = Math.min(d.cleanSweeps, 80);
            // The stars fill the right half, one per sweep, as large as fits.
            const areaW = width / 2 - 30;
            const areaH = height - 80;
            let pitch = 30;
            while (pitch > 6 && Math.ceil(stars / Math.floor(areaW / pitch)) * pitch > areaH) pitch--;
            const cols = Math.floor(areaW / pitch);
            const starPx = Math.max(1, Math.floor((pitch - 3) / 7));
            return (
              <Panel label="Without dropping a game" tone={color.gold} width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 70, ...display(32, color.gold) }}>CLEAN SWEEPS</div>
                <div style={{ position: "absolute", left: 22, bottom: 22 }}>
                  <StillFigure value={String(d.cleanSweeps)} px={8} unit="sets" />
                </div>
                <div style={{ position: "absolute", right: 22, top: 58 }}>
                  {Array.from({ length: stars }, (_, i) => (
                    <div key={i} style={{ position: "absolute", right: (cols - 1 - (i % cols)) * pitch, top: Math.floor(i / cols) * pitch }}>
                      <Sprite rows={STAR} palette={GOLD} px={starPx} />
                    </div>
                  ))}
                </div>
              </Panel>
            );
          },
        }
      : null,
    d.bestRuns[0]
      ? {
          key: "bestRun",
          render: ({ width, height }) => {
            const run = d.bestRuns[0]!;
            const side = Math.min(140, height - 150);
            return (
              <Panel label="Best run · seed performance" tone={color.gold} width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 62, display: "flex", alignItems: "center", gap: 22 }}>
                  <Logo src={run.tournamentImageUrl} side={side} />
                  <PixelText text={`+${run.spr}`} px={12} fill={color.gold} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 22,
                    right: 22,
                    bottom: 22,
                    fontFamily: font.text,
                    fontWeight: 800,
                    fontSize: 28,
                    color: color.ink,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {run.tournamentName}
                </div>
              </Panel>
            );
          },
        }
      : null,
    d.matchups[0]
      ? {
          key: "toughest",
          wide: true,
          render: ({ width, height }) => {
            const shown = d.matchups.slice(0, 3);
            const column = (width - 44) / shown.length;
            return (
              <Panel label="Toughest matchups · games lost" tone={color.accent} width={width} height={height}>
                {shown.map((m, i) => (
                  <div key={m.characterId} style={{ position: "absolute", left: 22 + i * column, top: 54, width: column - 16, height: height - 76 }}>
                    <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 80, display: "flex", alignItems: "flex-end", justifyContent: "center", backgroundColor: "#1a0705" }}>
                      <PixelImage
                        src={m.renderUrl}
                        rows={Math.floor((height - 170) / 4)}
                        maxCols={Math.floor((column - 30) / 4)}
                        px={4}
                        tint={[color.accent, 0.55]}
                      />
                    </div>
                    <div style={{ position: "absolute", left: 0, bottom: 40 }}>
                      <Name text={m.characterName} width={column - 30} max={32} />
                    </div>
                    <div style={{ position: "absolute", left: 0, bottom: 0 }}>
                      <PixelText text={`${m.lossCount}/${m.count}`} px={5} fill={color.accent} />
                    </div>
                  </div>
                ))}
              </Panel>
            );
          },
        }
      : null,
    d.upset
      ? {
          key: "upset",
          render: ({ width, height }) => {
            const side = Math.min(140, height - 150);
            return (
              <Panel label="Biggest upset · factor" tone={color.gold} width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 62, display: "flex", alignItems: "center", gap: 22 }}>
                  <Logo src={d.upset!.tournamentImageUrl} side={side} />
                  <PixelText text={String(d.upset!.factor)} px={12} fill={color.gold} />
                </div>
                <div style={{ position: "absolute", left: 22, right: 22, bottom: 22 }}>
                  <Name text={d.upset!.tournamentName} width={width - 44} max={32} />
                </div>
              </Panel>
            );
          },
        }
      : null,
  ];
  return panels.filter((p): p is PanelSpec => p !== null);
};

const PlayerArcadeStill: React.FC<PlayerRecapProps & { format: StillFormatKey }> = ({ format, ...recap }) => {
  const d = deriveArcade(recap);
  return (
    <StillPage
      format={format}
      height={STILL_FORMATS[format].height}
      header={{
        avatarUrl: d.avatarUrl,
        slot: "1P",
        role: "PLAYER 1",
        prefix: d.prefix,
        tag: d.tag,
        subtitle: `SEASON 2026 · ${d.totalTournaments} TOURNAMENTS · ${d.totalSets} SETS`,
      }}
      panels={playerPanels(d)}
    />
  );
};

export const PLAYER_ARCADE_STILL_COMPONENTS = Object.fromEntries(
  STILL_FORMAT_KEYS.map((key) => {
    const Component: React.FC<PlayerRecapProps> = (recap) => <PlayerArcadeStill {...recap} format={key} />;
    return [key, Component];
  }),
) as Record<StillFormatKey, React.FC<PlayerRecapProps>>;

export const playerArcadeStillId = (key: StillFormatKey) => `ArcadePlayerStill-${stillIdSuffix(key)}`;

export const PlayerArcadeStills: React.FC = () => (
  <>
    {STILL_FORMAT_KEYS.map((key) => (
      <Still
        key={key}
        id={playerArcadeStillId(key)}
        component={PLAYER_ARCADE_STILL_COMPONENTS[key]}
        width={STILL_FORMATS[key].width}
        height={STILL_FORMATS[key].height}
        defaultProps={licanePlayerRecap}
      />
    ))}
  </>
);
