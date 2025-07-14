// src/components/EnvironmentalExperience.jsx
import {
  CameraControls,
  Environment,
  Float,
  MeshDistortMaterial,
  Dodecahedron,
  RoundedBox,
  Grid,
  RenderTexture,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useControls } from "leva";
import { useRef, useEffect } from "react";
import { slides } from "./EnvironmentalPresentation";          // <-- ¡re‑usa tu array!
import { slideAtom } from "./Overlay";

/* ----------   CÁMARA CON ANIMACIÓN ENTRE SLIDES ---------- */
const CameraHandler = ({ slideDistance }) => {
  const viewport = useThree((s) => s.viewport);
  const cameraControls = useRef();
  const [slide] = useAtom(slideAtom);
  const last = useRef(0);

  const move = async () => {
    if (last.current === slide) return;
    await cameraControls.current.setLookAt(
      last.current * (viewport.width + slideDistance),
      0,
      5,
      last.current * (viewport.width + slideDistance),
      0,
      0,
      true
    );
    // “viaje” lateral + pequeño dolly
    await cameraControls.current.setLookAt(
      slide * (viewport.width + slideDistance),
      0,
      3,
      slide * (viewport.width + slideDistance),
      0,
      0,
      true
    );
    last.current = slide;
  };

  useEffect(move, [slide]);                 // se dispara cada vez que cambia el átom
  useEffect(() => {                         // corrige al redimensionar viewport
    const id = setTimeout(() =>
      cameraControls.current.setLookAt(
        slide * (viewport.width + slideDistance),
        0,
        5,
        slide * (viewport.width + slideDistance),
        0,
        0
      ), 200);
    return () => clearTimeout(id);
  }, [viewport]);

  return (
    <CameraControls
      ref={cameraControls}
      touches={{ one: 0, two: 0, three: 0 }}
      mouseButtons={{ left: 0, middle: 0, right: 0 }}
    />
  );
};

/* ----------   MESH DECORATIVO SEGÚN slide.meshType ---------- */
const DecorativeMesh = ({ slide }) => {
  const common = { speed: 2, distort: 0.35, color: slide.color };
  switch (slide.meshType) {
    case "sphere":
      return (
        <Float rotationIntensity={1}>
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <MeshDistortMaterial {...common} />
          </mesh>
        </Float>
      );
    case "box":
      return (
        <Float>
          <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.1}>
            <MeshDistortMaterial {...common} />
          </RoundedBox>
        </Float>
      );
    case "torus":
      return (
        <Float>
          <mesh>
            <torusGeometry args={[1, 0.3, 16, 100]} />
            <MeshDistortMaterial {...common} />
          </mesh>
        </Float>
      );
    case "dodecahedron":
    default:
      return (
        <Float>
          <Dodecahedron>
            <MeshDistortMaterial {...common} />
          </Dodecahedron>
        </Float>
      );
  }
};

/* ----------   ENTORNO PRINCIPAL ---------- */
export const EnvironmentalExperience = () => {
  const viewport = useThree((s) => s.viewport);
  const { slideDistance } = useControls({ slideDistance: { value: 1, min: 0, max: 10 } });

  return (
    <>
      <ambientLight intensity={0.2} />
      <Environment preset="city" />

      <CameraHandler slideDistance={slideDistance} />

      {/* Rejilla de suelo opcional */}
      <Grid
        position-y={-viewport.height / 2}
        infiniteGrid
        sectionColor="#6f6f6f"
        cellColor="#4f4f4f"
        fadeDistance={60}
      />

      {/* ----- 1. grupo de meshes (decorativos) ----- */}
      {slides.map((slide, i) => (
        <group
          key={i}
          position={[
            i * (viewport.width + slideDistance),
            viewport.height / 2 + 1.5,
            0,
          ]}
        >
          <DecorativeMesh slide={slide} />
        </group>
      ))}

      {/* ----- 2. plano con textura 2D que contiene tu slide UI ----- */}
      {slides.map((slide, i) => (
        <mesh
          key={`plane-${i}`}
          position={[i * (viewport.width + slideDistance), 0, 0]}
        >
          <planeGeometry args={[viewport.width, viewport.height]} />
          <meshBasicMaterial toneMapped={false}>
            {/* <RenderTexture attach="map">
              {/* Reutilizamos tu Stats + textos 
              <Scene2D slide={slide} index={i} />
            </RenderTexture> */}
          </meshBasicMaterial>
        </mesh>
      ))}
    </>
  );
};

/* Renderiza la parte “plana” (título, subtítulo, texto…) dentro de la textura */
// import { StatsDisplay } from "./EnvironmentalPresentation"; // Exporta este comp en su archivo
// import { Html } from "@react-three/drei";

// const Scene2D = ({ slide, index }) => {
//   return (
//     <Html transform>
//       <div className="flex flex-col items-start justify-center p-10 w-full h-full text-gray-900 font-nunito">
//         <h1 className="text-4xl font-bold mb-2">{slide.title}</h1>
//         <h2 className="text-2xl mb-4 opacity-80">{slide.subtitle}</h2>
//         <p className="whitespace-pre-line text-lg opacity-90">{slide.content}</p>
//         {slide.stats && <StatsDisplay stats={slide.stats} />}
//       </div>
//     </Html>
//   );
// };
