import React, { useEffect, useState } from 'react';
import MenuBar from './components/MenuBar';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import EditorArea from './components/EditorArea';
import PanelArea from './components/PanelArea';
import AIChatPanel from './components/AIChatPanel';
import CommandPalette from './components/CommandPalette';
import WelcomeScreen from './components/WelcomeScreen';
import LanguagePicker from './components/LanguagePicker';
import { useStore } from './store/useStore';
import { GitBranch, AlertCircle, XCircle, Wifi, Save, FolderOpen } from 'lucide-react';

export default function App() {
  const { view, showAIPanel, sidebarVisible, showTerminalPanel, theme, dirty, files, saveProject, saving, saveMessage, workspaceFolder } = useStore();
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [panelHeight, setPanelHeight] = useState(170);
  const [aiWidth, setAiWidth] = useState(430);
  const [resizing, setResizing] = useState(null);

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'vs-light');
    document.documentElement.style.setProperty('--sidebar-width', sidebarVisible ? `${sidebarWidth}px` : '0px');
    document.documentElement.style.setProperty('--panel-height', showTerminalPanel ? `${panelHeight}px` : '0px');
    document.documentElement.style.setProperty('--ai-width', showAIPanel ? `${aiWidth}px` : '0px');
  }, [theme, sidebarWidth, panelHeight, aiWidth, sidebarVisible, showTerminalPanel, showAIPanel]);

  useEffect(() => {
    const key = e => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); }
      if (mod && e.key.toLowerCase() === 'n') { e.preventDefault(); useStore.getState().setView('languages'); }
      if (mod && e.key.toLowerCase() === 'w') { e.preventDefault(); const s=useStore.getState(); if(s.activeFileId) s.closeTab(s.activeFileId); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [saveProject]);

  useEffect(() => {
    if (!dirty || view !== 'editor') return;
    const timer = setTimeout(() => useStore.getState().saveWorkspace(), 1200);
    return () => clearTimeout(timer);
  }, [files, dirty, view]);

  useEffect(() => {
    if (!resizing) return;
    const move = e => {
      if (resizing === 'sidebar') setSidebarWidth(Math.max(170, Math.min(e.clientX - 48, 340)));
      if (resizing === 'ai') setAiWidth(Math.max(320, Math.min(window.innerWidth - e.clientX, 620)));
      if (resizing === 'panel') setPanelHeight(Math.max(100, Math.min(window.innerHeight - e.clientY - 25, 360)));
    };
    const up = () => setResizing(null);
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [resizing]);

  if (view === 'welcome') return <WelcomeScreen />;
  if (view === 'languages') return <LanguagePicker />;

  let gridClass = 'ide-grid';
  if (!showAIPanel) gridClass += ' no-ai';
  if (!sidebarVisible) gridClass += ' no-sidebar';
  if (!showTerminalPanel) gridClass += ' no-panel';

  return (
    <div className={gridClass} style={resizing ? {cursor: 'col-resize', userSelect:'none'} : undefined}>
      <CommandPalette />
      <MenuBar />
      <ActivityBar />
      {sidebarVisible && <div className="sidebar-slot"><Sidebar/><div className="resizer-x" onMouseDown={() => setResizing('sidebar')}/></div>}
      <div className="editor-slot">
        <EditorArea/>
        {showTerminalPanel && <div className="resizer-y" onMouseDown={() => setResizing('panel')}/>} 
      </div>
      {showTerminalPanel && <PanelArea/>}
      {showAIPanel && <div className="ai-slot"><div className="resizer-x" onMouseDown={() => setResizing('ai')}/><AIChatPanel/></div>}
      <div className="status-bar">
        <div className="status-left">
          <span><GitBranch size={12}/> main</span><span className="status-sep"/>
          <span><XCircle size={12}/> 0</span><span><AlertCircle size={12}/> 0</span>
          <span className="connection"><Wifi size={12}/> {workspaceFolder ? 'Folder linked' : 'Local only'}</span>
        </div>
        <div className="status-right">
          {saveMessage && <span className="save-message">{saveMessage}</span>}
          {dirty && <button className="status-save" disabled={saving} onClick={saveProject}><Save size={12}/> {saving ? 'Saving…' : 'Save'}</button>}
          {!workspaceFolder && <button className="folder-link" onClick={()=>useStore.getState().selectWorkspaceFolder()}><FolderOpen size={12}/> Choose folder</button>}
          <span>Ln {useStore.getState().cursor.line}, Col {useStore.getState().cursor.column}</span><span>UTF-8</span><span>CodeForge</span>
        </div>
      </div>
    </div>
  );
}
