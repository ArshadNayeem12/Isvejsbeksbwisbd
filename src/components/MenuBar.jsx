import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Code2, ChevronDown } from 'lucide-react';

export default function MenuBar() {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const store = useStore();
  useEffect(()=>{const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setActive(null)};document.addEventListener('mousedown',fn);return()=>document.removeEventListener('mousedown',fn)},[]);
  const act = a => { setActive(null); const s=useStore.getState(); if(a==='new') s.setView('languages'); if(a==='save') s.saveProject(); if(a==='close') s.closeTab(s.activeFileId); if(a==='explorer') s.toggleSidebar(); if(a==='terminal') s.toggleTerminalPanel(); if(a==='preview') s.setAiMode('preview'); if(a==='copilot') s.setAiMode('chat'); if(a==='palette') s.toggleCmdPalette(); if(a==='welcome') s.setView('welcome'); };
  const menus={File:[['New Project','new','Ctrl+N'],['Save','save','Ctrl+S'],['Close Editor','close','Ctrl+W']],View:[['Command Palette','palette','Ctrl+Shift+P'],['Explorer','explorer'],['Terminal','terminal','Ctrl+`'],['Live Preview','preview'],['Copilot','copilot']],Help:[['Welcome','welcome']]};
  return <div className="menu-bar" ref={ref}>
    <div className="menu-brand"><Code2 size={17}/><b>CodeForge</b></div>
    {Object.entries(menus).map(([name,items])=><div className="menu-item" key={name} onClick={()=>setActive(active===name?null:name)}>{name}<ChevronDown size={11}/>
      {active===name&&<div className="menu-dropdown">{items.map(([label,a,key])=><button key={label} onClick={e=>{e.stopPropagation();act(a)}}><span>{label}</span><kbd>{key||''}</kbd></button>)}</div>}
    </div>)}
    <div className="menu-spacer"/>
    <button className="quick-command" onClick={()=>store.toggleCmdPalette()}><span>⌕</span> Search commands <kbd>Ctrl ⇧ P</kbd></button>
  </div>;
}
