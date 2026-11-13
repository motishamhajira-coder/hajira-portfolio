import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

function Universe({ skills, sphericalLayout, lightTheme }) {
  const field = useRef();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const nodes = useMemo(() => {
    const total = skills.reduce((count, [, ...items]) => count + items.length, 0);
    let sphereIndex = 0;
    return skills.flatMap(([category, ...items], cluster) => items.map((item, index) => {
    const split = item.lastIndexOf(' · ');
    const name = item.slice(0, split);
    const angle = (index / items.length) * Math.PI * 2 + cluster * 1.17;
    const clusterAngle = cluster * Math.PI * 2 / skills.length - Math.PI / 2;
    const clusterRadius = 0.62 + (cluster % 2) * 0.08;
    const jitter = (index % 3 - 1) * 0.12;
    const position = sphericalLayout
      ? (() => {
          const current = sphereIndex++;
          const y = THREE.MathUtils.clamp(1 - 2 * (current + 0.5) / total + Math.sin(current * 1.73) * 0.012, -0.99, 0.99);
          const ring = Math.sqrt(1 - y * y);
          const theta = current * Math.PI * (3 - Math.sqrt(5)) + Math.sin(current * 2.39) * 0.035;
          const radius = 1.04 + Math.sin(current * 5.17) * 0.025;
          return new THREE.Vector3(Math.cos(theta) * ring, y, Math.sin(theta) * ring).multiplyScalar(radius);
        })()
      : new THREE.Vector3(Math.cos(clusterAngle) * clusterRadius + Math.cos(angle) * (0.28 + jitter), Math.sin(index * 1.7 + cluster) * 0.65, Math.sin(clusterAngle) * clusterRadius + Math.sin(angle) * (0.28 + jitter));
    return { name, category, level: item.slice(split + 3), cluster, position };
  }));
  }, [skills, sphericalLayout]);
  const links = useMemo(() => {
    const edgeMap = new Map();
    const addEdge = (a, b) => {
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      edgeMap.set(`${start}-${end}`, [start, end]);
    };
    nodes.forEach((node, i) => {
      const nearest = nodes.map((candidate, j) => ({ j, distance: node.position.distanceToSquared(candidate.position) }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);
      nearest.forEach(({ j }) => addEdge(i, j));
    });

    // Add only the closest bridges needed to make the neighbor graph cohesive.
    const parent = nodes.map((_, i) => i);
    const find = (i) => {
      while (parent[i] !== i) {
        parent[i] = parent[parent[i]];
        i = parent[i];
      }
      return i;
    };
    const join = (a, b) => {
      const rootA = find(a);
      const rootB = find(b);
      if (rootA === rootB) return false;
      parent[rootB] = rootA;
      return true;
    };
    edgeMap.forEach(([a, b]) => join(a, b));

    if (nodes.length > 1) {
      const reached = new Set([0]);
      while (reached.size < nodes.length) {
        let closest = null;
        reached.forEach((a) => nodes.forEach((node, b) => {
          if (reached.has(b)) return;
          const distance = nodes[a].position.distanceToSquared(node.position);
          if (!closest || distance < closest.distance) closest = { a, b, distance };
        }));
        if (!closest) break;
        if (join(closest.a, closest.b)) addEdge(closest.a, closest.b);
        reached.add(closest.b);
      }
    }
    return [...edgeMap.values()];
  }, [nodes]);
  const dust = useMemo(()=>Array.from({length:360},(_,i)=>{const u=Math.random(),v=Math.random(),theta=2*Math.PI*u,phi=Math.acos(2*v-1),r=1.45+Math.random()*.55;return [r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta)]}).flat(),[]);
  useFrame((state,delta)=>{if(field.current&&!reducedMotion){field.current.rotation.y+=delta*.035;field.current.rotation.x=Math.sin(state.clock.elapsedTime*.11)*.025;}});
  return <group ref={field} scale={1.3}>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" count={dust.length/3} array={new Float32Array(dust)} itemSize={3}/></bufferGeometry><pointsMaterial color="#92929B" size={.012} transparent opacity={.42} sizeAttenuation/></points>
    {links.map(([a,b],i)=>{const on=selected===a||selected===b||(selected!==null&&nodes[selected].cluster===nodes[a].cluster);const alternateColor=sphericalLayout&&lightTheme;return <primitive key={i} object={new THREE.Line(new THREE.BufferGeometry().setFromPoints([nodes[a].position,nodes[b].position]),new THREE.LineBasicMaterial({color:on?(alternateColor?'#101014':'#F2F0EB'):(alternateColor?'#55545D':'#92929B'),transparent:true,opacity:on?.5:.14}))}/>;})}
    {nodes.map((node,i)=>{const chosen=selected===i,related=selected!==null&&nodes[selected].cluster===node.cluster;const alternateColor=sphericalLayout&&lightTheme;return <group key={node.name} position={node.position.toArray()} onPointerOver={e=>{e.stopPropagation();setHovered(i);}} onPointerOut={()=>{setHovered(null);}} onClick={e=>{e.stopPropagation();setSelected(selected===i?null:i);}}><mesh><sphereGeometry args={[chosen?.052:related?.038:.026,12,12]}/><meshBasicMaterial color={chosen?(alternateColor?'#101014':'#FFFFFF'):related?(alternateColor?'#55545D':'#D8D6D1'):(alternateColor?'#92929B':'#B8B5AE')}/></mesh>{(hovered===i||chosen)&&<Html center distanceFactor={8}><div className="skill-node-label"><strong>{node.name}</strong>{chosen&&<small>{node.category} · {node.level}</small>}</div></Html>}</group>})}
  </group>;
}
export default function SkillSphere({ skills }) {
 const sphericalLayout = new URLSearchParams(window.location.search).get('hero') !== 'network';
 const lightTheme = document.documentElement.dataset.theme === 'light';
 return <div className="orb-wrap skill-sphere" aria-label={sphericalLayout ? "Interactive spherical particle universe of all technical skills" : "Interactive particle network of all technical skills"}><Canvas dpr={[1,1.35]} camera={{position:[0,0,4.2],fov:48}}><ambientLight intensity={1.1}/><pointLight position={[2,2,3]} intensity={8} color="#F2F0EB"/><Universe skills={skills} sphericalLayout={sphericalLayout} lightTheme={lightTheme}/></Canvas><span className="sphere-monogram" aria-hidden="true">HSM</span><span className="orb-caption">SKILLS IN CONNECTION · 01</span></div>;
}
