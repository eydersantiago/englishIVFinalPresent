import {
  AccumulativeShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
  RandomizedLight,
  Sphere,
  useGLTF,
  Box,
  Text,
  Float,
  MeshDistortMaterial,
} from "@react-three/drei";

import * as THREE from "three";

import React, { useEffect } from "react";
import { DEG2RAD } from "three/src/math/MathUtils";

export const Scene = ({ mainColor, path, name, stats, ...props }) => {
  // Since we don't have the actual 3D models, we'll create procedural content
  const ratioScale = Math.min(1.2, Math.max(0.5, window.innerWidth / 1920));
  
  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <group {...props} dispose={null}>
        <PerspectiveCamera makeDefault position={[3, 3, 8]} near={0.5} />
        <OrbitControls
          autoRotate
          enablePan={false}
          maxPolarAngle={DEG2RAD * 75}
          minDistance={6}
          maxDistance={10}
          autoRotateSpeed={0.5}
        />
        
        {/* Procedural 3D content based on slide */}
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <group scale={ratioScale}>
            {/* Main shape based on slide content */}
            {name === "Impacto Ambiental" && (
              <Sphere args={[2, 32, 32]}>
                <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
              </Sphere>
            )}
            
            {name === "Consumo Energético" && (
              <Box args={[3, 3, 3]}>
                <MeshDistortMaterial color={mainColor} speed={2} distort={0.2} />
              </Box>
            )}
            
            {name === "Eficiencia PUE" && (
              <mesh>
                <torusGeometry args={[2, 0.8, 16, 100]} />
                <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
              </mesh>
            )}
            
            {name === "Emisiones CO₂e" && (
              <mesh>
                <dodecahedronGeometry args={[2]} />
                <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
              </mesh>
            )}
            
            {(name === "Pequeñas Empresas" || name === "Empresas Medianas" || name === "Grandes Corporaciones") && (
              <group>
                <Box args={[2, 3, 1]} position={[0, 0, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={2} distort={0.2} />
                </Box>
                <Box args={[1.5, 2, 0.8]} position={[0, 2, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={2} distort={0.2} />
                </Box>
                <Box args={[1, 1.5, 0.6]} position={[0, 3.5, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={2} distort={0.2} />
                </Box>
              </group>
            )}
            
            {name === "Recomendaciones" && (
              <group>
                <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
                </Sphere>
                <Box args={[0.5, 3, 0.5]} position={[2, 0, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={1} distort={0.1} />
                </Box>
                <Box args={[0.5, 3, 0.5]} position={[-2, 0, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={1} distort={0.1} />
                </Box>
                <Box args={[0.5, 3, 0.5]} position={[0, 0, 2]}>
                  <MeshDistortMaterial color={mainColor} speed={1} distort={0.1} />
                </Box>
                <Box args={[0.5, 3, 0.5]} position={[0, 0, -2]}>
                  <MeshDistortMaterial color={mainColor} speed={1} distort={0.1} />
                </Box>
              </group>
            )}
            
            {/* 3D Text for stats */}
            <Text
              position={[0, -3, 0]}
              fontSize={0.5}
              color={mainColor}
              anchorX="center"
              anchorY="middle"
              font="/fonts/helvetiker_regular.typeface.json"
            >
              {stats?.energy || ""}
            </Text>
          </group>
        </Float>
        
        <ambientLight intensity={0.1} color="pink" />
        <AccumulativeShadows
          frames={100}
          alphaTest={0.9}
          scale={30}
          position={[0, -0.005, 0]}
          color="pink"
          opacity={0.8}
        >
          <RandomizedLight
            amount={4}
            radius={9}
            intensity={0.8}
            ambient={0.25}
            position={[10, 5, 15]}
          />
          <RandomizedLight
            amount={4}
            radius={5}
            intensity={0.5}
            position={[-5, 5, 15]}
            bias={0.001}
          />
        </AccumulativeShadows>
        <Environment blur={0.8} background>
          <Sphere scale={15}>
            <meshBasicMaterial color={mainColor} side={THREE.BackSide} />
          </Sphere>
          <Lightformer
            position={[5, 0, -5]}
            form="rect"
            intensity={1}
            color="red"
            scale={[3, 5]}
            target={[0, 0, 0]}
          />

          <Lightformer
            position={[-5, 0, 1]}
            form="circle"
            intensity={1}
            color="green"
            scale={[2, 5]}
            target={[0, 0, 0]}
          />

          <Lightformer
            position={[0, 5, -2]}
            form="ring"
            intensity={0.5}
            color="orange"
            scale={[10, 5]}
            target={[0, 0, 0]}
          />
          <Lightformer
            position={[0, 0, 5]}
            form="rect"
            intensity={1}
            color="purple"
            scale={[10, 5]}
            target={[0, 0, 0]}
          />
        </Environment>
      </group>
    </>
  );
};