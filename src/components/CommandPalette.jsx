import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Command, FilePlus2, PanelBottom, PanelRight, Moon, Sun, Home, TerminalSquare } from 'lucide-react';

export default function CommandPalette() {
  const { cmdPaletteOpen, toggleCmdPalette }=useStore();
  const [search,setSearch]=useState(''); const input=useRef(null);
  useEffect(()=>{if(cmdPaletteOpen) setTimeout(()=>input.current?.focus(),0)},[cmdPaletteOpen]);
  useEffect(()=>{const fn=e=>{const mod=e.ctrlKey||e.metaKey;if(mod&&e.shiftKey&&e.key.toLowerCase()==='p'){e.preventDefault();toggleCmdPalette()} if(e.key==='Escape'&&cmdPaletteOpen)toggleCmdPalette();};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)},[cmdPaletteOpen]);
  if(!cmdPaletteOpen)return null;
  const s=useStore.getState();
  const commands=[
    ['New Project','Create a language starter workspace',FilePlus2,()=>s.setView('languages')],
    ['Save Workspace','Write project files to the selected folder',Command,()=>s.saveProject()],
    ['Toggle Explorer','Show or hide the file explorer',PanelRight,()=>s.toggleSidebar()],
    ['Toggle Terminal','Open integrated terminal',TerminalSquare,()=>s.toggleTerminalPanel()],
    ['Live Preview','Open web preview',PanelRight,()=>s.setAiMode('preview')],
    ['Copilot Chat','Open coding assistant',Command,()=>s.setAiMode('chat')],
    ['Dark Theme','Use CodeForge dark theme',Moon,()=>s.setTheme('github-dark')],
    ['Light Theme','Use light editor theme',Sun,()=>s.setTheme('vs-light')],
    ['Welcome Screen','Return to CodeForge welcome',Home,()=>s.setView('welcome')]
  ];
  const filtered=commands.filter(c=>`${c[0]} ${c[1]}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="palette-backdrop" onMouseDown={toggleCmdPalette}><div className="cmd-palette" onMouseDown={e=>e.stopPropagation()}>
    <div className="palette-input"><Search size={17}/><input ref={input} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Type a command..." /></div>
    <div className="palette-list">{filtered.map(([name,desc,Icon,action])=><button className="cmd-item" key={name} onClick={()=>{action();toggleCmdPalette();setSearch('')}}><Icon size={17}/><span><b>{name}</b><small>{desc}</small></span></button>)}{!filtered.length&&<div className="no-results">No commands found</div>}</div>
    <div className="palette-hint">↑↓ Navigate <span>↵ Run</span> <span>Esc Close</span></div>
  </div></div>;
}
