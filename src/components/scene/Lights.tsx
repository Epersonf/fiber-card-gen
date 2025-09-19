export default function Lights() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[0.5, 1, 1]} intensity={0.9} />
    </>
  );
}