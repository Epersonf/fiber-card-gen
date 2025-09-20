// src/components/StudioPanel.tsx
import Panel from "./ui/panel/Panel";
import HairClumpingSection from "./studio/sections/HairClumpingSection";
import HairColorSection from "./studio/sections/HairColorSection";
import HairCurlSection from "./studio/sections/HairCurlSection";
import HairFrizzSection from "./studio/sections/HairFrizzSection";
import HairLengthSection from "./studio/sections/HairLengthSection";
import HairlineShapeSection from "./studio/sections/HairlineShapeSection";
import HairSpreadSection from "./studio/sections/HairSpreadSection";
import HairStrandThicknessSection from "./studio/sections/HairStrandThicknessSection";
import ReduceHairSection from "./studio/sections/ReduceHairSection";
import RenderOptionsSection from "./studio/sections/RenderOptionsSection";
import SpawnAmountSection from "./studio/sections/SpawnAmountSection";
import StrandPointsSection from "./studio/sections/StrandPointsSection";
import LightsPanelSection from "./studio/LightsPanelSection";

export default function StudioPanel() {
  return (
    <Panel>
      <div className="studio-panel">
        <RenderOptionsSection />
        <SpawnAmountSection />
        <StrandPointsSection />
        <HairColorSection />
        <HairStrandThicknessSection />
        <HairLengthSection />
        <HairSpreadSection />
        <HairClumpingSection />
        <HairlineShapeSection />
        <HairFrizzSection />
        <ReduceHairSection />
        <HairCurlSection />
        <LightsPanelSection />
      </div>
    </Panel>
  );
}
