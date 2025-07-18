import {
  CameraControls,
  Dodecahedron,
  Environment,
  Grid,
  MeshDistortMaterial,
  RenderTexture,
  Box,
  Sphere,
  Cylinder,
  Cone,
  Cloud,
  Float,
  Text,
} from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import { slideAtom } from "./Overlay";
import { Scene } from "./Scene";
import * as THREE from "three";

export const scenes = [
  {
    path: "models/title_scene.glb",
    mainColor: "#DC143C",
    name: "Environmental impact of data centers and cloud computing",
    description: "Eyder Santiago Suarez Chavez | Code: 2322714",
    stats: {
      energy: "2025",
      label: "Universidad del Valle"
    }
  },
  {
    path: "models/toc_scene.glb",
    mainColor: "#2563EB",
    name: "Table of Contents",
    description: "Scientific Method Structure",
    stats: {
      energy: "8",
      label: "Sections"
    }
  },
  {
    path: "models/keywords_scene.glb",
    mainColor: "#10B981",
    name: "Keywords",
    description: "Key concepts of the research",
    stats: {
      energy: "5",
      label: "Terms"
    }
  },
  {
    path: "models/introduction_scene.glb",
    mainColor: "#8B5CF6",
    name: "Introduction",
    description: "Problem statement and motivation",
    stats: {
      energy: "1%",
      label: "Global energy use"
    }
  },
  {
    path: "models/methods_scene.glb",
    mainColor: "#F59E0B",
    name: "Methods",
    description: "Research design and data sources",
    stats: {
      energy: "3",
      label: "Cloud providers"
    }
  },
  {
    path: "models/results_scene.glb",
    mainColor: "#EF4444",
    name: "Results",
    description: "Key findings and metrics",
    stats: {
      energy: "40%",
      label: "Efficiency gain"
    }
  },
  {
    path: "models/interactive_scene.glb",
    mainColor: "#FF1744",
    name: "Interactive Exploration",
    description: "Explore the differences between infrastructures",
    stats: {
      energy: "→",
      label: "Use arrow keys"
    }
  },
  {
    path: "models/datacenter_scene.glb",
    mainColor: "#3B82F6",
    name: "Environmental Impact",
    description: "Traditional data centers vs Cloud Computing",
    stats: {
      energy: "1%",
      label: "Global electricity consumption"
    }
  },
  {
    path: "models/energy_scene.glb",
    mainColor: "#EF4444",
    name: "Energy Consumption",
    description: "Between 2010-2018: Instances +550%, Energy +6%",
    stats: {
      energy: "550%",
      label: "Instance growth"
    }
  },
  {
    path: "models/efficiency_scene.glb",
    mainColor: "#10B981",
    name: "PUE Efficiency",
    description: "Cloud: 1.09-1.18 vs On-premises: 1.8",
    stats: {
      energy: "1.09",
      label: "Cloud PUE (Google)"
    }
  },
  {
    path: "models/emissions_scene.glb",
    mainColor: "#F59E0B",
    name: "CO₂e Emissions",
    description: "AWS: 4.52 | Microsoft: 4.92 | Google: 5.25 kg CO₂e/TB year",
    stats: {
      energy: "4.52",
      label: "kg CO₂e/TB year (AWS)"
    }
  },
  {
    path: "models/small_business_scene.glb",
    mainColor: "#8B5CF6",
    name: "Small Businesses",
    description: "Emission reduction > 60% when migrating to cloud",
    stats: {
      energy: "60%",
      label: "Emission reduction"
    }
  },
  {
    path: "models/medium_business_scene.glb",
    mainColor: "#EC4899",
    name: "Medium Businesses",
    description: "Optimal hybrid model: 40-50% emission reduction",
    stats: {
      energy: "45%",
      label: "Average reduction"
    }
  },
  {
    path: "models/large_corp_scene.glb",
    mainColor: "#14B8A6",
    name: "Large Corporations",
    description: "With renewable energy they match cloud efficiency",
    stats: {
      energy: "100%",
      label: "Renewable potential"
    }
  },
  {
    path: "models/discussion_scene.glb",
    mainColor: "#DC143C",
    name: "Discussion",
    description: "Analysis and implications of findings",
    stats: {
      energy: "3",
      label: "Key insights"
    }
  },
  {
    path: "models/conclusions_scene.glb",
    mainColor: "#1E40AF",
    name: "Conclusions",
    description: "Final recommendations and future work",
    stats: {
      energy: "5",
      label: "Key takeaways"
    }
  },
  {
    path: "models/recommendations_scene.glb",
    mainColor: "#84CC16",
    name: "Recommendations",
    description: "Strategies for digital sustainability",
    stats: {
      energy: "4",
      label: "Key strategies"
    }
  },
  {
    path: "models/references_scene.glb",
    mainColor: "#6B7280",
    name: "References",
    description: "Scientific sources and citations",
    stats: {
      energy: "15+",
      label: "Sources"
    }
  },

    {
    path: "models/thanks.glb",
    mainColor: "#6B7280",
    name: "Thank you",
    description: "Thanks for your attention!",
    stats: {
      energy: "",
      label: "👋🏻"
    }
  },
];

