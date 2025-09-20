import DSButton from "../ui/ds-button/DSButton";
import Toolbar from "../ui/toolbar/Toolbar";

type Props = {
  onRenderColor: () => void;
  onRenderNormal: () => void;
  viewMode: '2D' | '3D';
  setViewMode: (mode: '2D' | '3D') => void;
};

export default function RenderToolbar({ onRenderColor, onRenderNormal, viewMode, setViewMode }: Props) {
  return (
    <Toolbar>
      <DSButton onClick={onRenderColor}>Render Color</DSButton>
      <DSButton onClick={onRenderNormal}>Render Normal</DSButton>
    </Toolbar>
  );
}