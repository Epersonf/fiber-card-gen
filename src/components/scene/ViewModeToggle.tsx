import DSButton from "../ui/ds-button/DSButton";

type Props = {
  viewMode: '2D' | '3D';
  setViewMode: (mode: '2D' | '3D') => void;
};

export default function ViewModeToggle({ viewMode, setViewMode }: Props) {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translate(-50%, 0%)',
      zIndex: 1000
    }}>
      <DSButton onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}>
        {viewMode === '2D' ? '3D View' : '2D View'}
      </DSButton>
    </div>
  );
}