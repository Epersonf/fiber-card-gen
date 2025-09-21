import DSButton from "../ui/ds-button/DSButton";
import Toolbar from "../ui/toolbar/Toolbar";
import { useStudio } from "../../store/studio.store";

type Props = {
  onRenderColor: () => void;
  onRenderNormal: () => void;
  viewMode: '2D' | '3D';
  setViewMode: (mode: '2D' | '3D') => void;
};

export default function RenderToolbar({ onRenderColor, onRenderNormal, viewMode, setViewMode }: Props) {
  const copyConfig = async () => {
    // pega o estado e remove as funções da store
    const { set, addLight, updateLight, removeLight, ...cfg } = useStudio.getState() as any;
    const json = JSON.stringify(cfg, null, 2);

    try {
      await navigator.clipboard.writeText(json);
    } catch {
      // fallback (execCommand) pra navegadores antigos
      const ta = document.createElement("textarea");
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <Toolbar>
      <DSButton onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}>
        {viewMode === '2D' ? '3D View' : '2D View'}
      </DSButton>
      <DSButton onClick={onRenderColor}>Render Color</DSButton>
      <DSButton onClick={onRenderNormal}>Render Normal</DSButton>
      <DSButton onClick={copyConfig}>Copy Config</DSButton>
    </Toolbar>
  );
}