// Componente para crear humo/emisiones animadas
const SmokeEmitter = ({ position, intensity = 1, color = "#666666" }) => {
  const smokesRef = useRef([]);
  const time = useRef(0);
  
  useFrame((state, delta) => {
    time.current += delta;
    smokesRef.current.forEach((smoke, i) => {
      if (smoke) {
        smoke.position.y += delta * 0.5 * intensity;
        smoke.position.x += Math.sin(time.current + i) * delta * 0.2;
        smoke.position.z += Math.cos(time.current + i) * delta * 0.2;
        smoke.material.opacity = Math.max(0, 1 - (smoke.position.y - position[1]) / 5);
        
        if (smoke.position.y > position[1] + 5) {
          smoke.position.y = position[1];
          smoke.position.x = position[0];
          smoke.position.z = position[2];
        }
      }
    });
  });
  
  return (
    <group position={position}>
      {[...Array(10)].map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => (smokesRef.current[i] = el)}
          args={[0.2 + Math.random() * 0.3]}
          position={[0, i * 0.5, 0]}
        >
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Componente para crear fábricas/edificios industriales
const IndustrialBuilding = ({ position, scale = 1, emissionIntensity = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* Edificio principal */}
      <Box args={[2, 3, 2]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#4a4a4a" />
      </Box>
      {/* Chimeneas */}
      <Cylinder args={[0.3, 0.4, 2]} position={[0.5, 3.5, 0.5]}>
        <meshStandardMaterial color="#2a2a2a" />
      </Cylinder>
      <Cylinder args={[0.3, 0.4, 2.5]} position={[-0.5, 3.75, -0.5]}>
        <meshStandardMaterial color="#2a2a2a" />
      </Cylinder>
      {/* Emisiones */}
      <SmokeEmitter position={[0.5, 4.5, 0.5]} intensity={emissionIntensity} />
      <SmokeEmitter position={[-0.5, 5, -0.5]} intensity={emissionIntensity * 1.2} />
      {/* Texto PUE */}
      <Text position={[0, 0, 1.1]} fontSize={0.3} color="#ff0000">
        PUE: {(1.5 + Math.random() * 0.5).toFixed(2)}
      </Text>
    </group>
  );
};

// Componente para crear árboles
const Tree = ({ position, scale = 1 }) => {
  const treeRef = useRef();
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Tronco */}
      <Cylinder args={[0.2, 0.3, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      {/* Copa del árbol */}
      <Cone args={[1.5, 2.5]} position={[0, 3, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Cone>
      <Sphere args={[1]} position={[0, 3.5, 0]}>
        <meshStandardMaterial color="#32CD32" />
      </Sphere>
    </group>
  );
};

// Componente para crear un centro de datos verde/eficiente
const GreenDataCenter = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* Edificio moderno */}
      <Box args={[3, 2, 3]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#e0e0e0" metalness={0.5} roughness={0.3} />
      </Box>
      {/* Paneles solares en el techo */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          args={[0.8, 0.05, 0.8]}
          position={[(i % 3 - 1) * 0.9, 2.05, Math.floor(i / 3 - 0.5) * 0.9]}
        >
          <meshStandardMaterial color="#1a237e" metalness={0.9} roughness={0.1} />
        </Box>
      ))}
      {/* Texto PUE eficiente */}
      <Text position={[0, 0, 1.6]} fontSize={0.3} color="#00ff00">
        PUE: 1.15
      </Text>
      {/* Indicador de nube */}
      <Cloud
        position={[0, 3.5, 0]}
        segments={20}
        bounds={[2, 0.5, 0.5]}
        volume={3}
        color="#4FC3F7"
        fade={100}
      />
    </group>
  );
};

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
      
      {/* MUNDO PRINCIPAL con ambiente industrial */}
      <group>
        {/* Elementos de fondo entre diapositivas */}
        {scenes.map((_, index) => (
          <group key={`bg-${index}`}>
            {/* Fábricas contaminantes a la izquierda */}
            <IndustrialBuilding
              position={[
                index * (viewport.width + slideDistance) - viewport.width / 2 - 3,
                -viewport.height / 2,
                -5
              ]}
              scale={0.8}
              emissionIntensity={1.5}
            />
            
            {/* Más edificios industriales */}
            <IndustrialBuilding
              position={[
                index * (viewport.width + slideDistance) - viewport.width / 2 - 6,
                -viewport.height / 2,
                -8
              ]}
              scale={0.6}
              emissionIntensity={1.2}
            />
            
            {/* Centros de datos eficientes a la derecha */}
            <GreenDataCenter
              position={[
                index * (viewport.width + slideDistance) + viewport.width / 2 + 3,
                -viewport.height / 2,
                -5
              ]}
              scale={0.8}
            />
            
            {/* Árboles dispersos */}
            <Tree
              position={[
                index * (viewport.width + slideDistance) + viewport.width / 2 + 6,
                -viewport.height / 2,
                -7
              ]}
              scale={0.7}
            />
            <Tree
              position={[
                index * (viewport.width + slideDistance) - viewport.width / 2 + 1,
                -viewport.height / 2,
                -6
              ]}
              scale={0.5}
            />
            
            {/* Nubes de contaminación flotantes */}
            {index % 2 === 0 && (
              <Float speed={1} rotationIntensity={0} floatIntensity={2}>
                <Cloud
                  position={[
                    index * (viewport.width + slideDistance),
                    viewport.height / 2 - 1,
                    -10
                  ]}
                  segments={40}
                  bounds={[10, 2, 2]}
                  volume={10}
                  color="#666666"
                  opacity={0.5}
                  fade={100}
                />
              </Float>
            )}
          </group>
        ))}
        
        {/* Formas 3D principales en el centro superior (como en el original) */}
        <mesh position-y={viewport.height / 2 + 1.5}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={scenes[0].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={viewport.width + slideDistance}
          position-y={viewport.height / 2 + 1.5}
        >
          <icosahedronGeometry args={[1, 0]} />
          <MeshDistortMaterial color={scenes[1].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={2 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={scenes[2].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={3 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <boxGeometry />
          <MeshDistortMaterial color={scenes[3].mainColor} speed={3} />
        </mesh>

        <Dodecahedron
          position-x={4 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <MeshDistortMaterial color={scenes[4].mainColor} speed={3} />
        </Dodecahedron>

        <mesh
          position-x={5 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <MeshDistortMaterial color={scenes[5].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={6 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={scenes[6].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={7 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <boxGeometry />
          <MeshDistortMaterial color={scenes[7].mainColor} speed={3} />
        </mesh>

        <mesh
          position-x={8 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <MeshDistortMaterial color={scenes[8].mainColor} speed={3} />
        </mesh>

        <Dodecahedron
          position-x={9 * (viewport.width + slideDistance)}
          position-y={viewport.height / 2 + 1.5}
        >
          <MeshDistortMaterial color={scenes[9].mainColor} speed={3} />
        </Dodecahedron>
      </group>

      {/* Grid con colores más industriales */}
      <Grid
        position-y={-viewport.height / 2}
        sectionSize={1}
        sectionColor={"#666666"}
        sectionThickness={1}
        cellSize={0.5}
        cellColor={"#4a4a4a"}
        cellThickness={0.6}
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
      />
      
      {/* Renderizado de las escenas principales */}
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