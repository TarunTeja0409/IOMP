import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const Node = ({ position, color, label, isCore = false }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!isCore) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    } else {
      // Core slowly rotates
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.005;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        {isCore ? (
          <icosahedronGeometry args={[1.5, 0]} />
        ) : (
          <sphereGeometry args={[0.5, 32, 32]} />
        )}
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5} 
          wireframe={isCore}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <Html distanceFactor={15} center position={[0, -1, 0]}>
        <div className={`px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm shadow-xl border whitespace-nowrap ${
          isCore ? 'bg-primary-900/60 text-primary-300 border-primary-500/50' : 
          color === '#10b981' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50' : 
          'bg-red-900/60 text-red-300 border-red-500/50'
        }`}>
          {label}
        </div>
      </Html>
    </group>
  );
};

const CustomLine = ({ start, end, color, dashed }) => {
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    ]);
    return geo;
  }, [start, end]);

  return (
    <line geometry={lineGeometry}>
      {dashed ? (
        <lineDashedMaterial color={color} transparent opacity={0.3} dashSize={0.2} gapSize={0.1} />
      ) : (
        <lineBasicMaterial color={color} transparent opacity={0.6} />
      )}
    </line>
  );
};

const SkillGraph = ({ matchingSkills, missingSkills, preferredJobRole }) => {
  // Generate positions for nodes
  const matchingNodes = useMemo(() => {
    return matchingSkills.map((skill, i) => {
      const angle = (i / matchingSkills.length) * Math.PI * 2;
      const radius = 3.5;
      return {
        id: skill,
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 2, Math.sin(angle) * radius],
        color: '#10b981' // emerald-500
      };
    });
  }, [matchingSkills]);

  const missingNodes = useMemo(() => {
    return missingSkills.map((skill, i) => {
      const angle = (i / missingSkills.length) * Math.PI * 2 + Math.PI/4; // Offset
      const radius = 6.5;
      return {
        id: skill,
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius],
        color: '#ef4444' // red-500
      };
    });
  }, [missingSkills]);

  const groupRef = useRef();

  useFrame((state) => {
    // slowly rotate the entire graph
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Core Node */}
      <Node position={[0, 0, 0]} color="#6366f1" label={preferredJobRole || "Role"} isCore={true} />
      
      {/* Matching Nodes and Connections */}
      {matchingNodes.map(node => (
        <React.Fragment key={`match-${node.id}`}>
          <CustomLine start={[0,0,0]} end={node.position} color="#10b981" dashed={false} />
          <Node position={node.position} color={node.color} label={node.id} />
        </React.Fragment>
      ))}

      {/* Missing Nodes (Disconnected or dashed lines) */}
      {missingNodes.map(node => (
        <React.Fragment key={`miss-${node.id}`}>
          <CustomLine start={[0,0,0]} end={node.position} color="#ef4444" dashed={true} />
          <Node position={node.position} color={node.color} label={node.id} />
        </React.Fragment>
      ))}
    </group>
  );
};

const SkillGap3D = ({ analysis, preferredJobRole }) => {
  return (
    <div className="w-full h-[400px] relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50">
      <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
        
        <SkillGraph 
          matchingSkills={analysis.matchingSkills} 
          missingSkills={analysis.missingSkills} 
          preferredJobRole={preferredJobRole}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={false}
          maxDistance={20}
          minDistance={5}
        />
      </Canvas>
      {/* Overlay gradient mask to blend with the container nicely */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 30%, rgba(15, 23, 42, 0.4) 100%)'
      }}></div>
      <div className="absolute top-4 left-4 text-xs font-medium text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50 backdrop-blur-md">
        Interactive 3D View (Drag to rotate)
      </div>
    </div>
  );
};

export default SkillGap3D;
