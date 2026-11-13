import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

function Network({ items }) {
 const [selected,setSelected]=useState(null),[hovered,setHovered]=useState(null);
 const count=items.length;
 const points=items.map((_,i)=>{
   const t=(i+.5)/count;
   const band=Math.sqrt(t);
   const angle=i*2.399963+Math.sin(i*1.7)*.42;
   const jitterX=Math.sin(i*4.17)*7;
   const jitterY=Math.cos(i*2.31)*6;
   return [50+Math.cos(angle)*31*band+jitterX,50+Math.sin(angle)*31*band+jitterY];
 });
 const edgeSet=new Set();
 for(let i=0;i<count;i++){
   const nearest=points.map((p,j)=>({j,d:(p[0]-points[i][0])**2+(p[1]-points[i][1])**2})).filter(x=>x.j!==i).sort((a,b)=>a.d-b.d).slice(0,Math.min(2,count-1));
   nearest.forEach(({j})=>edgeSet.add(`${Math.min(i,j)}-${Math.max(i,j)}`));
 }
 const edges=[...edgeSet].map(edge=>edge.split('-').map(Number)); return <div className="skill-network"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{edges.map(([a,b])=><line key={`${a}-${b}`} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} className={hovered===a||hovered===b||selected===a||selected===b?'active':''}/> )}</svg>{items.map((item,i)=>{const cut=item.lastIndexOf(' · '),name=item.slice(0,cut),level=item.slice(cut+3),chosen=i===selected,connected=selected!==null&&edges.some(([a,b])=>(a===selected&&b===i)||(b===selected&&a===i));return <button key={item} className={`skill-node ${chosen?'selected':''} ${connected?'connected':''} ${hovered===i?'is-hovered':''}`} style={{'--x':`${points[i][0]}%`,'--y':`${points[i][1]}%`}} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(i)} onBlur={()=>setHovered(null)} onClick={()=>setSelected(chosen?null:i)} aria-label={`${name}, ${level}`}><i/><span><strong>{name}</strong>{chosen&&<small>{level}</small>}</span></button>})}</div>
}export default function SkillCategoryOverlay({skills}) {
 const [active,setActive]=useState(null);
 useEffect(()=>{if(!active)return;const prev=document.body.style.overflow;document.body.style.overflow='hidden';const key=e=>e.key==='Escape'&&setActive(null);window.addEventListener('keydown',key);return()=>{document.body.style.overflow=prev;window.removeEventListener('keydown',key)}},[active]);
 return <><div className="skill-cards">{skills.map(([category,...items])=><button className="skill-card" key={category} onClick={()=>setActive([category,items])}><span>{category}</span><small>{items.length} SKILLS <b>↗</b></small></button>)}</div>{active&&createPortal(<div className="skill-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setActive(null)}><section className="skill-modal" role="dialog" aria-modal="true" aria-labelledby="skill-modal-title"><header><div><p className="eyebrow">TECHNICAL SKILLS</p><h2 id="skill-modal-title">{active[0]}</h2></div><button className="skill-modal-close" onClick={()=>setActive(null)} aria-label="Close skills"><X/></button></header><Network items={active[1]}/><p className="skill-modal-hint">Select a node to view proficiency · Esc to close</p></section></div>,document.body)}</>;
}



