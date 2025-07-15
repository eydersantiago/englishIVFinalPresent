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
  Image
} from "@react-three/drei";

import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
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
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
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
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      particlesRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
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
    if (bladesRef.current) {
      bladesRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });
  
  return (
    <group position={position} scale={scale}>
      {/* Torre */}
      <Cylinder args={[0.1, 0.2, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Cylinder>
      {/* Centro de las aspas */}
      <Sphere args={[0.15]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#cccccc" />
      </Sphere>
      {/* Aspas mejoradas */}
      <group ref={bladesRef} position={[0, 1.5, 0]}>
        {[0, 120, 240].map((angle, i) => (
          <group key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
            <Box args={[0.1, 1.5, 0.02]} position={[0, 0.75, 0]}>
              <meshStandardMaterial color="#ffffff" />
            </Box>
            {/* Punta del aspa */}
            <Cone args={[0.15, 0.3]} position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
              <meshStandardMaterial color="#ffffff" />
            </Cone>
          </group>
        ))}
      </group>
    </group>
  );
};

// Componente para exploración interactiva de infraestructura
const InteractiveDataCenterExploration = ({ type, position, scale = 1 }) => {
  const [playerPos, setPlayerPos] = useState([0, 0, 0]);
  const playerRef = useRef();
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      const speed = 0.5;
      setPlayerPos(prev => {
        switch(e.key) {
          case 'ArrowUp':
          case 'w':
            return [prev[0], prev[1], prev[2] - speed];
          case 'ArrowDown':
          case 's':
            return [prev[0], prev[1], prev[2] + speed];
          case 'ArrowLeft':
          case 'a':
            return [prev[0] - speed, prev[1], prev[2]];
          case 'ArrowRight':
          case 'd':
            return [prev[0] + speed, prev[1], prev[2]];
          default:
            return prev;
        }
      });
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  if (type === 'traditional') {
    return (
      <group position={position} scale={scale}>
        {/* Piso del data center */}
        <Box args={[10, 0.1, 10]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#333333" />
        </Box>
        
        {/* Filas de servidores */}
        {[-3, -1, 1, 3].map((x, i) => (
          <group key={i}>
            {[-3, -1, 1, 3].map((z, j) => (
              <ServerRack
                key={`${i}-${j}`}
                position={[x * 1.5, 0, z * 1.5]}
                scale={0.6}
                color="#4a4a4a"
              />
            ))}
          </group>
        ))}
        
        {/* Sistema de aire acondicionado ineficiente */}
        <Box args={[10, 0.5, 0.5]} position={[0, 3, -4.75]}>
          <meshStandardMaterial color="#666666" />
        </Box>
        <Text position={[0, 3, -4.25]} fontSize={0.2} color="#ff0000">
          Cooling: High Energy Use
        </Text>
        
        {/* Cables desorganizados */}
        {[...Array(20)].map((_, i) => (
          <Cylinder
            key={i}
            args={[0.02, 0.02, 3 + Math.random() * 2]}
            position={[
              -4 + Math.random() * 8,
              2.5,
              -4 + Math.random() * 8
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <meshStandardMaterial color="#ff0000" />
          </Cylinder>
        ))}
        
        {/* Indicador de jugador */}
        <Cone 
          ref={playerRef}
          args={[0.2, 0.5]} 
          position={[playerPos[0], 0.5, playerPos[2]]}
          rotation={[0, 0, 0]}
        >
          <meshBasicMaterial color="#00ff00" />
        </Cone>
        
        {/* Indicadores de calor/ineficiencia */}
        <pointLight position={[0, 2, 0]} color="#ff6666" intensity={0.5} />
      </group>
    );
  } else {
    // Cloud Infrastructure
    return (
      <group position={position} scale={scale}>
        {/* Piso moderno */}
        <Box args={[10, 0.1, 10]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} />
        </Box>
        
        {/* Servidores optimizados en contenedores */}
        {[-2, 0, 2].map((x, i) => (
          <group key={i} position={[x * 2, 0, 0]}>
            <RoundedBox args={[1.5, 3, 4]} radius={0.1}>
              <meshStandardMaterial 
                color={["#4FC3F7", "#66BB6A", "#FF7043"][i]} 
                metalness={0.5} 
                roughness={0.3}
                opacity={0.9}
                transparent
              />
            </RoundedBox>
            <Text position={[0, 1.7, 2.1]} fontSize={0.15} color="#000000">
              {["AWS", "Azure", "Google"][i]}
            </Text>
          </group>
        ))}
        
        {/* Sistema de refrigeración eficiente */}
        <group position={[0, 3.5, 0]}>
          <Torus args={[3, 0.2, 8, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#4FC3F7" metalness={0.7} />
          </Torus>
          <Text position={[0, 0.5, 0]} fontSize={0.2} color="#00ff00">
            Liquid Cooling System
          </Text>
        </group>
        
        {/* Conexiones de red organizadas */}
        {[-1, 0, 1].map((i) => (
          <Cylinder
            key={i}
            args={[0.05, 0.05, 6]}
            position={[i * 2, 3, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial 
              color="#00ff00" 
              emissive="#00ff00" 
              emissiveIntensity={0.5}
            />
          </Cylinder>
        ))}
        
        {/* Indicador de jugador */}
        <Cone 
          ref={playerRef}
          args={[0.2, 0.5]} 
          position={[playerPos[0], 0.5, playerPos[2]]}
        >
          <meshBasicMaterial color="#00ff00" />
        </Cone>
        
        {/* Efectos de eficiencia */}
        <pointLight position={[0, 3, 0]} color="#66ff66" intensity={0.3} />
        
        {/* Paneles de información flotantes */}
        <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
          <Box args={[1, 0.7, 0.1]} position={[4, 2, 0]}>
            <meshBasicMaterial color="#000000" opacity={0.8} transparent />
          </Box>
          <Text position={[4, 2, 0.1]} fontSize={0.1} color="#00ff00">
            PUE: 1.15{'\n'}
            Efficiency: 95%{'\n'}
            Carbon: -40%
          </Text>
        </Float>
      </group>
    );
  }
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
            
            {/* Slide 0: Title Slide - NEW */}
            {name === "Environmental Impact of Data Centers" && (
              <group>

                {/* Tu logo cargado desde URL */}
                <Image
                  url="https://scontent.feoh1-1.fna.fbcdn.net/v/t39.30808-6/418741992_771128288388963_5204534195527612073_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeG-0aEUFuEWkWKkgWMmQSH5BqKxRXk0iTsGorFFeTSJOzKNHg5fRZhXI2t7a6Mgc-hiKbPmvy2yQfTo5qpjRe0o&_nc_ohc=zDoMBGjrh-gQ7kNvwE-rVYQ&_nc_oc=AdlYjTOC5qiQBXkriPpHrudNmOnPiPS6s53vSK4vctt8JQb5c2b4ZOFqKGejhLVOX9k&_nc_zt=23&_nc_ht=scontent.feoh1-1.fna&_nc_gid=Eupdz4-5EehVT8ImCYaVGQ&oh=00_AfTnxUud0Pafq0OdcXPblw0unSNuSv7d7fwO-nrcDP2XAw&oe=687BB383"
                  position={[0, 1, 0]}
                  scale={[2.5, 2.5, 1]}
                  transparent
                />


                {/* Title Text */}
                <Text position={[0, -1, 0]} fontSize={0.3} color="#000000" textAlign="center" maxWidth={6}>
                  Environmental Impact of{'\n'}Data Centers and{'\n'}Cloud Computing
                </Text>
                
                {/* Author Info */}
                <Text position={[0, -2.2, 0]} fontSize={0.15} color="#666666" textAlign="center">
                  Eyder Santiago Suarez Chavez{'\n'}
                  Code: 2322714
                </Text>
                
                {/* Animated data particles */}
                <Float speed={3} rotationIntensity={0} floatIntensity={0.5}>
                  {[...Array(20)].map((_, i) => (
                    <Sphere
                      key={i}
                      args={[0.05]}
                      position={[
                        Math.sin(i * 0.5) * 3,
                        Math.cos(i * 0.3) * 2,
                        Math.sin(i * 0.7) * 1
                      ]}
                    >
                      <meshBasicMaterial color="#00ff00" opacity={0.6} transparent />
                    </Sphere>
                  ))}
                </Float>
              </group>
            )}
            
            {/* Slide 1: Interactive Exploration - MOVED UP */}
            {name === "Interactive Exploration" && (
              <group>
                <Text position={[0, 3.5, 0]} fontSize={0.25} color="#000000" textAlign="center">
                  Use arrow keys ↑↓←→ or WASD to explore
                </Text>
                
                {/* Traditional Data Center - Left */}
                <group position={[-3, 0, 0]}>
                  <Text position={[0, 2.5, 0]} fontSize={0.2} color="#ff0000">
                    Traditional Data Center
                  </Text>
                  <InteractiveDataCenterExploration type="traditional" position={[0, 0, 0]} scale={0.3} />
                </group>
                
                {/* VS in the center */}
                <Text position={[0, 0, 0]} fontSize={0.4} color="#666666">
                  VS
                </Text>
                
                {/* Cloud Infrastructure - Right */}
                <group position={[3, 0, 0]}>
                  <Text position={[0, 2.5, 0]} fontSize={0.2} color="#00ff00">
                    Cloud Computing
                  </Text>
                  <InteractiveDataCenterExploration type="cloud" position={[0, 0, 0]} scale={0.3} />
                </group>
              </group>
            )}
            
            {/* Slide 2: Environmental Impact - Datacenter comparison */}
            {name === "Environmental Impact" && (
              <group>
                {/* Traditional data center (left) */}
                <group position={[-2, 0, 0]}>
                  <DataCenterBuilding position={[0, -1, 0]} scale={0.8} />
                  <ServerRack position={[0, 0.5, 0]} scale={0.5} color="#8B4513" />
                  <CO2Emissions position={[0, 1.5, -1]} scale={0.7} intensity={1.5} />
                  <Text position={[0, -2, 0]} fontSize={0.2} color="#666666">
                    On-Premises
                  </Text>
                </group>
                
                {/* Cloud computing (right) */}
                <group position={[2, 0, 0]}>
                  <CloudServer position={[0, 0, 0]} scale={1.2} color={mainColor} />
                  <RenewableEnergy position={[1, -1, 0]} scale={0.5} />
                  <Text position={[0, -2, 0]} fontSize={0.2} color="#666666">
                    Cloud Computing
                  </Text>
                </group>
                
                {/* Comparison arrow */}
                <Cone args={[0.2, 0.5]} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <meshStandardMaterial color={mainColor} />
                </Cone>
              </group>
            )}
            
            {/* Slide 3: Energy Consumption - Growth chart */}
            {name === "Energy Consumption" && (
              <group>
                {/* 3D Bar charts */}
                <group position={[-2, -1, 0]}>
                  {/* 2010 Bar */}
                  <Box args={[0.8, 1, 0.8]} position={[0, 0.5, 0]}>
                    <meshStandardMaterial color="#ff6b6b" />
                  </Box>
                  <Text position={[0, -0.5, 0]} fontSize={0.15} color="#000000">
                    2010
                  </Text>
                </group>
                
                <group position={[0, -1, 0]}>
                  {/* 2018 - Instances */}
                  <Box args={[0.8, 5.5, 0.8]} position={[0, 2.75, 0]}>
                    <meshStandardMaterial color={mainColor} />
                  </Box>
                  <Text position={[0, -0.5, 0]} fontSize={0.15} color="#000000">
                    Instances
                  </Text>
                  <Text position={[0, 6, 0]} fontSize={0.2} color={mainColor}>
                    +550%
                  </Text>
                </group>
                
                <group position={[2, -1, 0]}>
                  {/* 2018 - Energy */}
                  <Box args={[0.8, 1.06, 0.8]} position={[0, 0.53, 0]}>
                    <meshStandardMaterial color="#4ecdc4" />
                  </Box>
                  <Text position={[0, -0.5, 0]} fontSize={0.15} color="#000000">
                    Energy
                  </Text>
                  <Text position={[0, 1.5, 0]} fontSize={0.2} color="#4ecdc4">
                    +6%
                  </Text>
                </group>
                
                {/* Lightning bolts representing energy */}
                <Cone args={[0.3, 1]} position={[-1, 3, 0]} rotation={[0, 0, Math.PI]}>
                  <meshBasicMaterial color="#ffeb3b" />
                </Cone>
                <Cone args={[0.3, 1]} position={[1, 3, 0]} rotation={[0, 0, Math.PI]}>
                  <meshBasicMaterial color="#ffeb3b" />
                </Cone>
              </group>
            )}
            
            {/* Slide 4: PUE Efficiency - Comparative meters */}
            {name === "PUE Efficiency" && (
              <group>
                {/* Cloud Meter */}
                <group position={[-2, 0, 0]}>
                  <EfficiencyMeter position={[0, 0, 0]} value={1.09} />
                  <CloudServer position={[0, 2, 0]} scale={0.8} color={mainColor} />
                  <Text position={[0, -1.5, 0]} fontSize={0.2} color="#00ff00">
                    Cloud: 1.09-1.18
                  </Text>
                </group>
                
                {/* On-premises Meter */}
                <group position={[2, 0, 0]}>
                  <EfficiencyMeter position={[0, 0, 0]} value={1.8} />
                  <DataCenterBuilding position={[0, 2, 0]} scale={0.5} />
                  <Text position={[0, -1.5, 0]} fontSize={0.2} color="#ff0000">
                    On-premises: 1.8
                  </Text>
                </group>
                
                {/* Efficiency symbol in center */}
                <Torus args={[0.5, 0.2, 16, 100]} position={[0, 0, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
                </Torus>
              </group>
            )}
            
            {/* Slide 5: CO₂e Emissions - Provider comparison */}
            {name === "CO₂e Emissions" && (
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
                
                {/* CO₂e/TB year text */}
                <Text position={[0, -2, 0]} fontSize={0.18} color="#000000">
                  CO₂e/TB year
                </Text>
              </group>
            )}
            
            {/* Slide 6: Small Businesses */}
            {name === "Small Businesses" && (
              <group>
                {/* Small building */}
                <Box args={[1.5, 1, 1]} position={[-1.5, 0, 0]}>
                  <meshStandardMaterial color="#e74c3c" />
                </Box>
                <Text position={[-1.5, -1, 0]} fontSize={0.15} color="#666666">
                  {"<100 employees"}
                </Text>
                
                {/* Arrow to cloud */}
                <group position={[0, 0, 0]}>
                  <Cylinder args={[0.1, 0.1, 2]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color={mainColor} />
                  </Cylinder>
                  <Cone args={[0.2, 0.5]} position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <meshStandardMaterial color={mainColor} />
                  </Cone>
                </group>
                
                {/* Cloud with reduction percentage */}
                <group position={[2, 0, 0]}>
                  <CloudServer position={[0, 0, 0]} scale={1} color={mainColor} />
                  <Text position={[0, -1.5, 0]} fontSize={0.25} color="#00ff00">
                    -60%
                  </Text>
                  <Text position={[0, -2, 0]} fontSize={0.15} color="#666666">
                    emissions
                  </Text>
                </group>
              </group>
            )}
            
            {/* Slide 7: Medium Businesses */}
            {name === "Medium Businesses" && (
              <group>
                {/* Hybrid model */}
                <group position={[-1.5, 0, 0]}>
                  <Box args={[1.5, 1.5, 1.2]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#f39c12" />
                  </Box>
                  <ServerRack position={[0, 0, 0]} scale={0.3} />
                </group>
                
                {/* Hybrid connection */}
                <Torus args={[1, 0.1, 8, 32]} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <meshStandardMaterial color={mainColor} />
                </Torus>
                
                {/* Partial cloud */}
                <group position={[1.5, 0, 0]}>
                  <CloudServer position={[0, 0, 0]} scale={0.8} color={mainColor} />
                </group>
                
                {/* Reduction indicator */}
                <Text position={[0, -2, 0]} fontSize={0.25} color="#f39c12">
                  -40-50%
                </Text>
                <Text position={[0, -2.5, 0]} fontSize={0.15} color="#666666">
                  Hybrid Model
                </Text>
              </group>
            )}
            
            {/* Slide 8: Large Corporations */}
            {name === "Large Corporations" && (
              <group>
                {/* Corporate tower */}
                <group position={[0, 0, 0]}>
                  {[0, 1, 2].map((i) => (
                    <Box key={i} args={[2 - i * 0.3, 1, 1.5 - i * 0.2]} position={[0, i, 0]}>
                      <meshStandardMaterial color={`hsl(${200 + i * 20}, 70%, 50%)`} />
                    </Box>
                  ))}
                </group>
                
                {/* Solar panels */}
                <group position={[-2, 0, 0]}>
                  {[...Array(4)].map((_, i) => (
                    <Box key={i} args={[0.5, 0.5, 0.05]} position={[i * 0.6 - 0.9, 2.5, 0]} rotation={[Math.PI / 6, 0, 0]}>
                      <meshStandardMaterial color="#1a237e" metalness={0.8} roughness={0.2} />
                    </Box>
                  ))}
                </group>
                
                {/* Wind turbines */}
                <RenewableEnergy position={[2, 0, 0]} scale={0.8} />
                <RenewableEnergy position={[2.5, 0, -1]} scale={0.6} />
                
                {/* Efficiency indicator */}
                <Text position={[0, -2, 0]} fontSize={0.2} color="#00ff00">
                  With renewables = Cloud
                </Text>
              </group>
            )}
            
            {/* Slide 9: Recommendations */}
            {name === "Recommendations" && (
              <group>
                {/* Central core */}
                <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
                  <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
                </Sphere>
                
                {/* 4 Strategies around */}
                {[
                  { pos: [2, 0, 0], icon: "cloud", label: "Selective\nMigration" },
                  { pos: [-2, 0, 0], icon: "hybrid", label: "Hybrid\nModel" },
                  { pos: [0, 0, 2], icon: "renewable", label: "Renewable\nEnergy" },
                  { pos: [0, 0, -2], icon: "efficiency", label: "PUE\nOptimization" }
                ].map((strategy, i) => (
                  <group key={i} position={strategy.pos}>
                    {/* Connection to center */}
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
                    
                    {/* Strategy icon */}
                    {strategy.icon === "cloud" && <CloudServer position={[0, 0.5, 0]} scale={0.5} color="#4ecdc4" />}
                    {strategy.icon === "hybrid" && (
                      <Torus args={[0.4, 0.1, 8, 32]} position={[0, 0.5, 0]}>
                        <meshStandardMaterial color="#f39c12" />
                      </Torus>
                    )}
                    {strategy.icon === "renewable" && <RenewableEnergy position={[0, 0, 0]} scale={0.4} />}
                    {strategy.icon === "efficiency" && <EfficiencyMeter position={[0, 0.5, 0]} scale={0.5} value={1.1} />}
                    
                    {/* Label */}
                    <Text position={[0, -0.8, 0]} fontSize={0.12} color="#000000" textAlign="center">
                      {strategy.label}
                    </Text>
                  </group>
                ))}
              </group>
            )} 
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
            )
          
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
            
            {/* Slide 9: Exploración Interactiva - NUEVO */}
            {name === "Exploración Interactiva" && (
              <group>
                <Text position={[0, 3.5, 0]} fontSize={0.25} color="#000000" textAlign="center">
                  Usa las flechas ↑↓←→ o WASD para explorar
                </Text>
                
                {/* Data Center Tradicional - Izquierda */}
                <group position={[-3, 0, 0]}>
                  <Text position={[0, 2.5, 0]} fontSize={0.2} color="#ff0000">
                    Data Center Tradicional
                  </Text>
                  <InteractiveDataCenterExploration type="traditional" position={[0, 0, 0]} scale={0.3} />
                </group>
                
                {/* VS en el centro */}
                <Text position={[0, 0, 0]} fontSize={0.4} color="#666666">
                  VS
                </Text>
                
                {/* Cloud Infrastructure - Derecha */}
                <group position={[3, 0, 0]}>
                  <Text position={[0, 2.5, 0]} fontSize={0.2} color="#00ff00">
                    Cloud Computing
                  </Text>
                  <InteractiveDataCenterExploration type="cloud" position={[0, 0, 0]} scale={0.3} />
                </group>
              </group>
            )}
            
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