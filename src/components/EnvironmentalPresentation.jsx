import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  Text, 
  Box, 
  Sphere, 
  RoundedBox,
  MeshDistortMaterial,
  Float,
  PerspectiveCamera,
  OrbitControls,
  Environment
} from '@react-three/drei';
import { ChevronLeft, ChevronRight, Cloud, Server, Leaf, Zap, BarChart3, Building2 } from 'lucide-react';

export const slides = [
  {
    title: "Impacto Ambiental de Centros de Datos",
    subtitle: "Centros de datos tradicionales vs Cloud Computing",
    content: "¿Es ventajoso para las empresas migrar a proveedores centralizados?",
    icon: Cloud,
    color: "#3B82F6",
    meshType: "sphere"
  },
  {
    title: "Consumo Energético Global",
    subtitle: "1% del consumo eléctrico mundial",
    content: "Entre 2010-2018: Las instancias de cómputo crecieron 550%, pero el consumo energético solo aumentó 6%",
    icon: Zap,
    color: "#EF4444",
    meshType: "box"
  },
  {
    title: "Eficiencia Energética (PUE)",
    subtitle: "Power Usage Effectiveness",
    content: "Cloud: 1.09-1.18 vs On-premises: 1.8",
    stats: {
      google: "1.09",
      aws: "1.15",
      microsoft: "1.18",
      traditional: "1.8"
    },
    icon: BarChart3,
    color: "#10B981",
    meshType: "torus"
  },
  {
    title: "Emisiones CO₂e por Terabyte",
    subtitle: "kg CO₂e/TB año",
    content: "AWS: 4.52 | Microsoft: 4.92 | Google: 5.25",
    icon: Leaf,
    color: "#F59E0B",
    meshType: "dodecahedron"
  },
  {
    title: "Impacto por Tamaño de Organización",
    subtitle: "Pequeñas empresas (<100 empleados)",
    content: "Reducción de emisiones > 60% al migrar a la nube",
    icon: Building2,
    color: "#8B5CF6",
    meshType: "sphere"
  },
  {
    title: "Empresas Medianas",
    subtitle: "100-1,000 empleados",
    content: "Modelo híbrido óptimo: reducción de 40-50% en emisiones",
    icon: Building2,
    color: "#EC4899",
    meshType: "box"
  },
  {
    title: "Grandes Corporaciones",
    subtitle: ">1,000 empleados",
    content: "Con energía renovable pueden igualar la eficiencia de la nube",
    icon: Building2,
    color: "#14B8A6",
    meshType: "torus"
  },
  {
    title: "Recomendaciones",
    subtitle: "Estrategias para la sostenibilidad",
    content: "• Enfoque híbrido\n• Energías renovables\n• Refrigeración líquida\n• Virtualización",
    icon: Leaf,
    color: "#84CC16",
    meshType: "dodecahedron"
  }
];

function Scene3D({ slide, visible }) {
  const meshProps = {
    sphere: { args: [1, 32, 32] },
    box: { args: [1.5, 1.5, 1.5] },
    torus: { args: [1, 0.3, 16, 100] },
    dodecahedron: { args: [1] }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="city" />
      
      <Float 
        speed={2} 
        rotationIntensity={1} 
        floatIntensity={2}
        floatingRange={[-0.1, 0.1]}
      >
        <group scale={visible ? 1 : 0.5} rotation={[0, Date.now() * 0.0005, 0]}>
          {slide.meshType === 'sphere' && (
            <Sphere {...meshProps.sphere}>
              <MeshDistortMaterial color={slide.color} speed={2} distort={0.4} />
            </Sphere>
          )}
          {slide.meshType === 'box' && (
            <RoundedBox {...meshProps.box} radius={0.1}>
              <MeshDistortMaterial color={slide.color} speed={2} distort={0.3} />
            </RoundedBox>
          )}
          {slide.meshType === 'torus' && (
            <mesh>
              <torusGeometry {...meshProps.torus} />
              <MeshDistortMaterial color={slide.color} speed={2} distort={0.3} />
            </mesh>
          )}
          {slide.meshType === 'dodecahedron' && (
            <mesh>
              <dodecahedronGeometry {...meshProps.dodecahedron} />
              <MeshDistortMaterial color={slide.color} speed={2} distort={0.3} />
            </mesh>
          )}
        </group>
      </Float>

      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls 
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function StatsDisplay({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm opacity-70 capitalize">{key}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      ))}
    </div>
  );
}

export default function EnvironmentalPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      <div className="h-full flex">
        {/* 3D Canvas */}
        <div className="w-1/2 h-full">
          <Canvas>
            <Scene3D slide={slide} visible={visible} />
          </Canvas>
        </div>

        {/* Content */}
        <div className="w-1/2 h-full flex flex-col justify-center p-12">
          <div className={`transition-all duration-700 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full" style={{ backgroundColor: slide.color + '20' }}>
                <Icon size={32} style={{ color: slide.color }} />
              </div>
              <div className="text-sm opacity-70">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">{slide.title}</h1>
            <h2 className="text-2xl mb-6 opacity-80">{slide.subtitle}</h2>
            
            <p className="text-lg leading-relaxed whitespace-pre-line opacity-90">
              {slide.content}
            </p>

            {slide.stats && <StatsDisplay stats={slide.stats} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'w-8 bg-white' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Ir a diapositiva ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm opacity-70">
        Eyder Santiago Suarez Chavez | Universidad del Valle | 2025
      </div>
    </div>
  );
}