import React, { useState } from 'react';
import { Code2, FolderOpen, Plus, Settings, Sparkles, TerminalSquare, Zap, ArrowRight, ShieldCheck, Monitor, Keyboard, Mouse } from 'lucide-react';
import { CodeForgeNative } from '@codeforge/native';
import { useStore } from '../store/useStore';

export default function WelcomeScreen() {
  const { closeWelcome, selectWorkspaceFolder } = useStore();
  const [busy, setBusy] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://127.0.0.1:8080');
  const [serverError, setServerError] = useState('');
  const openCodeServer = async () => {
    setBusy(true);
    setServerError('');
    try {
      await CodeForgeNative.openCodeServer({ url: serverUrl.trim() || 'http://127.0.0.1:8080' });
    } catch (e) {
      setServerError(e?.message || 'Could not open code-server. Build/install the Android app and start code-server in Termux first.');
    } finally {
      setBusy(false);
    }
  };
  const chooseFolder = async () => {
    setBusy(true);
    const folder = await selectWorkspaceFolder();
    setBusy(false);
    if (folder) closeWelcome();
  };
  return (
    <div className="welcome-screen">
      <div className="welcome-glow glow-one" /><div className="welcome-glow glow-two" />
      <div className="welcome-card">
        <div className="welcome-brand"><div className="brand-mark"><Code2 size={28}/></div><div><div className="brand-title">CodeForge</div><div className="brand-subtitle">Studio · Advanced Mobile IDE</div></div></div>
        <div className="welcome-copy"><span className="eyebrow"><Sparkles size={13}/> YOUR CODING WORKSPACE</span><h1>Code faster.<br/><span>Ship smarter.</span></h1><p>A compact, VS Code-inspired workspace with Monaco, Emmet, live web preview, project templates, Copilot tools and real folder saving.</p></div>
        <div className="welcome-actions">
          <button className="primary-action" onClick={closeWelcome}><Plus size={18}/> New Project <ArrowRight size={16}/></button>
          <button className="secondary-action" disabled={busy} onClick={chooseFolder}><FolderOpen size={17}/> {busy ? 'Opening folder…' : 'Choose Workspace Folder'}</button>
        </div>
        <div className="permission-note"><ShieldCheck size={15}/><span><b>Folder access is user-controlled.</b> CodeForge asks you to choose a folder before writing project files.</span></div>
        <section className="codeserver-connect" style={{marginTop: 18, padding: 16, border: '1px solid var(--border-color, #3b3b3b)', borderRadius: 12, background: 'rgba(127,127,127,.08)'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, fontWeight:700, marginBottom:8}}><Monitor size={17}/> Connect VS Code Server <span style={{fontSize:11, opacity:.7, fontWeight:500}}>LANDSCAPE</span></div>
          <p style={{fontSize:12, opacity:.75, margin:'0 0 10px'}}>Start <code>code-server --bind-addr 127.0.0.1:8080</code> in Termux, then connect here. Opens inside CodeForge, not Chrome.</p>
          <input aria-label="Code server URL" value={serverUrl} onChange={e=>setServerUrl(e.target.value)} placeholder="http://127.0.0.1:8080" style={{width:'100%', boxSizing:'border-box', padding:'10px 12px', marginBottom:10, borderRadius:8, border:'1px solid var(--border-color, #555)', background:'var(--input-background, #1e1e1e)', color:'var(--text-color, #fff)', fontSize:13}} />
          <button className="primary-action" disabled={busy} onClick={openCodeServer} style={{width:'100%', justifyContent:'center'}}><Monitor size={16}/>{busy ? 'Connecting…' : 'Open code-server inside CodeForge'}<ArrowRight size={15}/></button>
          <div style={{display:'flex', gap:14, flexWrap:'wrap', fontSize:11, opacity:.72, marginTop:10}}><span><Keyboard size={12} style={{verticalAlign:'middle'}}/> Physical keyboard</span><span><Mouse size={12} style={{verticalAlign:'middle'}}/> Mouse / trackpad</span><span>Landscape locked</span></div>
          {serverError && <p role="alert" style={{color:'#ff8585', fontSize:12, marginBottom:0}}>{serverError}</p>}
        </section>
        <div className="welcome-features"><div><Zap size={16}/><span><b>Dense Monaco Editor</b><small>Small text, more code on screen</small></span></div><div><TerminalSquare size={16}/><span><b>Live Preview</b><small>Preview beside your code</small></span></div><div><Settings size={16}/><span><b>Production workflow</b><small>Save to your selected folder</small></span></div></div>
        <div className="welcome-footer">CodeForge Studio <span>•</span> Local-first <span>•</span> Android + Web</div>
      </div>
    </div>
  );
}
