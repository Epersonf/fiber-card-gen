import DSButton from "../ui/ds-button/DSButton";
import Toolbar from "../ui/toolbar/Toolbar";
import { useStudio } from "../../store/studio.store";
import { Image, ArrowUp, ArrowDown, Layout } from "lucide-react";
import ContextMenu from "../ui/context-menu/ContextMenu";
import { ExportUtils } from "../../utils/export.utils";

type Props = {
  onRenderColor: () => void;
  onRenderNormal: () => void;
  onExportGLB?: () => void;
  viewMode: '2D' | '3D';
  setViewMode: (mode: '2D' | '3D') => void;
};

export default function RenderToolbar({ onRenderColor, onRenderNormal, onExportGLB, viewMode, setViewMode }: Props) {
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
    ExportUtils.downloadText('hair-config.json', json, 'application/json');
  };

  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const { importConfig: storeImport } = useStudio.getState() as any;
        if (typeof storeImport === 'function') {
          storeImport(parsed);
        } else {
          console.warn('store.importConfig not available');
        }
      } catch (err) {
        console.error('Failed to import config', err);
        alert('Failed to import config: ' + (err as any).message);
      }
    };
    input.click();
  };

  return (
    <Toolbar>
      <DSButton onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Layout size={16} style={{ marginRight: 8 }} />
          {viewMode === '2D' ? '3D View' : '2D View'}
        </span>
      </DSButton>
      <ContextMenu
        trigger={(
          <DSButton>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Image size={16} style={{ marginRight: 8 }} />
              Render
            </span>
          </DSButton>
        )}
        align="right"
        items={[
          { key: 'color', label: 'Render Color', onClick: onRenderColor },
          { key: 'normal', label: 'Render Normal', onClick: onRenderNormal },
        ]}
      />
      <ContextMenu
        trigger={(
          <DSButton>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <ArrowDown size={16} style={{ marginRight: 8 }} />
              Import
            </span>
          </DSButton>
        )}
        align="right"
        items={[
          { key: 'file', label: 'Import Config', onClick: importConfig },
          { key: 'clipboard', label: 'Apply from clipboard', onClick: async () => {
            try {
              if (!navigator.clipboard || !navigator.clipboard.readText) {
                alert('Clipboard API not available');
                return;
              }
              const text = await navigator.clipboard.readText();
              if (!text) {
                alert('Clipboard is empty');
                return;
              }
              const parsed = JSON.parse(text);
              const { importConfig: storeImport } = useStudio.getState() as any;
              if (typeof storeImport === 'function') {
                storeImport(parsed);
                alert('Config applied from clipboard');
              } else {
                console.warn('store.importConfig not available');
              }
            } catch (err) {
              console.error('Failed to apply from clipboard', err);
              alert('Failed to apply from clipboard: ' + (err as any).message);
            }
          } },
        ]}
      />
      <ContextMenu
        trigger={(
          <DSButton>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <ArrowUp size={16} style={{ marginRight: 8 }} />
              Export
            </span>
          </DSButton>
        )}
        align="right"
        items={[
          { key: 'copy', label: 'Copy Config', onClick: copyConfig },
          { key: 'download', label: 'Download Config', onClick: downloadConfig },
          { key: 'glb', label: 'Export GLB', onClick: () => { if (onExportGLB) onExportGLB(); } },
        ]}
      />
    </Toolbar>
  );
}
