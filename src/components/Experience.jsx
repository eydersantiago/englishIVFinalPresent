import {
  CameraControls,
  Dodecahedron,
  Environment,
  Grid,
  MeshDistortMaterial,
  RenderTexture,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import { slideAtom } from "./Overlay";
import { Scene } from "./Scene";

export const scenes = [
  {
    path: "models/datacenter_scene.glb", // You'll need to provide these models
    mainColor: "#3B82F6",
    name: "Impacto Ambiental",
    description: "Centros de datos tradicionales vs Cloud Computing",
    stats: {
      energy: "1%",
      label: "Consumo eléctrico mundial"
    }
  },
  {
    path: "models/energy_scene.glb",
    mainColor: "#EF4444",
    name: "Consumo Energético",
    description: "Entre 2010-2018: Instancias +550%, Energía +6%",
    stats: {
      energy: "550%",
      label: "Crecimiento de instancias"
    }
  },
  {
    path: "models/efficiency_scene.glb",
    mainColor: "#10B981",
    name: "Eficiencia PUE",
    description: "Cloud: 1.09-1.18 vs On-premises: 1.8",
    stats: {
      energy: "1.09",
      label: "PUE Cloud (Google)"
    }
  },
  {
    path: "models/emissions_scene.glb",
    mainColor: "#F59E0B",
    name: "Emisiones CO₂e",
    description: "AWS: 4.52 | Microsoft: 4.92 | Google: 5.25 kg CO₂e/TB año",
    stats: {
      energy: "4.52",
      label: "kg CO₂e/TB año (AWS)"
    }
  },
  {
    path: "models/small_business_scene.glb",
    mainColor: "#8B5CF6",
    name: "Pequeñas Empresas",
    description: "Reducción de emisiones > 60% al migrar a la nube",
    stats: {
      energy: "60%",
      label: "Reducción emisiones"
    }
  },
  {
    path: "models/medium_business_scene.glb",
    mainColor: "#EC4899",
    name: "Empresas Medianas",
    description: "Modelo híbrido óptimo: reducción 40-50% emisiones",
    stats: {
      energy: "45%",
      label: "Reducción promedio"
    }
  },
  {
    path: "models/large_corp_scene.glb",
    mainColor: "#14B8A6",
    name: "Grandes Corporaciones",
    description: "Con energía renovable igualan eficiencia de la nube",
    stats: {
      energy: "100%",
      label: "Potencial renovable"
    }
  },
  {
    path: "models/recommendations_scene.glb",
    mainColor: "#84CC16",
    name: "Recomendaciones",
    description: "Estrategias para la sostenibilidad digital",
    stats: {
      energy: "4",
      label: "Estrategias clave"
    }
  },
];

const CameraHandler = ({ slideDistance }) => {
  const viewport = useThree((state) => state.viewport);
  const cameraControls = useRef();
  const [slide] = useAtom(slideAtom);
  const lastSlide = useRef(0);

  const { dollyDistance } = useControls({
    dollyDistance: {
      value: 10,
      min: 0,
      max: 50,
    },
  });

  const moveToSlide = async () => {
    await cameraControls.current.setLookAt(
      lastSlide.current * (viewport.width + slideDistance),
      3,
      dollyDistance,
      lastSlide.current * (viewport.width + slideDistance),
      0,
      0,
      true
    );
    await cameraControls.current.setLookAt(
      (slide + 1) * (viewport.width + slideDistance),
      1,
      dollyDistance,
      slide * (viewport.width + slideDistance),
      0,
      0,
      true
    );

    await cameraControls.current.setLookAt(
      slide * (viewport.width + slideDistance),
      0,
      5,
      slide * (viewport.width + slideDistance),
      0,
      0,
      true
    );
  };

  useEffect(() => {
    // Used to reset the camera position when the viewport changes
    const resetTimeout = setTimeout(() => {
      cameraControls.current.setLookAt(
        slide * (viewport.width + slideDistance),
        0,
        5,
        slide * (viewport.width + slideDistance),
        0,
        0
      );
    }, 200);
    return () => clearTimeout(resetTimeout);
  }, [viewport]);

  useEffect(() => {
    if (lastSlide.current === slide) {
      return;
    }
    moveToSlide();
    lastSlide.current = slide;
  }, [slide]);
  return (
    <CameraControls
      ref={cameraControls}
      touches={{
        one: 0,
        two: 0,
        three: 0,
      }}
      mouseButtons={{
        left: 0,
        middle: 0,
        right: 0,
      }}
    />
  );
};

export const Experience = () => {
  const viewport = useThree((state) => state.viewport);
  const { slideDistance } = useControls({
    slideDistance: {
      value: 1,
      min: 0,
      max: 10,
    },
  });
  return (
    <>
      <ambientLight intensity={0.2} />
      <Environment preset={"city"} />
      <CameraHandler slideDistance={slideDistance} />
      {/* MAIN WORLD */}
      <group>
        <mesh position-y={viewport.height / 2 + 1.5}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={scenes[0].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={viewport.width + slideDistance}
          position-y={viewport.height / 2 + 1.5}
        >
          <boxGeometry />
          <MeshDistortMaterial color={scenes[1].mainColor} speed={3} />
        </mesh>

        <Dodecahedron
          position-x={2 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <MeshDistortMaterial color={scenes[2].mainColor} speed={3} />
        </Dodecahedron>

        <mesh
          position-x={3 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <MeshDistortMaterial color={scenes[3].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={4 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={scenes[4].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={5 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <boxGeometry />
          <MeshDistortMaterial color={scenes[5].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={6 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <MeshDistortMaterial color={scenes[6].mainColor} speed={3} />
        </mesh>

        <Dodecahedron
          position-x={7 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <MeshDistortMaterial color={scenes[7].mainColor} speed={3} />
        </Dodecahedron>
      </group>

      <Grid
        position-y={-viewport.height / 2}
        sectionSize={1}
        sectionColor={"purple"}
        sectionThickness={1}
        cellSize={0.5}
        cellColor={"#6f6f6f"}
        cellThickness={0.6}
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
      />
      {scenes.map((scene, index) => (
        <mesh
          key={index}
          position={[index * (viewport.width + slideDistance), 0, 0]}
        >
          <planeGeometry args={[viewport.width, viewport.height]} />
          <meshBasicMaterial toneMapped={false}>
            <RenderTexture attach="map">
              <Scene {...scene} />
            </RenderTexture>
          </meshBasicMaterial>
        </mesh>
      ))}
    </>
  );
};