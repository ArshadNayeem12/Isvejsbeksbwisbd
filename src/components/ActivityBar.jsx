import React from 'react';
import { Files, Search, GitBranch, Blocks, Bot, Settings, Play, TerminalSquare } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ActivityBar() {
  const { activeSidebar, setActiveSidebar, toggleSidebar, sidebarVisible, showAIPanel, setAiMode, showTerminalPanel, toggleTerminalPanel } = useStore();
  const nav = view => activeSidebar === view ? toggleSidebar() : setActiveSidebar(view);
  return <div className="activity-bar">
    <div className="activity-top">
      <div className="activity-logo"><span>CF</span></div>
      <Files className={`icon ${sidebarVisible&&activeSidebar==='explorer'?'active':''}`} onClick={()=>nav('explorer')} title="Explorer"/>
      <Search className={`icon ${sidebarVisible&&activeSidebar==='search'?'active':''}`} onClick={()=>nav('search')} title="Search"/>
      <GitBranch className={`icon ${sidebarVisible&&activeSidebar==='git'?'active':''}`} onClick={()=>nav('git')} title="Source Control"/>
      <Blocks className={`icon ${sidebarVisible&&activeSidebar==='extensions'?'active':''}`} onClick={()=>nav('extensions')} title="Extensions"/>
    </div>
    <div className="activity-bottom">
      <Play className={`icon ${showAIPanel?'active':''}`} onClick={()=>setAiMode('preview')} title="Live Preview"/>
      <TerminalSquare className={`icon ${showTerminalPanel?'active':''}`} onClick={toggleTerminalPanel} title="Terminal"/>
      <Bot className="icon" onClick={()=>setAiMode('chat')} title="Copilot"/>
      <Settings className={`icon ${sidebarVisible&&activeSidebar==='settings'?'active':''}`} onClick={()=>nav('settings')} title="Settings"/>
    </div>
  </div>;
}
