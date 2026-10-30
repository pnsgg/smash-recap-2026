import { useLayout } from "../layout";

/**
 * A scene's content column, laid out in flow so it reframes per cabinet: top-aligned under the
 * header on the wide glass (`wideTop` px down), centred in the taller square and vertical glass.
 * Children keep their place while hidden (opacity, not unmounting), so nothing reflows mid-shot.
 */
export const SceneColumn: React.FC<{
  children: React.ReactNode;
  gap?: number;
  wideTop?: number;
  bottom?: number;
  style?: React.CSSProperties;
}> = ({ children, gap = 40, wideTop = 46, bottom, style }) => {
  const { column, narrow } = useLayout();
  const end = bottom ?? column.bottom;

  return (
    <div
      style={{
        position: "absolute",
        left: column.left,
        width: column.width,
        top: column.top,
        height: end - column.top,
        display: "flex",
        flexDirection: "column",
        justifyContent: narrow ? "center" : "flex-start",
        paddingTop: narrow ? 0 : wideTop,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
