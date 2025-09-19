import DSButton from "../ui/ds-button/DSButton";
import Toolbar from "../ui/toolbar/Toolbar";

type Props = {
  onRenderColor: () => void;
  onRenderNormal: () => void;
};

export default function RenderToolbar({ onRenderColor, onRenderNormal }: Props) {
  return (
    <Toolbar>
      <DSButton onClick={onRenderColor}>Render Color</DSButton>
      <DSButton onClick={onRenderNormal}>Render Normal</DSButton>
    </Toolbar>
  );
}
