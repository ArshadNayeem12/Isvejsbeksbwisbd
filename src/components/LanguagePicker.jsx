import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, Code2, Check, Sparkles, FolderOpen, ShieldCheck } from 'lucide-react';
import { LANGUAGE_TEMPLATES, useStore } from '../store/useStore';

export default function LanguagePicker() {
  const { newProject, backToWelcome, workspaceFolder, selectWorkspaceFolder } = useStore();
  const [query,setQuery]=useState(''); const [selected,setSelected]=useState('html'); const [busy,setBusy]=useState(false);
  const keys=useMemo(()=>Object.keys(LANGUAGE_TEMPLATES).filter(k=>{const l=LANGUAGE_TEMPLATES[k];return `${l.label} ${l.description}`.toLowerCase().includes(query.toLowerCase())}),[query]);
  const create = async () => {
    setBusy(true);
    let folder = workspaceFolder;
    if (!folder) folder = await selectWorkspaceFolder();
    if (folder) { newProject(selected); setTimeout(() => useStore.getState().saveProject(), 0); }
    setBusy(false);
  };
  return <div className="language-screen">
    <div className="language-topbar"><button className="ghost-button" onClick={backToWelcome}><ArrowLeft size={17}/> Welcome</button><div className="language-title"><Code2 size={20}/> New Project</div><div className="step-pill"><span className="done"><Check size={12}/></span> 1. Welcome <ArrowRight size={12}/> <b>2. Language</b> <ArrowRight size={12}/> 3. Editor</div></div>
    <main className="language-content">
      <div className="language-heading"><div><span className="eyebrow"><Sparkles size={13}/> PROJECT GENERATOR</span><h1>Choose your language</h1><p>Select a template. CodeForge will create the starter files in your chosen workspace folder.</p></div><div className="language-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search languages…"/></div></div>
      <div className="folder-banner"><ShieldCheck size={16}/><span>{workspaceFolder ? <><b>Workspace folder selected.</b> New files will be written there.</> : <><b>Folder access required.</b> Create Project will open the system folder picker.</>}</span>{workspaceFolder ? <span className="folder-ready">READY</span> : <button onClick={selectWorkspaceFolder}><FolderOpen size={13}/> Choose folder</button>}</div>
      <div className="language-grid">{keys.map(key=>{const item=LANGUAGE_TEMPLATES[key];const active=selected===key;return <button key={key} className={`language-card ${active?'selected':''}`} onClick={()=>setSelected(key)}><div className="language-icon">{item.icon}</div><div className="language-info"><b>{item.label}</b><span>{item.description}</span><small>{item.files.length} starter file{item.files.length!==1?'s':''}</small></div>{active&&<div className="language-check"><Check size={15}/></div>}</button>})}</div>
      <div className="language-bottom"><span><b>{LANGUAGE_TEMPLATES[selected].label}</b> selected · {LANGUAGE_TEMPLATES[selected].files.map(f=>f.name).join(', ')}</span><button className="primary-action" disabled={busy} onClick={create}>{busy?'Preparing…':'Create Project'} <ArrowRight size={17}/></button></div>
    </main>
  </div>;
}
