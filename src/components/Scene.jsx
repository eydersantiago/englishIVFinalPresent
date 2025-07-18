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
import { useFrame, useThree } from "@react-three/fiber";


// Precargar los modelos GLB
useGLTF.preload('/models/data_center_low-poly.glb');
useGLTF.preload('/models/data_center_rack.glb');

export const InfoGroup = ({ threshold = 5, children }) => {
  const { camera } = useThree();
  const ref            = useRef();          // ← posición real del grupo
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (!ref.current) return;

    // distancia cámara‑grupo, NO distancia al (0,0,0)
    const target = new THREE.Vector3();
    ref.current.getWorldPosition(target);
    const dist = camera.position.distanceTo(target);

    const fadeRange = threshold * 0.4;               // 40 % de zona de mezcla
    const newOp =
      dist < threshold
        ? Math.max(0, (dist - (threshold - fadeRange)) / fadeRange)
        : 1;

    if (newOp !== opacity) setOpacity(newOp);
  });

  // clona los hijos inyectando la opacidad
  const mapped = React.Children.map(children, (child) => {
    // Text de drei
    if (child?.type === Text)
      return React.cloneElement(child, { fillOpacity: opacity });

    // materiales de Mesh
    if (child?.props?.children)
      return React.cloneElement(child, {
        children: React.Children.map(child.props.children, (gc) =>
          gc?.type?.name?.includes("Material")
            ? React.cloneElement(gc, { opacity, transparent: true })
            : gc
        ),
      });

    // grupos anidados
    if (child?.type === "group")
      return (
        <InfoGroup threshold={threshold}>{child.props.children}</InfoGroup>
      );

    return child;
  });

  return <group ref={ref}>{mapped}</group>;
};

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
// Componente para exploración interactiva de infraestructura
const InteractiveDataCenterExploration = ({ type, position, scale = 1 }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const traditionalModelRef = useRef();
  const modernModelRef = useRef();
  
  // Cargar los modelos GLB
  const traditionalModel = useGLTF('/models/data_center_low-poly.glb');
  const modernModel = useGLTF('/models/data_center_rack.glb');
  
  // Estado para controlar qué modelo mostrar
  const [currentModel, setCurrentModel] = useState('traditional'); // 'traditional' o 'modern'
  
  // Posición inicial de la cámara
  const initialCameraPosition = [10, 8, 15];
  const initialCameraTarget = [0, 0, 0];
  
  useEffect(() => {
    // Configurar la posición inicial de la cámara
    camera.position.set(...initialCameraPosition);
    if (controlsRef.current) {
      controlsRef.current.target.set(...initialCameraTarget);
      controlsRef.current.update();
    }
  }, [camera]);
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Restablecer cámara con 'o' o 'O'
      if (e.key === 'o' || e.key === 'O') {
        camera.position.set(...initialCameraPosition);
        if (controlsRef.current) {
          controlsRef.current.target.set(...initialCameraTarget);
          controlsRef.current.update();
        }
      }
      // Cambiar entre modelos con 't' o 'T'
      if (e.key === 't' || e.key === 'T') {
        setCurrentModel(prev => prev === 'traditional' ? 'modern' : 'traditional');
}
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [camera]);
  
  return (
    <group position={position} scale={scale}>
      {/* Controles de órbita mejorados */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI * 0.9}
        autoRotate={false}
      />
      
      {/* Piso base */}
      <Box args={[20, 0.1, 20]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Grid en el piso */}
      <gridHelper args={[20, 20, "#444444", "#222222"]} position={[0, 0, 0]} />
      
{/* Lado Tradicional (Izquierda) */}
      <group position={[-6, 0, 0]}>
        {/* Título */}
        <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
          <Text position={[0, 5, 0]} fontSize={0.5} color="#FF4444">
            Traditional Data Center
          </Text>
        </Float>
        
        {/* Modelo GLB - muestra uno u otro según el estado */}
        <group scale={[2, 2, 2]} position={[0, 0, 0]}>
          {currentModel === 'traditional' ? (
            <primitive object={traditionalModel.scene.clone()} />
          ) : (
            <primitive object={modernModel.scene.clone()} />
          )}
        </group>
        
        {/* Indicadores de ineficiencia */}
        <group position={[0, 3, 3]}>
          <Box args={[3, 0.8, 0.1]}>
            <meshStandardMaterial color="#FF4444" opacity={0.9} transparent />
          </Box>
          <Text position={[0, 0, 0.1]} fontSize={0.15} color="#ffffff" textAlign="center">
            PUE: 1.8-2.5{'\n'}High Energy Use
          </Text>
        </group>
        
        {/* Partículas de calor */}
        <CO2Emissions position={[2, 1, 0]} scale={0.5} intensity={1} />
        
        {/* Luz roja para indicar calor */}
        <pointLight position={[0, 2, 0]} color="#ff6666" intensity={1} distance={5} />
      </group>
      
      {/* Centro - Comparación */}
      <group position={[0, 3, 0]}>
        <Text fontSize={0.3} color="#4FC3F7">
          VS
        </Text>
        {/* Flecha de mejora */}
        <group position={[0, -1, 0]}>
          <Cone args={[0.3, 1]} rotation={[0, 0, -Math.PI / 2]}>
            <meshStandardMaterial color="#10B981" />
          </Cone>
          <Text position={[0, -0.5, 0]} fontSize={0.1} color="#10B981">
            40% Less CO₂
          </Text>
        </group>
      </group>
      
      {/* Lado Moderno (Derecha) */}
      <group position={[6, 0, 0]}>
        {/* Título */}
        <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
          <Text position={[0, 5, 0]} fontSize={0.5} color="#10B981">
            Modern Cloud Data Center
          </Text>
        </Float>
        
        {/* Modelo GLB moderno */}
        <group scale={[2, 2, 2]} position={[0, 0, 0]}>
          <primitive object={modernModel.scene.clone()} />
        </group>
        
        {/* Indicadores de eficiencia */}
        <group position={[0, 3, 3]}>
          <Box args={[3, 0.8, 0.1]}>
            <meshStandardMaterial color="#10B981" opacity={0.9} transparent />
          </Box>
          <Text position={[0, 0, 0.1]} fontSize={0.15} color="#ffffff" textAlign="center">
            PUE: 1.1-1.2{'\n'}Optimized Cooling
          </Text>
        </group>
        
        {/* Energía renovable */}
        <RenewableEnergy position={[-2, 0, -2]} scale={0.5} />
        
        {/* Luz verde para indicar eficiencia */}
        <pointLight position={[0, 2, 0]} color="#66ff66" intensity={0.5} distance={5} />
      </group>
      
      {/* Panel de información flotante */}
      <Float speed={1} rotationIntensity={0} floatIntensity={0.3}>
        <group position={[0, 6, 0]}>
          <Box args={[5, 1, 0.1]}>
            <meshStandardMaterial color="#000000" opacity={0.8} transparent />
          </Box>
          <Text position={[0, 0.2, 0.1]} fontSize={0.12} color="#ffffff" textAlign="center">
            Interactive Comparison
          </Text>
          <Text position={[0, -0.2, 0.1]} fontSize={0.08} color="#4FC3F7" textAlign="center">
            Press 'O' to reset camera | 'T' to switch models | Use mouse to explore
          </Text>
        </group>
      </Float>
      
      {/* Métricas comparativas en el suelo */}
      <group position={[0, 0.1, 8]}>
        {/* Traditional metrics */}
        <group position={[-3, 0, 0]}>
          <Text position={[0, 0, 0]} fontSize={0.15} color="#FF4444" rotation={[-Math.PI / 2, 0, 0]}>
            Traditional:{'\n'}• High CAPEX{'\n'}• PUE: 1.8+{'\n'}• Local control
          </Text>
        </group>
        
        {/* Modern metrics */}
        <group position={[3, 0, 0]}>
          <Text position={[0, 0, 0]} fontSize={0.15} color="#10B981" rotation={[-Math.PI / 2, 0, 0]}>
            Cloud:{'\n'}• Pay-per-use{'\n'}• PUE: 1.1-1.2{'\n'}• Auto-scaling
          </Text>
        </group>
      </group>
    </group>
  );
};




