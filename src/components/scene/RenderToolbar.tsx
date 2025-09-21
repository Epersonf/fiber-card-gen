import DSButton from "../ui/ds-button/DSButton";
import Toolbar from "../ui/toolbar/Toolbar";
import { useStudio } from "../../store/studio.store";
import { Image, Layers, Copy, Layout, Download } from "lucide-react";
import ContextMenu from "../ui/context-menu/ContextMenu";

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

  const downloadConfig = () => {
    const { set, addLight, updateLight, removeLight, ...cfg } = useStudio.getState() as any;
    const json = JSON.stringify(cfg, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hair-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Toolbar>
      <DSButton onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Layout size={16} style={{ marginRight: 8 }} />
          {viewMode === '2D' ? '3D View' : '2D View'}
        </span>
      </DSButton>
      <DSButton onClick={onRenderColor}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Image size={16} style={{ marginRight: 8 }} />
          Render Color
        </span>
      </DSButton>
      <DSButton onClick={onRenderNormal}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Layers size={16} style={{ marginRight: 8 }} />
          Render Normal
        </span>
      </DSButton>
      <ContextMenu
        trigger={(
          <DSButton>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Copy size={16} style={{ marginRight: 8 }} />
              Export
            </span>
          </DSButton>
        )}
        align="right"
        items={[
          { key: 'copy', label: 'Copy Config', onClick: copyConfig },
          { key: 'download', label: 'Download Config', onClick: downloadConfig },
          // Export FBX/GLB will be added later
        ]}
      />
    </Toolbar>
  );
}
