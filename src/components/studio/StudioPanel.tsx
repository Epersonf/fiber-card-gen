// src/components/StudioPanel.tsx
import Panel from "../ui/panel/Panel";
import HairClumpingSection from "./sections/HairClumpingSection";
import HairColorSection from "./sections/HairColorSection";
import HairCurlSection from "./sections/HairCurlSection";
import HairFrizzSection from "./sections/HairFrizzSection";
import HairLengthSection from "./sections/HairLengthSection";
import HairlineShapeSection from "./sections/HairlineShapeSection";
import HairSpreadSection from "./sections/HairSpreadSection";
import HairStrandThicknessSection from "./sections/HairStrandThicknessSection";
import CardOptionsSection from "./sections/CardOptionsSection";
import SpawnAmountSection from "./sections/SpawnAmountSection";
import StrandPointsSection from "./sections/StrandPointsSection";
import LightsPanelSection from "./sections/LightsPanelSection";
import { ExportCameraSection } from "./sections/ExportCameraSection";

export default function StudioPanel() {
  return (
    <Panel>
      <div className="studio-panel">
        <CardOptionsSection />
        <ExportCameraSection />
        <SpawnAmountSection />
        <StrandPointsSection />
        <HairColorSection />
        <HairStrandThicknessSection />
        <HairLengthSection />
        <HairSpreadSection />
        <HairClumpingSection />
        <HairlineShapeSection />
        <HairFrizzSection />
        <HairCurlSection />
        <LightsPanelSection />
      </div>
    </Panel>
  );
}
