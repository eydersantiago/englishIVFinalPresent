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
  Cylinder,
  Torus,
  Cone,
  RoundedBox,
  Cloud,
  Stars,
} from "@react-three/drei";

import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import { DEG2RAD } from "three/src/math/MathUtils";
import { useFrame } from "@react-three/fiber";

// Componente para crear un servidor rack
const ServerRack = ({ position, scale = 1, color }) => {
  return (
    <group position={position} scale={scale}>
      {/* Estructura principal del rack */}
      <Box args={[2, 3, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color || "#2a2a2a"} metalness={0.8} roughness={0.2} />
      </Box>
      {/* Servidores individuales */}
      {[...Array(6)].map((_, i) => (
        <Box key={i} args={[1.8, 0.4, 0.8]} position={[0, -1.2 + i * 0.5, 0.1]}>
          <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.3} />
          {/* LEDs de estado */}
          <mesh position={[0.8, 0, 0.5]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#00ff00" : "#ff0000"} />
          </mesh>
        </Box>
      ))}
    </group>
  );
};

// Componente para crear un edificio de centro de datos
const DataCenterBuilding = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[4, 2, 3]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.7} />
      </RoundedBox>
      {/* Ventanas */}
      {[...Array(8)].map((_, i) => (
        <Box key={i} args={[0.3, 0.6, 0.1]} position={[-1.5 + (i % 4) * 1, 0.5 - Math.floor(i / 4) * 0.8, 1.51]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
        </Box>
      ))}
      {/* Sistema de refrigeración en el techo */}
      <Cylinder args={[0.3, 0.3, 0.5]} position={[1, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.5} />
      </Cylinder>
      <Cylinder args={[0.3, 0.3, 0.5]} position={[-1, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.5} />
      </Cylinder>
    </group>
  );
};

// Componente para crear una nube (representando cloud computing)
const CloudServer = ({ position, scale = 1, color }) => {
  const ref = useRef();
  
  useFrame((state) => {
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
  });
  
  return (
    <group ref={ref} position={position} scale={scale}>
      <Cloud
        segments={20}
        bounds={[3, 1, 1]}
        volume={6}
        color={color}
        fade={100}
      />
      {/* Datos fluyendo */}
      <group>
        {[...Array(5)].map((_, i) => (
          <Box key={i} args={[0.1, 0.3, 0.1]} position={[i * 0.5 - 1, -0.5 - i * 0.2, 0]}>
            <meshBasicMaterial color="#00ff00" opacity={0.6} transparent />
          </Box>
        ))}
      </group>
    </group>
  );
};

// Componente para mostrar métricas de eficiencia
const EfficiencyMeter = ({ position, scale = 1, value, maxValue = 2 }) => {
  const angle = (value / maxValue) * Math.PI;
  
  return (
    <group position={position} scale={scale}>
      {/* Base del medidor */}
      <Torus args={[1, 0.1, 8, 32, Math.PI]} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial color="#333333" />
      </Torus>
      {/* Indicador */}
      <group rotation={[0, 0, -angle]}>
        <Cylinder args={[0.05, 0.05, 1.2]} position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#ff0000" />
        </Cylinder>
        <Cone args={[0.1, 0.2]} position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <meshStandardMaterial color="#ff0000" />
        </Cone>
      </group>
      {/* Texto del valor */}
      <Text position={[0, -0.5, 0]} fontSize={0.3} color="#000000">
        PUE: {value}
      </Text>
    </group>
  );
};

// Componente para representar emisiones de CO2
const CO2Emissions = ({ position, scale = 1, intensity = 1 }) => {
  const particlesRef = useRef();
  
  useFrame((state) => {
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    particlesRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
  });
  
  return (
    <group position={position} scale={scale}>
      {/* Chimenea */}
      <Cylinder args={[0.3, 0.5, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#666666" />
      </Cylinder>
      {/* Partículas de CO2 */}
      <group ref={particlesRef}>
        {[...Array(20)].map((_, i) => (
          <Sphere
            key={i}
            args={[0.1 + Math.random() * 0.1]}
            position={[
              Math.random() * 2 - 1,
              1 + i * 0.3,
              Math.random() * 2 - 1
            ]}
          >
            <meshStandardMaterial
              color="#666666"
              opacity={0.3 - i * 0.01}
              transparent
            />
          </Sphere>
        ))}
      </group>
    </group>
  );
};

// Componente para representar energía renovable
const RenewableEnergy = ({ position, scale = 1 }) => {
  const bladesRef = useRef();
  
  useFrame((state) => {
    bladesRef.current.rotation.z = state.clock.elapsedTime * 2;
  });
  
  return (
    <group position={position} scale={scale}>
      {/* Torre */}
      <Cylinder args={[0.1, 0.2, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Cylinder>
      {/* Aspas */}
      <group ref={bladesRef} position={[0, 1.5, 0]}>
        {[0, 120, 240].map((angle, i) => (
          <Box
            key={i}
            args={[0.05, 1, 0.2]}
            position={[0, 0.5, 0]}
            rotation={[0, 0, (angle * Math.PI) / 180]}
          >
            <meshStandardMaterial color="#ffffff" />
          </Box>
        ))}
      </group>
    </group>
  );
};

export const Scene = ({ mainColor, path, name, stats, ...props }) => {
  const ratioScale = Math.min(1.2, Math.max(0.5, window.innerWidth / 1920));
  
  return (
    <>
      <color attach="background" args={["#f0f4f8"]} />
      <fog attach="fog" args={["#f0f4f8", 10, 50]} />
      
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
        
        {/* Contenido 3D específico para cada slide */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group scale={ratioScale}>
            
            {/* Slide 1: Impacto Ambiental - Comparación datacenter vs cloud */}
            {name === "Impacto Ambiental" && (
              <group>
                {/* Centro de datos tradicional (izquierda) */}
                <group position={[-2, 0, 0]}>
                  <DataCenterBuilding position={[0, -1, 0]} scale={0.8} />
                  <ServerRack position={[0, 0.5, 0]} scale={0.5} color="#8B4513" />
                  <CO2Emissions position={[0, 1.5, -1]} scale={0.7} intensity={1.5} />
                  <Text position={[0, -2, 0]} fontSize={0.2} color="#666666">
                    On-Premises
                  </Text>
                </group>
                
                {/* Cloud computing (derecha) */}
                <group position={[2, 0, 0]}>
                  <CloudServer position={[0, 0, 0]} scale={1.2} color={mainColor} />
                  <RenewableEnergy position={[1, -1, 0]} scale={0.5} />
                  <Text position={[0, -2, 0]} fontSize={0.2} color="#666666">
                    Cloud Computing
                  </Text>
                </group>
                
                {/* Flecha de comparación */}
                <Cone args={[0.2, 0.5]} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <meshStandardMaterial color={mainColor} />
                </Cone>
              </group>
            )}
            
            {/* Slide 2: Consumo Energético - Gráfico de crecimiento */}
            {name === "Consumo Energético" && (
              <group>
                {/* Barras de gráfico 3D */}
                <group position={[-2, -1, 0]}>
                  {/* Barra 2010 */}
                  <Box args={[0.8, 1, 0.8]} position={[0, 0.5, 0]}>
                    <meshStandardMaterial color="#ff6b6b" />
                  </Box>
                  <Text position={[0, -0.5, 0]} fontSize={0.15} color="#000000">
                    2010
                  </Text>
                </group>
                
                <group position={[0, -1, 0]}>
                  {/* Barra 2018 - Instancias */}
                  <Box args={[0.8, 5.5, 0.8]} position={[0, 2.75, 0]}>
                    <meshStandardMaterial color={mainColor} />
                  </Box>
                  <Text position={[0, -0.5, 0]} fontSize={0.15} color="#000000">
                    Instancias
                  </Text>
                  <Text position={[0, 6, 0]} fontSize={0.2} color={mainColor}>
                    +550%
                  </Text>
                </group>
                
                <group position={[2, -1, 0]}>
                  {/* Barra 2018 - Energía */}
                  <Box args={[0.8, 1.06, 0.8]} position={[0, 0.53, 0]}>
                    <meshStandardMaterial color="#4ecdc4" />
                  </Box>
                  <Text position={[0, -0.5, 0]} fontSize={0.15} color="#000000">
                    Energía
                  </Text>
                  <Text position={[0, 1.5, 0]} fontSize={0.2} color="#4ecdc4">
                    +6%
                  </Text>
                </group>
                
                {/* Rayos representando energía */}
                <Cone args={[0.3, 1]} position={[-1, 3, 0]} rotation={[0, 0, Math.PI]}>
                  <meshBasicMaterial color="#ffeb3b" />
                </Cone>
                <Cone args={[0.3, 1]} position={[1, 3, 0]} rotation={[0, 0, Math.PI]}>
                  <meshBasicMaterial color="#ffeb3b" />
                </Cone>
              </group>
            )}
            
            {/* Slide 3: Eficiencia PUE - Medidores comparativos */}
            {name === "Eficiencia PUE" && (
              <group>
                {/* Medidor Cloud */}
                <group position={[-2, 0, 0]}>
                  <EfficiencyMeter position={[0, 0, 0]} value={1.09} />
                  <CloudServer position={[0, 2, 0]} scale={0.8} color={mainColor} />
                  <Text position={[0, -1.5, 0]} fontSize={0.2} color="#00ff00">
                    Cloud: 1.09-1.18
                  </Text>
                </group>
                
                {/* Medidor On-premises */}
                <group position={[2, 0, 0]}>
                  <EfficiencyMeter position={[0, 0, 0]} value={1.8} />
                  <DataCenterBuilding position={[0, 2, 0]} scale={0.5} />
                  <Text position={[0, -1.5, 0]} fontSize={0.2} color="#ff0000">
                    On-premises: 1.8
                  </Text>
                </group>
                
                {/* Símbolo de eficiencia en el centro */}
                <Torus args={[0.5, 0.2, 16, 100]} position={[0, 0, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
                </Torus>
              </group>
            )}
            
            {/* Slide 4: Emisiones CO₂e - Comparación de proveedores */}
            {name === "Emisiones CO₂e" && (
              <group>
                {/* AWS */}
                <group position={[-2.5, 0, 0]}>
                  <Cylinder args={[0.5, 0.5, 4.52 * 0.5]} position={[0, -1 + 4.52 * 0.25, 0]}>
                    <meshStandardMaterial color="#ff9500" />
                  </Cylinder>
                  <Text position={[0, 1.5, 0]} fontSize={0.2} color="#ff9500">
                    AWS
                  </Text>
                  <Text position={[0, 1, 0]} fontSize={0.15} color="#666666">
                    4.52 kg
                  </Text>
                  <CO2Emissions position={[0, 2, 0]} scale={0.4} intensity={0.9} />
                </group>
                
                {/* Microsoft */}
                <group position={[0, 0, 0]}>
                  <Cylinder args={[0.5, 0.5, 4.92 * 0.5]} position={[0, -1 + 4.92 * 0.25, 0]}>
                    <meshStandardMaterial color="#0078d4" />
                  </Cylinder>
                  <Text position={[0, 1.7, 0]} fontSize={0.2} color="#0078d4">
                    Azure
                  </Text>
                  <Text position={[0, 1.2, 0]} fontSize={0.15} color="#666666">
                    4.92 kg
                  </Text>
                  <CO2Emissions position={[0, 2.2, 0]} scale={0.4} intensity={1} />
                </group>
                
                {/* Google */}
                <group position={[2.5, 0, 0]}>
                  <Cylinder args={[0.5, 0.5, 5.25 * 0.5]} position={[0, -1 + 5.25 * 0.25, 0]}>
                    <meshStandardMaterial color="#4285f4" />
                  </Cylinder>
                  <Text position={[0, 1.8, 0]} fontSize={0.2} color="#4285f4">
                    Google
                  </Text>
                  <Text position={[0, 1.3, 0]} fontSize={0.15} color="#666666">
                    5.25 kg
                  </Text>
                  <CO2Emissions position={[0, 2.3, 0]} scale={0.4} intensity={1.1} />
                </group>
                
                {/* Texto CO₂e/TB año */}
                <Text position={[0, -2, 0]} fontSize={0.18} color="#000000">
                  CO₂e/TB año
                </Text>
              </group>
            )}
            
            {/* Slide 5: Pequeñas Empresas */}
            {name === "Pequeñas Empresas" && (
              <group>
                {/* Edificio pequeño */}
                <Box args={[1.5, 1, 1]} position={[-1.5, 0, 0]}>
                  <meshStandardMaterial color="#e74c3c" />
                </Box>
                <Text position={[-1.5, -1, 0]} fontSize={0.15} color="#666666">
                  {"<100 empleados"}
                </Text>
                
                {/* Flecha hacia la nube */}
                <group position={[0, 0, 0]}>
                  <Cylinder args={[0.1, 0.1, 2]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color={mainColor} />
                  </Cylinder>
                  <Cone args={[0.2, 0.5]} position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <meshStandardMaterial color={mainColor} />
                  </Cone>
                </group>
                
                {/* Nube con porcentaje de reducción */}
                <group position={[2, 0, 0]}>
                  <CloudServer position={[0, 0, 0]} scale={1} color={mainColor} />
                  <Text position={[0, -1.5, 0]} fontSize={0.25} color="#00ff00">
                    -60%
                  </Text>
                  <Text position={[0, -2, 0]} fontSize={0.15} color="#666666">
                    emisiones
                  </Text>
                </group>
              </group>
            )}
            
            {/* Slide 6: Empresas Medianas */}
            {name === "Empresas Medianas" && (
              <group>
                {/* Modelo híbrido */}
                <group position={[-1.5, 0, 0]}>
                  <Box args={[1.5, 1.5, 1.2]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#f39c12" />
                  </Box>
                  <ServerRack position={[0, 0, 0]} scale={0.3} />
                </group>
                
                {/* Conexión híbrida */}
                <Torus args={[1, 0.1, 8, 32]} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <meshStandardMaterial color={mainColor} />
                </Torus>
                
                {/* Cloud parcial */}
                <group position={[1.5, 0, 0]}>
                  <CloudServer position={[0, 0, 0]} scale={0.8} color={mainColor} />
                </group>
                
                {/* Indicador de reducción */}
                <Text position={[0, -2, 0]} fontSize={0.25} color="#f39c12">
                  -40-50%
                </Text>
                <Text position={[0, -2.5, 0]} fontSize={0.15} color="#666666">
                  Modelo Híbrido
                </Text>
              </group>
            )}
            
            {/* Slide 7: Grandes Corporaciones */}
            {name === "Grandes Corporaciones" && (
              <group>
                {/* Torre corporativa */}
                <group position={[0, 0, 0]}>
                  {[0, 1, 2].map((i) => (
                    <Box key={i} args={[2 - i * 0.3, 1, 1.5 - i * 0.2]} position={[0, i, 0]}>
                      <meshStandardMaterial color={`hsl(${200 + i * 20}, 70%, 50%)`} />
                    </Box>
                  ))}
                </group>
                
                {/* Paneles solares */}
                <group position={[-2, 0, 0]}>
                  {[...Array(4)].map((_, i) => (
                    <Box key={i} args={[0.5, 0.5, 0.05]} position={[i * 0.6 - 0.9, 2.5, 0]} rotation={[Math.PI / 6, 0, 0]}>
                      <meshStandardMaterial color="#1a237e" metalness={0.8} roughness={0.2} />
                    </Box>
                  ))}
                </group>
                
                {/* Turbinas eólicas */}
                <RenewableEnergy position={[2, 0, 0]} scale={0.8} />
                <RenewableEnergy position={[2.5, 0, -1]} scale={0.6} />
                
                {/* Indicador de eficiencia */}
                <Text position={[0, -2, 0]} fontSize={0.2} color="#00ff00">
                  Con renovables = Cloud
                </Text>
              </group>
            )}
            
            {/* Slide 8: Recomendaciones */}
            {name === "Recomendaciones" && (
              <group>
                {/* Núcleo central */}
                <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
                </Sphere>
                
                {/* 4 Estrategias alrededor */}
                {[
                  { pos: [2, 0, 0], icon: "cloud", label: "Migración\nSelectiva" },
                  { pos: [-2, 0, 0], icon: "hybrid", label: "Modelo\nHíbrido" },
                  { pos: [0, 0, 2], icon: "renewable", label: "Energía\nRenovable" },
                  { pos: [0, 0, -2], icon: "efficiency", label: "Optimización\nPUE" }
                ].map((strategy, i) => (
                  <group key={i} position={strategy.pos}>
                    {/* Conexión al centro */}
                    <Cylinder 
                      args={[0.05, 0.05, 2]} 
                      position={[-strategy.pos[0]/2, -strategy.pos[1]/2, -strategy.pos[2]/2]}
                      rotation={[
                        strategy.pos[2] !== 0 ? Math.PI / 2 : 0,
                        0,
                        strategy.pos[0] !== 0 ? Math.PI / 2 : 0
                      ]}
                    >
                      <meshStandardMaterial color="#cccccc" />
                    </Cylinder>
                    
                    {/* Icono de estrategia */}
                    {strategy.icon === "cloud" && <CloudServer position={[0, 0.5, 0]} scale={0.5} color="#4ecdc4" />}
                    {strategy.icon === "hybrid" && (
                      <Torus args={[0.4, 0.1, 8, 32]} position={[0, 0.5, 0]}>
                        <meshStandardMaterial color="#f39c12" />
                      </Torus>
                    )}
                    {strategy.icon === "renewable" && <RenewableEnergy position={[0, 0, 0]} scale={0.4} />}
                    {strategy.icon === "efficiency" && <EfficiencyMeter position={[0, 0.5, 0]} scale={0.5} value={1.1} />}
                    
                    {/* Etiqueta */}
                    <Text position={[0, -0.8, 0]} fontSize={0.12} color="#000000" textAlign="center">
                      {strategy.label}
                    </Text>
                  </group>
                ))}
              </group>
            )}
            
          </group>
        </Float>
        
        {/* Iluminación mejorada */}
        <ambientLight intensity={0.3} color="#ffeaa7" />
        <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.3} color="#74b9ff" />
        
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
        
        <Environment preset="city" blur={0.8}>
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
        </Environment>
      </group>
    </>
  );
};