export const Scene = ({ mainColor, path, name, description, stats, ...props }) => {
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
          minDistance={2}
          maxDistance={10}
          autoRotateSpeed={0.1}
        />
        
        {/* Contenido 3D específico para cada slide */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group scale={ratioScale}>

            {name === "Environmental Impact of Data Centers" && (
              <group>

                {/* Tu logo cargado desde URL */}
                <Image
                  url="https://scontent.feoh1-1.fna.fbcdn.net/v/t39.30808-6/418741992_771128288388963_5204534195527612073_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeG-0aEUFuEWkWKkgWMmQSH5BqKxRXk0iTsGorFFeTSJOzKNHg5fRZhXI2t7a6Mgc-hiKbPmvy2yQfTo5qpjRe0o&_nc_ohc=zDoMBGjrh-gQ7kNvwE-rVYQ&_nc_oc=AdlYjTOC5qiQBXkriPpHrudNmOnPiPS6s53vSK4vctt8JQb5c2b4ZOFqKGejhLVOX9k&_nc_zt=23&_nc_ht=scontent.feoh1-1.fna&_nc_gid=Eupdz4-5EehVT8ImCYaVGQ&oh=00_AfTnxUud0Pafq0OdcXPblw0unSNuSv7d7fwO-nrcDP2XAw&oe=687BB383"
                  position={[0, 1, 0]}
                  scale={[2.5, 2.5, 1]}
                  transparent
                />

                
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

            
            
          {/* Slide 1: Table of Contents - NEW */}
          {name === "Table of Contents" && (
            <group>
              {/* Estructura visual del índice */}
              <group position={[0, 1, 0]}>
                {/* Columna izquierda */}
                <group position={[-2, 0, 0]}>
                  <Text position={[0, 1.5, 0]} fontSize={0.2} color="#000000">
                    1. Keywords
                  </Text>
                  <Text position={[0, 1, 0]} fontSize={0.2} color="#000000">
                    2. Introduction
                  </Text>
                  <Text position={[0, 0.5, 0]} fontSize={0.2} color="#000000">
                    3. Methods
                  </Text>
                  <Text position={[0, 0, 0]} fontSize={0.2} color="#000000">
                    4. Results
                  </Text>
                </group>
                
                {/* Columna derecha */}
                <group position={[2, 0, 0]}>
                  <Text position={[0, 1.5, 0]} fontSize={0.2} color="#000000">
                    5. Discussion
                  </Text>
                  <Text position={[0, 1, 0]} fontSize={0.2} color="#000000">
                    6. Conclusions
                  </Text>
                  <Text position={[0, 0.5, 0]} fontSize={0.2} color="#000000">
                    7. References
                  </Text>
                </group>
                
                {/* Líneas conectoras animadas */}
                {[...Array(7)].map((_, i) => (
                  <Float key={i} speed={2} rotationIntensity={0} floatIntensity={0.3}>
                    <Cylinder
                      args={[0.02, 0.02, 0.5]}
                      position={[
                        i < 4 ? -1 : 1,
                        1.5 - (i % 4) * 0.5,
                        0
                      ]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <meshBasicMaterial color={mainColor} opacity={0.6} transparent />
                    </Cylinder>
                  </Float>
                ))}
              </group>
              
              {/* Icono central */}
              <Torus args={[0.6, 0.2, 16, 100]} position={[0, -1, 0]}>
                <MeshDistortMaterial color={mainColor} speed={2} distort={0.3} />
              </Torus>
            </group>
          )}

          {/* Slide 2: Keywords - NEW */}
          {name === "Keywords" && (
            <group>
              {/* Nube de palabras clave en 3D */}
              <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                <InfoGroup threshold={6}>
                  <Text position={[0, 1.5, 0]} fontSize={0.3} color={mainColor}>
                    Data Centers
                  </Text>
                  <Text position={[-1.5, 0.5, 0.5]} fontSize={0.25} color="#3B82F6">
                    Cloud Computing
                  </Text>
                  <Text position={[1.5, 0.5, -0.5]} fontSize={0.25} color="#10B981">
                    CO₂ Emissions
                  </Text>
                  <Text position={[-1, -0.5, 0.3]} fontSize={0.2} color="#F59E0B">
                    Environmental
                  </Text>
                  <Text position={[1, -0.5, -0.3]} fontSize={0.2} color="#8B5CF6">
                    Sustainability
                  </Text>
                </InfoGroup>
              </Float>
              
              {/* Conexiones entre términos */}
              <InfoGroup threshold={4}>
                {[...Array(8)].map((_, i) => (
                  <Cylinder
                    key={i}
                    args={[0.01, 0.01, 2]}
                    position={[0, 0, 0]}
                    rotation={[
                      Math.random() * Math.PI,
                      Math.random() * Math.PI,
                      Math.random() * Math.PI
                    ]}
                  >
                    <meshBasicMaterial color="#cccccc" opacity={0.3} transparent />
                  </Cylinder>
                ))}
              </InfoGroup>
              
            </group>
          )}

          {/* Slide 3: Introduction - NEW */}
          {name === "Introduction" && (
            <group>
              {/* Problema principal */}
              <Box args={[4, 0.5, 0.1]} position={[0, 2, 0]}>
                <meshStandardMaterial color="#ff6b6b" />
              </Box>
              <Text position={[0, 2, 0.1]} fontSize={0.15} color="#ffffff" maxWidth={3.5}>
                Problem: 1% of global electricity consumption
              </Text>
              
              {/* Motivación */}
              <group position={[0, 0, 0]}>
                <Sphere args={[1, 32, 32]}>
                  <meshStandardMaterial 
                    color="#3B82F6" 
                    wireframe 
                    opacity={0.5} 
                    transparent 
                  />
                </Sphere>
                <Text position={[0, 0, 0]} fontSize={0.1} color="#000000" textAlign="center">
                  Need to minimize{'\n'}ecological impact{'\n'}of IT
                </Text>
              </group>
              
              {/* Objetivo */}
              <Box args={[4, 0.5, 0.1]} position={[0, -2, 0]}>
                <meshStandardMaterial color="#10B981" />
              </Box>
              <Text position={[0, -2, 0.1]} fontSize={0.15} color="#ffffff" maxWidth={3.5}>
                Goal: Guide organizational decisions
              </Text>
              
              {/* Flechas indicando flujo */}
              <Cone args={[0.2, 0.5]} position={[0, 1, 0]} rotation={[Math.PI, 0, 0]}>
                <meshStandardMaterial color={mainColor} />
              </Cone>
              <Cone args={[0.2, 0.5]} position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
                <meshStandardMaterial color={mainColor} />
              </Cone>
            </group>
          )}

          {/* Slide 4: Methods - NEW */}
          {name === "Methods" && (
            <group>
              {/* Diseño del estudio */}
              <Text position={[0, 2.5, 0]} fontSize={0.25} color="#000000">
                Analytical & Comparative Study
              </Text>
              
              {/* Fuentes de datos - 3 proveedores */}
              <group position={[0, 0.5, 0]}>
                {/* AWS */}
                <group position={[-2.5, 0, 0]}>
                  <Box args={[1.2, 1.2, 1.2]}>
                    <meshStandardMaterial color="#FF9500" />
                  </Box>
                  <Text position={[0, 0, 0.7]} fontSize={0.15} color="#ffffff">
                    AWS
                  </Text>
                  <Text position={[0, -0.8, 0]} fontSize={0.1} color="#666666">
                    2022-2023
                  </Text>
                </group>
                
                {/* Google */}
                <group position={[0, 0, 0]}>
                  <Box args={[1.2, 1.2, 1.2]}>
                    <meshStandardMaterial color="#4285F4" />
                  </Box>
                  <Text position={[0, 0, 0.7]} fontSize={0.15} color="#ffffff">
                    Google
                  </Text>
                  <Text position={[0, -0.8, 0]} fontSize={0.1} color="#666666">
                    2022-2023
                  </Text>
                </group>
                
                {/* Microsoft */}
                <group position={[2.5, 0, 0]}>
                  <Box args={[1.2, 1.2, 1.2]}>
                    <meshStandardMaterial color="#0078D4" />
                  </Box>
                  <Text position={[0, 0, 0.7]} fontSize={0.15} color="#ffffff">
                    Azure
                  </Text>
                  <Text position={[0, -0.8, 0]} fontSize={0.1} color="#666666">
                    2022-2025
                  </Text>
                  </group>
             </group>
             
             {/* Métricas analizadas */}
             <group position={[0, -1.5, 0]}>
               <Text position={[0, 0, 0]} fontSize={0.15} color="#000000">
                 Metrics: PUE • Energy • CO₂e/TB
               </Text>
             </group>
             
             {/* Herramientas */}
             <group position={[0, -2.5, 0]}>
               {['ESG Reports', 'Climatiq', 'NREL'].map((tool, i) => (
                 <Cylinder
                   key={i}
                   args={[0.3, 0.3, 0.1]}
                   position={[(i - 1) * 1.2, 0, 0]}
                 >
                   <meshStandardMaterial color={mainColor} metalness={0.5} />
                 </Cylinder>
               ))}
             </group>
           </group>
         )}

         {/* Slide 5: Results Overview - NEW */}
         {name === "Results" && (
           <group>
             <InfoGroup threshold={5}>
               {/* Título de resultados */}
               <Text position={[0, 2.5, 0]} fontSize={0.25} color="#000000">
                 Key Findings
               </Text>
               
               {/* Resultado 1: PUE Comparison */}
               <group position={[-2.5, 0.5, 0]}>
                 <Box args={[1.5, 1, 0.1]}>
                   <meshStandardMaterial color="#10B981" />
                 </Box>
                 <Text position={[0, 0, 0.1]} fontSize={0.12} color="#ffffff" textAlign="center">
                   PUE    {'\n'}    35-40%   {'\n'}Better
                 </Text>
               </group>
               
               {/* Resultado 2: Emissions */}
               <group position={[0, 0.5, 0]}>
                 <Box args={[1.5, 1, 0.1]}>
                   <meshStandardMaterial color="#F59E0B" />
                 </Box>
                 <Text position={[0, 0, 0.1]} fontSize={0.12} color="#ffffff" textAlign="center">
                   CO2e    {'\n'}    4.52-5.25  {'\n'}  kg/TB/yr
                 </Text>
               </group>
               
               {/* Resultado 3: Size Impact */}
               <group position={[2.5, 0.5, 0]}>
                 <Box args={[1.5, 1, 0.1]}>
                   <meshStandardMaterial color="#8B5CF6" />
                 </Box>
                 <Text position={[0, 0, 0.1]} fontSize={0.12} color="#ffffff" textAlign="center">
                   Small Biz    {'\n'}  -60%   {'\n'}Emissions
                 </Text>
               </group>
             </InfoGroup>
             
             {/* Gráfico abstracto de tendencia - permanece visible */}
             <group position={[0, -1.5, 0]}>
               {[...Array(5)].map((_, i) => (
                 <Box
                   key={i}
                   args={[0.3, 0.2 + i * 0.3, 0.3]}
                   position={[(i - 2) * 0.5, (0.2 + i * 0.3) / 2 - 0.5, 0]}
                 >
                   <meshStandardMaterial color={mainColor} />
                 </Box>
               ))}
               <Text position={[0, -1, 0]} fontSize={0.1} color="#666666">
                 Growth 2010-2018
               </Text>
             </group>
           </group>
         )}


        {/* Slide 6: Interactive Exploration - NEW */}
        {name === "Interactive Exploration" && (
          <group>
            {/* Desactivar los controles por defecto para este slide */}
            <PerspectiveCamera makeDefault position={[10, 8, 15]} near={0.5} far={100} />
            
            <InteractiveDataCenterExploration 
              type="comparison" 
              position={[0, 0, 0]} 
              scale={0.1}  // Reducir la escala general
            />
          </group>
        )}
         {/* Slide 7: Environmental Impact - Data Centers vs Cloud */}
        {name === "Environmental Impact" && (
          <group>
            <Text position={[0, 3, 0]} fontSize={0.25} color="#000000">
              1% of Global Electricity
            </Text>
            
            {/* Gráfico de barras 3D comparativo */}
            <group position={[0, 0, 0]}>
              {/* Barra Traditional DC */}
              <group position={[-1.5, 0, 0]}>
                <Box args={[0.8, 2.5, 0.8]} position={[0, 1.25, 0]}>
                  <meshStandardMaterial color="#FF4444" />
                </Box>
                <Text position={[0, -0.5, 0]} fontSize={0.12} color="#000000">
                  Traditional
                </Text>
                <Text position={[0, 2.8, 0]} fontSize={0.15} color="#FF4444">
                  100%
                </Text>
              </group>
              
              {/* Barra Cloud */}
              <group position={[1.5, 0, 0]}>
                <Box args={[0.8, 1.5, 0.8]} position={[0, 0.75, 0]}>
                  <meshStandardMaterial color="#10B981" />
                </Box>
                <Text position={[0, -0.5, 0]} fontSize={0.12} color="#000000">
                  Cloud
                </Text>
                <Text position={[0, 1.8, 0]} fontSize={0.15} color="#10B981">
                  60%
                </Text>
              </group>
            </group>
            
            {/* Indicador de ahorro */}
            <group position={[0, -2, 0]}>
              <Cylinder args={[1, 0.8, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#4FC3F7" opacity={0.7} transparent />
              </Cylinder>
              <Text position={[0, 0, 0.2]} fontSize={0.12} color="#ffffff">
                40% Savings
              </Text>
            </group>
            
            {/* Elementos visuales de energía */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <group position={[3, 1, 0]}>
                {/* Rayo de energía */}
                <mesh>
                  <coneGeometry args={[0.2, 0.8, 3]} />
                  <meshBasicMaterial color="#FFEB3B" />
                </mesh>
                <mesh position={[0, -0.4, 0]}>
                  <coneGeometry args={[0.2, 0.8, 3]} />
                  <meshBasicMaterial color="#FFC107" />
                </mesh>
              </group>
            </Float>
          </group>
        )}


        {/* Slide 8: Energy Consumption Evolution */}
        {name === "Energy Consumption" && (
          <group>
            <Text position={[0, 3, 0]} fontSize={0.2} color="#000000">
              2010-2018 Growth Paradox
            </Text>
            
            {/* Gráfico de líneas 3D */}
            <group position={[0, 0.5, 0]}>
              {/* Eje Y */}
              <Cylinder args={[0.02, 0.02, 3]} position={[-2.5, 0, 0]}>
                <meshStandardMaterial color="#333333" />
              </Cylinder>
              {/* Eje X */}
              <Cylinder args={[0.02, 0.02, 4]} position={[0, -1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color="#333333" />
              </Cylinder>
              
              {/* Línea de instancias (550% growth) */}
              <group>
                {[0, 1, 2, 3, 4].map((i) => (
                  <group key={i}>
                    <Sphere args={[0.08]} position={[-2 + i * 1, -1.5 + i * 0.6, 0]}>
                      <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={0.3} />
                    </Sphere>
                    {i < 4 && (
                      <Cylinder 
                        args={[0.03, 0.03, 1.1]} 
                        position={[-1.5 + i * 1, -1.2 + i * 0.6, 0]}
                        rotation={[0, 0, Math.atan(0.6)]}
                      >
                        <meshStandardMaterial color="#FF4444" />
                      </Cylinder>
                    )}
                  </group>
                ))}
                <Text position={[2.5, 1, 0]} fontSize={0.12} color="#FF4444">
                  Instances +550%
                </Text>
              </group>
              
              {/* Línea de energía (6% growth) */}
              <group>
                {[0, 1, 2, 3, 4].map((i) => (
                  <group key={i}>
                    <Sphere args={[0.08]} position={[-2 + i * 1, -1.5 + i * 0.03, 0.3]}>
                      <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.3} />
                    </Sphere>
                    {i < 4 && (
                      <Cylinder 
                        args={[0.03, 0.03, 1]} 
                        position={[-1.5 + i * 1, -1.485 + i * 0.03, 0.3]}
                        rotation={[0, 0, Math.PI / 2]}
                      >
                        <meshStandardMaterial color="#10B981" />
                      </Cylinder>
                    )}
                  </group>
                ))}
                <Text position={[2.5, -1.3, 0.3]} fontSize={0.12} color="#10B981">
                  Energy +6%
                </Text>
              </group>
            </group>
            
            {/* Labels */}
            <Text position={[-2.8, 0, 0]} fontSize={0.1} color="#666666" rotation={[0, 0, Math.PI / 2]}>
              Growth %
            </Text>
            <Text position={[0, -2, 0]} fontSize={0.1} color="#666666">
              2010 → 2018
            </Text>
            
            {/* Eficiencia visual */}
            <group position={[0, -2.8, 0]}>
              <Box args={[3, 0.5, 0.1]}>
                <meshStandardMaterial color="#4FC3F7" opacity={0.8} transparent />
              </Box>
              <Text position={[0, 0, 0.1]} fontSize={0.1} color="#ffffff">
                Efficiency improvements offset demand
              </Text>
            </group>
          </group>
        )}

        {/* Slide 9: PUE Efficiency Comparison */}
        {name === "PUE Efficiency" && (
          <group>
            <Text position={[0, 3, 0]} fontSize={0.2} color="#000000">
              Power Usage Effectiveness
            </Text>
            
            {/* Comparación visual de PUE */}
            <group position={[0, 0.5, 0]}>
              {/* On-premises */}
              <group position={[-2, 0, 0]}>
                <EfficiencyMeter position={[0, 0, 0]} scale={0.8} value={1.8} />
                <Text position={[0, -1.5, 0]} fontSize={0.15} color="#FF4444">
                  On-premises
                </Text>
                <Box args={[1.5, 0.3, 0.1]} position={[0, -2, 0]}>
                  <meshStandardMaterial color="#FF4444" />
                </Box>
                <Text position={[0, -2, 0.1]} fontSize={0.1} color="#ffffff">
                  PUE: 1.8
                </Text>
              </group>
              
              {/* Cloud providers */}
              <group position={[2, 0, 0]}>
                {/* Google */}
                <group position={[0, 1, 0]}>
                  <EfficiencyMeter position={[0, 0, 0]} scale={0.5} value={1.09} />
                  <Text position={[0, -0.8, 0]} fontSize={0.1} color="#4285F4">
                    Google: 1.09
                  </Text>
                </group>
                {/* AWS */}
                <group position={[-1, -0.5, 0]}>
                  <EfficiencyMeter position={[0, 0, 0]} scale={0.5} value={1.15} />
                  <Text position={[0, -0.8, 0]} fontSize={0.1} color="#FF9500">
                    AWS: 1.15
                  </Text>
                </group>
                {/* Microsoft */}
                <group position={[1, -0.5, 0]}>
                  <EfficiencyMeter position={[0, 0, 0]} scale={0.5} value={1.18} />
                  <Text position={[0, -0.8, 0]} fontSize={0.1} color="#0078D4">
                    Azure: 1.18
                  </Text>
                </group>
              </group>
            </group>
            
            {/* Fórmula PUE */}
            <group position={[0, -2.5, 0]}>
              <Box args={[4, 0.6, 0.1]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#333333" opacity={0.8} transparent />
              </Box>
              <Text position={[0, 0, 0.1]} fontSize={0.1} color="#ffffff" textAlign="center">
                PUE = Total Facility Energy / IT Equipment Energy
              </Text>
            </group>
            
            {/* Indicador de mejora */}
            <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
              <group position={[0, 2.2, 0]}>
                <Torus args={[0.3, 0.1, 16, 100]}>
                  <meshStandardMaterial color="#10B981" />
                </Torus>
                <Text position={[0, 0, 0]} fontSize={0.08} color="#10B981">
                  35-40%
                </Text>
                <Text position={[0, -0.2, 0]} fontSize={0.06} color="#10B981">
                  Better
                </Text>
              </group>
            </Float>
          </group>
        )}

        {/* Slide 10: CO₂e Emissions per TB */}
        {name === "CO₂e Emissions" && (
          <group>
            <Text position={[0, 3, 0]} fontSize={0.2} color="#000000">
              Annual CO₂e per Terabyte
            </Text>
            
            {/* Barras 3D de emisiones */}
            <group position={[0, 0, 0]}>
              {/* AWS */}
              <group position={[-2, 0, 0]}>
                <Box args={[0.8, 2.26, 0.8]} position={[0, 1.13, 0]}>
                  <meshStandardMaterial color="#FF9500" />
                </Box>
                <Text position={[0, 2.5, 0]} fontSize={0.15} color="#FF9500">
                  4.52
                </Text>
                <Text position={[0, -0.5, 0]} fontSize={0.12} color="#000000">
                  AWS
                </Text>
                {/* Nube de CO2 */}
                <CO2Emissions position={[0, 3, -0.5]} scale={0.3} intensity={0.452} />
              </group>
              
              {/* Microsoft */}
              <group position={[0, 0, 0]}>
                <Box args={[0.8, 2.46, 0.8]} position={[0, 1.23, 0]}>
                  <meshStandardMaterial color="#0078D4" />
                </Box>
                <Text position={[0, 2.7, 0]} fontSize={0.15} color="#0078D4">
                  4.92
                </Text>
                <Text position={[0, -0.5, 0]} fontSize={0.12} color="#000000">
                  Azure
                </Text>
                <CO2Emissions position={[0, 3.2, -0.5]} scale={0.3} intensity={0.492} />
              </group>
              
              {/* Google */}
              <group position={[2, 0, 0]}>
                <Box args={[0.8, 2.625, 0.8]} position={[0, 1.3125, 0]}>
                  <meshStandardMaterial color="#4285F4" />
                </Box>
                <Text position={[0, 2.9, 0]} fontSize={0.15} color="#4285F4">
                  5.25
                </Text>
                <Text position={[0, -0.5, 0]} fontSize={0.12} color="#000000">
                  Google
                </Text>
                <CO2Emissions position={[0, 3.4, -0.5]} scale={0.3} intensity={0.525} />
              </group>
            </group>
            
            {/* Unidad de medida */}
            <Text position={[0, -1.5, 0]} fontSize={0.1} color="#666666">
              kg CO₂e / TB / year
            </Text>
            
            {/* Paradoja visual */}
            <group position={[0, -2.5, 0]}>
              <Box args={[4, 0.6, 0.1]}>
                <meshStandardMaterial color="#F59E0B" opacity={0.8} transparent />
              </Box>
              <Text position={[0, 0, 0.1]} fontSize={0.1} color="#ffffff" textAlign="center">
                Best PUE ≠ Lowest emissions (energy mix matters)
              </Text>
            </group>
            
            {/* Elementos decorativos de CO2 */}
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
              {[...Array(10)].map((_, i) => (
                <Sphere
                  key={i}
                  args={[0.05 + Math.random() * 0.05]}
                  position={[
                    (Math.random() - 0.5) * 5,
                    Math.random() * 2 + 3.5,
                    (Math.random() - 0.5) * 2
                  ]}
                >
                  <meshStandardMaterial
                    color="#666666"
                    opacity={0.3}
                    transparent
                  />
                </Sphere>
              ))}
            </Float>
          </group>
        )}

        {/* Slide 11: Small Business Impact */}
        {name === "Small Businesses" && (
          <group>
            <Text position={[0, 3, 0]} fontSize={0.2} color="#000000">
              Small Organizations (&lt;100 employees)
            </Text>
            
            {/* Visualización antes/después */}
            <group position={[0, 0.5, 0]}>
              {/* Estado actual - On-premises */}
              <group position={[-2.5, 0, 0]}>
                <Text position={[0, 1.5, 0]} fontSize={0.12} color="#FF4444">
                  Current State
                </Text>
                {/* Servidor pequeño ineficiente */}
                <Box args={[1, 1.5, 1]} position={[0, 0, 0]}>
                  <meshStandardMaterial color="#666666" />
                </Box>
                {/* Indicadores de problemas */}
                <Text position={[0, -0.8, 0.5]} fontSize={0.08} color="#FF0000">
                  PUE: 2.0+
                </Text>
                {/* Calor/ineficiencia */}
                <pointLight position={[0, 0, 0]} color="#ff6666" intensity={1} distance={2} />
                {/* Costos */}
                <Text position={[0, -1.5, 0]} fontSize={0.1} color="#000000">
                  High costs
                </Text>
              </group>
              
              {/* Flecha de transición */}
              <group position={[0, 0, 0]}>
                <Cone args={[0.2, 0.8]} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <meshStandardMaterial color="#10B981" />
                </Cone>
                <Text position={[0, 0.5, 0]} fontSize={0.1} color="#10B981">
                  Migrate
                </Text>
              </group>
              
              {/* Estado futuro - Cloud */}
              <group position={[2.5, 0, 0]}>
                <Text position={[0, 1.5, 0]} fontSize={0.12} color="#10B981">
                  Cloud Solution
                </Text>
                <CloudServer position={[0, 0, 0]} scale={0.8} color="#4FC3F7" />
                <Text position={[0, -0.8, 0]} fontSize={0.08} color="#00FF00">
                  PUE: 1.1-1.2
                </Text>
                <Text position={[0, -1.5, 0]} fontSize={0.1} color="#000000">
                  60% less CO₂
                </Text>
              </group>
            </group>
            
            {/* Beneficios clave */}
            <group position={[0, -2, 0]}>
              {['No cooling needed', 'Pay per use', 'Instant scaling'].map((benefit, i) => (
                <group key={i} position={[(i - 1) * 2, 0, 0]}>
                  <Box args={[1.5, 0.4, 0.1]}>
                    <meshStandardMaterial color="#10B981" />
                  </Box>
                  <Text position={[0, 0, 0.1]} fontSize={0.08} color="#ffffff" textAlign="center">
                    {benefit}
                  </Text>
                </group>
              ))}
            </group>
            
            {/* Visualización de ahorro */}
            <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
              <group position={[3.5, 1, 0]}>
                <Text fontSize={0.3} color="#10B981">
                  -60%
                </Text>
                <Text position={[0, -0.3, 0]} fontSize={0.1} color="#10B981">
                  emissions
                </Text>
              </group>
            </Float>
          </group>
        )}

        {/* Slide 12: Medium Business Strategy */}
        {name === "Medium Businesses" && (
          <group>
            <Text position={[0, 3, 0]} fontSize={0.2} color="#000000">
              Medium Organizations (100-1000 employees)
            </Text>
            
            {/* Modelo híbrido visual */}
            <group position={[0, 0.5, 0]}>
              {/* Centro - Organización */}
              <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#8B5CF6" metalness={0.5} roughness={0.3} />
              </Sphere>
              <Text position={[0, 0, 0]} fontSize={0.1} color="#ffffff">
                Company
              </Text>
              
              {/* Izquierda - On-premises (crítico) */}
              <group position={[-2.5, 0, 0]}>
                <DataCenterBuilding position={[0, 0, 0]} scale={0.4} />
                <Text position={[0, -0.8, 0]} fontSize={0.1} color="#000000" textAlign="center">
                  On-premises{'\n'}Critical data
                </Text>
                {/* Conexión */}
                <Cylinder args={[0.05, 0.05, 1.5]} position={[1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <meshStandardMaterial color="#8B5CF6" opacity={0.7} transparent />
                </Cylinder>
              </group>
              
              {/* Derecha - Cloud (escalable) */}
              <group position={[2.5, 0, 0]}>
                <CloudServer position={[0, 0, 0]} scale={0.8} color="#4FC3F7" />
                <Text position={[0, -0.8, 0]} fontSize={0.1} color="#000000" textAlign="center">
                  Cloud{'\n'}Scalable loads
                </Text>
                {/* Conexión */}
                <Cylinder args={[0.05, 0.05, 1.5]} position={[-1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <meshStandardMaterial color="#8B5CF6" opacity={0.7} transparent />
                </Cylinder>
              </group>
              
              {/* Arriba - Beneficios */}
              <group position={[0, 2, 0]}>
                <Box args={[2, 0.5, 0.1]}>
                  <meshStandardMaterial color="#EC4899" />
                </Box>
                <Text position={[0, 0, 0.1]} fontSize={0.1} color="#ffffff">
                  45% avg reduction
                </Text>
              </group>
            </group>
            
            {/* Estrategia de distribución */}
            <group position={[0, -1.5, 0]}>
              <Text position={[0, 0, 0]} fontSize={0.12} color="#000000">
                Optimal Workload Distribution
              </Text>
              
              {/* Gráfico circular 3D */}
              <group position={[0, -1, 0]}>
                {/* 30% On-premises */}
                <mesh rotation={[0, 0, 0]}>
                  <ringGeometry args={[0.5, 0.8, 32, 1, 0, Math.PI * 0.6]} />
                  <meshStandardMaterial color="#FF6B6B" side={THREE.DoubleSide} />
                </mesh>
                <Text position={[-0.5, 0.3, 0]} fontSize={0.08} color="#FF6B6B">
                  30% Local
                </Text>
                
                {/* 70% Cloud */}
                <mesh rotation={[0, 0, Math.PI * 0.6]}>
                  <ringGeometry args={[0.5, 0.8, 32, 1, 0, Math.PI * 1.4]} />
                  <meshStandardMaterial color="#4FC3F7" side={THREE.DoubleSide} />
                </mesh>
                <Text position={[0.5, -0.3, 0]} fontSize={0.08} color="#4FC3F7">
                  70% Cloud
                </Text>
              </group>
            </group>
            
            {/* Ventajas del modelo híbrido */}
            <group position={[0, -3, 0]}>
              <Box args={[4, 0.4, 0.1]}>
                <meshStandardMaterial color="#666666" opacity={0.8} transparent />
              </Box>
              <Text position={[0, 0, 0.1]} fontSize={0.08} color="#ffffff">
                Flexibility • Cost Control • Compliance • Performance
              </Text>
            </group>
          </group>
        )}



         {/* Slide 13: Large Corporations */}
        {name === "Large Corporations" && (
          <group>
            <Text position={[0, 3, 0]} fontSize={0.2} color="#000000">
              Large Corporations (&gt;1000 employees)
            </Text>
            
            {/* Escenarios comparativos */}
            <group position={[0, 0.5, 0]}>
              {/* Con energía renovable */}
              <group position={[-2.5, 0, 0]}>
                <Text position={[0, 2, 0]} fontSize={0.12} color="#10B981">
                  With Renewables
                </Text>
                <DataCenterBuilding position={[0, 0, 0]} scale={0.5} />
                <RenewableEnergy position={[-1, 0, -1]} scale={0.4} />
                <RenewableEnergy position={[1, 0, -1]} scale={0.4} />
                {/* Panel solar */}
                <Box args={[2, 0.05, 1]} position={[0, 1.2, 0]}>
                  <meshStandardMaterial color="#1a237e" metalness={0.9} roughness={0.1} />
                </Box>
                <Text position={[0, -1.5, 0]} fontSize={0.1} color="#10B981">
                  Match cloud efficiency
                </Text>
                <EfficiencyMeter position={[0, -2.5, 0]} scale={0.4} value={1.3} />
              </group>
              
              {/* Sin energía renovable */}
              <group position={[2.5, 0, 0]}>
                <Text position={[0, 2, 0]} fontSize={0.12} color="#FF4444">
                  Without Renewables
                </Text>
                <DataCenterBuilding position={[0, 0, 0]} scale={0.5} />
                <CO2Emissions position={[-0.5, 1, -0.5]} scale={0.4} intensity={1.5} />
                <CO2Emissions position={[0.5, 1, -0.5]} scale={0.4} intensity={1.5} />
                <Text position={[0, -1.5, 0]} fontSize={0.1} color="#FF4444">
                  25-30% more emissions
                </Text>
                <EfficiencyMeter position={[0, -2.5, 0]} scale={0.4} value={1.5} />
              </group>
            </group>
            
            {/* Factores clave de decisión */}
            <group position={[0, -1, 0]}>
              <Text position={[0, 0, 0]} fontSize={0.12} color="#000000">
                Key Decision Factors
              </Text>
              
              {/* Diamante de decisión */}
              <group position={[0, -1, 0]} scale={0.8}>
                {/* Capital investment */}
                <group position={[0, 0.8, 0]}>
                  <Sphere args={[0.2]}>
                    <meshStandardMaterial color="#14B8A6" />
                  </Sphere>
                  <Text position={[0, 0.3, 0]} fontSize={0.08} color="#000000">
                    Capital
                  </Text>
                </group>
                {/* Control */}
                <group position={[-0.8, 0, 0]}>
                  <Sphere args={[0.2]}>
                    <meshStandardMaterial color="#14B8A6" />
                  </Sphere>
                  <Text position={[-0.3, 0, 0]} fontSize={0.08} color="#000000">
                    Control
                  </Text>
                </group>
                {/* Compliance */}
                <group position={[0.8, 0, 0]}>
                  <Sphere args={[0.2]}>
                    <meshStandardMaterial color="#14B8A6" />
                  </Sphere>
                  <Text position={[0.3, 0, 0]} fontSize={0.08} color="#000000">
                    Compliance
                  </Text>
                </group>
                {/* Sustainability */}
                <group position={[0, -0.8, 0]}>
                  <Sphere args={[0.2]}>
                    <meshStandardMaterial color="#14B8A6" />
                  </Sphere>
                  <Text position={[0, -0.3, 0]} fontSize={0.08} color="#000000">
                    Sustainability
                  </Text>
                </group>
                {/* Líneas conectoras */}
                <Cylinder args={[0.02, 0.02, 1.6]} rotation={[0, 0, Math.PI / 2]}>
                  <meshStandardMaterial color="#cccccc" />
                </Cylinder>
                <Cylinder args={[0.02, 0.02, 1.6]} rotation={[0, 0, 0]}>
                  <meshStandardMaterial color="#cccccc" />
                </Cylinder>
              </group>
            </group>
            
            {/* Recomendación */}
            <Box args={[4, 0.5, 0.1]} position={[0, -3, 0]}>
              <meshStandardMaterial color="#14B8A6" />
            </Box>
            <Text position={[0, -3, 0.1]} fontSize={0.1} color="#ffffff">
              Invest in renewable energy + optimization
            </Text>
          </group>
        )}


         {/* Slide 14: Discussion - NEW */}
         {name === "Discussion" && (
           <group>
             {/* Insights principales */}
             <Text position={[0, 2.5, 0]} fontSize={0.25} color="#000000">
               Key Insights
             </Text>
             
             {/* Paradoja PUE vs Emisiones */}
             <group position={[0, 1, 0]}>
               <Torus args={[0.8, 0.3, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                 <meshStandardMaterial color="#ff6b6b" />
               </Torus>
               <Text position={[0, 0, 0]} fontSize={0.1} color="#000000" textAlign="center">
                 Paradox:{'\n'}Best PUE ≠{'\n'}Lowest CO₂
               </Text>
             </group>
             
             {/* Factores múltiples */}
             <group position={[0, -1, 0]}>
               {['Location', 'Energy Mix', 'Scale', 'Practices'].map((factor, i) => (
                 <group key={i} position={[(i - 1.5) * 1.2, 0, 0]}>
                   <Sphere args={[0.3]}>
                     <meshStandardMaterial color={mainColor} opacity={0.7} transparent />
                   </Sphere>
                   <Text position={[0, -0.5, 0]} fontSize={0.08} color="#666666">
                     {factor}
                   </Text>
                 </group>
               ))}
             </group>
             
             {/* Limitaciones */}
             <Box args={[4, 0.8, 0.1]} position={[0, -2.5, 0]}>
               <meshStandardMaterial color="#666666" opacity={0.5} transparent />
             </Box>
             <Text position={[0, -2.5, 0.1]} fontSize={0.1} color="#ffffff" maxWidth={3.8}>
               Limitations: Self-reported data, 65% market focus
             </Text>
           </group>
         )}

         {/* Slide 15: Conclusions - NEW */}
         {name === "Conclusions" && (
           <group>
             {/* Conclusiones principales */}
             <Text position={[0, 2.5, 0]} fontSize={0.25} color="#000000">
               Final Takeaways
             </Text>
             
             {/* 5 conclusiones clave */}
             <group>
               {[
                 { text: "Transition is imperative", icon: "sphere" },
                 { text: "Cloud advantages for small orgs", icon: "cloud" },
                 { text: "Optimal path varies", icon: "path" },
                 { text: "Hybrid models preferred", icon: "hybrid" },
                 { text: "Today's decisions matter", icon: "time" }
               ].map((conclusion, i) => (
                 <group key={i} position={[0, 1.5 - i * 0.8, 0]}>
                   {/* Icono */}
                   <group position={[-2.5, 0, 0]}>
                     {conclusion.icon === "sphere" && <Sphere args={[0.2]} />}
                     {conclusion.icon === "cloud" && <Cloud segments={10} bounds={[0.5, 0.2, 0.2]} volume={1} />}
                     {conclusion.icon === "path" && <Torus args={[0.2, 0.05, 8, 16]} />}
                     {conclusion.icon === "hybrid" && (
                       <>
                         <Box args={[0.2, 0.2, 0.2]} position={[-0.1, 0, 0]} />
                         <Sphere args={[0.1]} position={[0.1, 0, 0]} />
                       </>
                     )}
                     {conclusion.icon === "time" && <Cylinder args={[0.2, 0.2, 0.05]} rotation={[Math.PI / 2, 0, 0]} />}
                     <meshStandardMaterial color={mainColor} />
                   </group>
                   
                   {/* Texto */}
                   <Text position={[0, 0, 0]} fontSize={0.15} color="#000000">
                     {i + 1}. {conclusion.text}
                   </Text>
                 </group>
               ))}
             </group>
             
             {/* Call to action */}
             <Box args={[4, 0.6, 0.1]} position={[0, -2.5, 0]}>
               <meshStandardMaterial color="#10B981" />
             </Box>
             <Text position={[0, -2.5, 0.1]} fontSize={0.12} color="#ffffff">
               Future: Longitudinal studies needed
             </Text>
           </group>
         )}


        {/* Slide 16: Recommendations - NEW */}
        {name === "Recommendations" && (
          <group>
            <Text position={[0, 3, 0]} fontSize={0.25} color="#000000">
              Strategic Recommendations
            </Text>
            
            {/* 4 estrategias clave */}
            <group position={[0, 0.5, 0]}>
              {/* 1. Renewable Energy */}
              <group position={[-2, 1, 0]}>
                <RenewableEnergy position={[0, 0, 0]} scale={0.5} />
                <Text position={[0, -0.8, 0]} fontSize={0.1} color="#10B981" textAlign="center">
                  Renewable{'\n'}Energy
                </Text>
              </group>
              
              {/* 2. Hybrid Approach */}
              <group position={[2, 1, 0]}>
                <group>
                  <Box args={[0.4, 0.4, 0.4]} position={[-0.3, 0, 0]}>
                    <meshStandardMaterial color="#8B5CF6" />
                  </Box>
                  <CloudServer position={[0.3, 0, 0]} scale={0.3} color="#4FC3F7" />
                </group>
                <Text position={[0, -0.8, 0]} fontSize={0.1} color="#8B5CF6" textAlign="center">
                  Hybrid{'\n'}Model
                </Text>
              </group>
              
              {/* 3. Liquid Cooling */}
              <group position={[-2, -1, 0]}>
                <Cylinder args={[0.3, 0.3, 0.6]} position={[0, 0, 0]}>
                  <meshStandardMaterial color="#3B82F6" opacity={0.7} transparent />
                </Cylinder>
                <Torus args={[0.35, 0.05, 8, 32]} position={[0, 0.3, 0]}>
                  <meshStandardMaterial color="#0EA5E9" />
                </Torus>
                <Text position={[0, -0.8, 0]} fontSize={0.1} color="#3B82F6" textAlign="center">
                  Liquid{'\n'}Cooling
                </Text>
              </group>
              
              {/* 4. Virtualization */}
              <group position={[2, -1, 0]}>
                {/* Capas de virtualización */}
                {[0, 0.2, 0.4].map((offset, i) => (
                  <Box
                    key={i}
                    args={[0.8, 0.15, 0.8]}
                    position={[0, offset, 0]}
                  >
                    <meshStandardMaterial
                      color={["#FF6B6B", "#4ECDC4", "#45B7D1"][i]}
                      opacity={0.8}
                      transparent
                    />
                  </Box>
                ))}
                <Text position={[0, -0.8, 0]} fontSize={0.1} color="#45B7D1" textAlign="center">
                  Virtualization
                </Text>
              </group>
            </group>
            
            {/* Timeline de implementación */}
            <group position={[0, -2, 0]}>
              <Text position={[0, 0.5, 0]} fontSize={0.12} color="#000000">
                Implementation Timeline
              </Text>
              {/* Línea de tiempo */}
              <Cylinder args={[0.02, 0.02, 4]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color="#666666" />
              </Cylinder>
              {/* Fases */}
              {['Assess', 'Plan', 'Migrate', 'Optimize'].map((phase, i) => (
                <group key={i} position={[(i - 1.5) * 1.2, 0, 0]}>
                  <Sphere args={[0.1]}>
                    <meshStandardMaterial color="#84CC16" />
                  </Sphere>
                  <Text position={[0, -0.3, 0]} fontSize={0.08} color="#666666">
                    {phase}
                  </Text>
                </group>
              ))}
            </group>
            
            {/* Call to action */}
            <Box args={[4, 0.6, 0.1]} position={[0, -3, 0]}>
              <meshStandardMaterial color="#84CC16" />
            </Box>
            <Text position={[0, -3, 0.1]} fontSize={0.12} color="#ffffff">
              Start with energy audit → Implement gradually
            </Text>
          </group>
        )}

         {/* Slide 17: References - NEW */}
         {name === "References" && (
           <group>
             {/* Título */}
             <Text position={[0, 2.5, 0]} fontSize={0.25} color="#000000">
               Key References
             </Text>
             
             {/* Libros/papers apilados */}
             <group position={[0, 0, 0]}>
               {[
                 { author: "Masanet et al.", year: "2020", color: "#3B82F6" },
                 { author: "AWS", year: "2022-2023", color: "#FF9500" },
                 { author: "Google", year: "2022-2023", color: "#4285F4" },
                 { author: "Microsoft", year: "2023-2025", color: "#0078D4" },
                 { author: "NREL", year: "2025", color: "#10B981" }
               ].map((ref, i) => (
                 <group key={i} position={[0, -1.5 + i * 0.3, i * 0.1]}>
                   <Box args={[3, 0.2, 1.5]}>
                     <meshStandardMaterial color={ref.color} />
                   </Box>
                   <Text position={[0, 0, 0.76]} fontSize={0.08} color="#ffffff">
                     {ref.author} ({ref.year})
                   </Text>
                 </group>
               ))}
             </group>
             
             {/* Indicador de cantidad */}
             <group position={[0, -2.5, 0]}>
               <Text fontSize={0.15} color="#666666">
                 15+ Scientific Sources
               </Text>
             </group>
             
             {/* Íconos de tipo de fuente */}
             <group position={[0, 2, 0]}>
               {['📊', '📈', '🌍'].map((emoji, i) => (
                 <Text key={i} position={[(i - 1) * 1, 0, 0]} fontSize={0.3}>
                   {emoji}
                 </Text>
               ))}
             </group>
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