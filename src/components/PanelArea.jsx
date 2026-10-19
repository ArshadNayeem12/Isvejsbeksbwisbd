import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useStore } from '../store/useStore';

export default function PanelArea() {
  const { showTerminalPanel, files, createFile, deleteFile } = useStore();
  const [activeTab,setActiveTab]=useState('TERMINAL');
  const terminalRef=useRef(null), termRef=useRef(null);

  useEffect(()=>{
    if(!showTerminalPanel || activeTab!=='TERMINAL' || !terminalRef.current) return;
    if(termRef.current){setTimeout(()=>termRef.current.fitAddon.fit(),50);return}
    const term=new Terminal({theme:{background:'#0a0f17',foreground:'#dbe5f2',cursor:'#67e8f9'},fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace',fontSize:12,cursorBlink:true});
    const fitAddon=new FitAddon();term.loadAddon(fitAddon);term.open(terminalRef.current);setTimeout(()=>fitAddon.fit(),80);
    term.writeln('\x1b[36mCodeForge Terminal\x1b[0m  •  local workspace');
    term.writeln('Type \x1b[33mhelp\x1b[0m for supported commands.');
    term.write('\r\n\x1b[36mcodeforge\x1b[0m $ ');
    let buffer='';
    const printPrompt=()=>term.write('\r\n\x1b[36mcodeforge\x1b[0m $ ');
    const command=(cmd)=>{
      const [name,...args]=cmd.trim().split(/\s+/); if(!name)return printPrompt();
      const state=useStore.getState();
      if(name==='help'){term.writeln('\r\n  ls     list files\r\n  cat    read a file\r\n  touch  create a file\r\n  rm     delete a file\r\n  clear  clear terminal\r\n  pwd    show workspace');}
      else if(name==='ls'){term.writeln('\r\n'+(state.files.map(f=>f.name).join('  ')||'(empty)'))}
      else if(name==='pwd'){term.writeln('\r\n/workspace')}
      else if(name==='clear'){term.clear();term.write('\x1b[36mcodeforge\x1b[0m $ ');return}
      else if(name==='cat'&&args[0]){const f=state.files.find(x=>x.name===args[0]);term.writeln(f?`\r\n${f.content.replace(/\n/g,'\r\n')}`:`\r\ncat: ${args[0]}: not found`)}
      else if(name==='touch'&&args[0]){state.createFile(args[0]);term.writeln(`\r\ncreated ${args[0]}`)}
      else if(name==='rm'&&args[0]){const f=state.files.find(x=>x.name===args[0]);if(f){state.deleteFile(f.id);term.writeln(`\r\ndeleted ${args[0]}`)}else term.writeln(`\r\nrm: ${args[0]}: not found`)}
      else term.writeln(`\r\n${name}: command not found`);
      printPrompt();
    };
    const disposable=term.onData(data=>{
      if(data==='\r'){command(buffer);buffer=''}
      else if(data==='\u007f'){if(buffer){buffer=buffer.slice(0,-1);term.write('\b \b')}}
      else if(data==='\u0003'){buffer='';term.write('^C');printPrompt()}
      else if(data>=' '&&data<='\x7e'){buffer+=data;term.write(data)}
    });
    termRef.current={term,fitAddon,disposable};
    const resize=()=>fitAddon.fit();window.addEventListener('resize',resize);
    return ()=>window.removeEventListener('resize',resize);
  },[showTerminalPanel,activeTab]);

  useEffect(()=>()=>{termRef.current?.disposable?.dispose();termRef.current?.term?.dispose();termRef.current=null},[showTerminalPanel===false]);

  if(!showTerminalPanel)return null;
  return <div className="panel-area">
    <div className="panel-tabs">{['PROBLEMS','OUTPUT','TERMINAL','GIT'].map(t=><span key={t} className={`panel-tab ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)}>{t}</span>)}</div>
    <div style={{flex:1,minHeight:0}}>
      {activeTab==='TERMINAL'&&<div ref={terminalRef} className="terminal-wrap"/>}
      {activeTab==='PROBLEMS'&&<div className="panel-placeholder">✓ No problems detected in the current workspace.</div>}
      {activeTab==='OUTPUT'&&<div className="panel-placeholder">Build and preview output will appear here.</div>}
      {activeTab==='GIT'&&<div className="panel-placeholder">Local branch: <b>main</b><br/>Git integration can be connected when a repository is available.</div>}
    </div>
  </div>;
}
