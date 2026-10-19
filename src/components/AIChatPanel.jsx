import React, { useMemo, useState } from 'react';
import { X, Send, RefreshCw, Smartphone, Monitor, ExternalLink, Copy, Wand2, Bug, FileText, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generatePreviewHTML } from '../utils/generatePreview';
import { openPreviewHtml } from '../utils/native';

function localCopilot(question, file) {
  const q = question.toLowerCase();
  if (!file) return { content:'Open a file first and I will work against the active editor.', snippet:'' };
  if (q.includes('explain')) {
    const lines = file.content.split('\n').length;
    return { content:`${file.name} is a ${file.language} file with ${lines} lines. I inspected the current source locally. Ask “find bugs”, “refactor”, or “generate a navbar/button/form” for an actionable edit.` };
  }
  if (q.includes('bug') || q.includes('fix')) {
    const issues=[];
    if (file.language==='html' && !/<html[\s>]/i.test(file.content)) issues.push('No <html> root element was detected.');
    if (file.language==='html' && /<script[^>]*src=["']script\.js/i.test(file.content) && !/<\/body>/i.test(file.content)) issues.push('script.js is referenced but the document has no closing </body>.');
    if (file.language==='javascript' && /document\.querySelector\([^)]*\)/.test(file.content) && /\.addEventListener\(/.test(file.content) && !/\?\.|if\s*\(/.test(file.content)) issues.push('A queried element may be null before addEventListener runs.');
    return { content: issues.length ? `I found ${issues.length} likely issue${issues.length>1?'s':''}:\n• ${issues.join('\n• ')}` : 'No obvious structural issue was detected by the offline analyzer. Run the page in Live Preview and check the browser console for runtime errors.' };
  }
  if (q.includes('navbar')) return { content:'Generated a responsive navigation block. Use Apply to insert it into the active file.', snippet:`<nav class="site-nav" aria-label="Primary navigation">\n  <a class="logo" href="/">CodeForge</a>\n  <div class="nav-links">\n    <a href="#home">Home</a>\n    <a href="#about">About</a>\n    <a href="#contact">Contact</a>\n  </div>\n</nav>` };
  if (q.includes('button')) return { content:'Generated an accessible button component.', snippet:`<button type="button" class="primary-button" id="primaryButton">Get Started</button>` };
  if (q.includes('form')) return { content:'Generated a small accessible contact form.', snippet:`<form class="contact-form">\n  <label>Name<input name="name" autocomplete="name" required></label>\n  <label>Email<input name="email" type="email" autocomplete="email" required></label>\n  <button type="submit">Send</button>\n</form>` };
  if (q.includes('refactor')) {
    const refactored = file.content.replace(/var\s+/g,'const ');
    return { content:'I applied a safe local refactor: `var` declarations were changed to `const`. Review the diff before saving.', snippet:refactored };
  }
  return { content:'I can work offline on the active file. Try: “explain this file”, “find bugs”, “refactor this”, “generate a navbar”, “generate a button”, or “generate a form”.' };
}

export default function AIChatPanel() {
  const { showAIPanel,toggleAIPanel,aiMode,setAiMode,files,chatMessages,addChatMessage,activeFileId,updateFileContent }=useStore();
  const [input,setInput]=useState(''); const [previewKey,setPreviewKey]=useState(0); const [device,setDevice]=useState('desktop'); const [applied,setApplied]=useState(null);
  const file=files.find(x=>x.id===activeFileId);
  const preview=useMemo(()=>generatePreviewHTML(files),[files]);
  if(!showAIPanel)return null;
  const send=()=>{const q=input.trim();if(!q)return;addChatMessage({role:'user',content:q});setInput('');setTimeout(()=>addChatMessage({role:'ai',...localCopilot(q,file)}),80)};
  const applySnippet=(snippet)=>{if(!file||!snippet)return;updateFileContent(file.id,file.language==='html' ? `${file.content}\n\n${snippet}` : snippet);setApplied(snippet);setTimeout(()=>setApplied(null),1800)};
  const openBrowser=async()=>{await openPreviewHtml(preview)};
  return <div className="ai-panel">
    <div className="ai-head"><div className="ai-tabs"><button className={aiMode==='preview'?'active':''} onClick={()=>setAiMode('preview')}>LIVE PREVIEW</button><button className={aiMode==='chat'?'active':''} onClick={()=>setAiMode('chat')}><Sparkles size={12}/> COPILOT</button></div><div className="ai-actions">
      {aiMode==='preview'&&<><button className="panel-icon" onClick={openBrowser} title="Open preview in Chrome"><ExternalLink size={14}/></button><button className={`panel-icon ${device==='desktop'?'active':''}`} onClick={()=>setDevice('desktop')} title="Desktop preview"><Monitor size={14}/></button><button className={`panel-icon ${device==='mobile'?'active':''}`} onClick={()=>setDevice('mobile')} title="Mobile preview"><Smartphone size={14}/></button><button className="panel-icon" onClick={()=>setPreviewKey(k=>k+1)} title="Refresh preview"><RefreshCw size={14}/></button></>}
      <button className="panel-icon" onClick={toggleAIPanel} title="Close panel"><X size={15}/></button></div></div>
    <div className="panel-subbar">{aiMode==='preview'?<><span>Live HTML / CSS / JS</span><button onClick={openBrowser}><ExternalLink size={12}/> Open in Chrome</button></>:<><span>{file?`Working on ${file.name}`:'No active file'}</span><span className="copilot-tools"><Wand2 size={12}/> Offline coding assistant <Bug size={12}/><FileText size={12}/><Settings2 size={12}/></span></>}</div>
    <div className="ai-body">{aiMode==='chat'?<><div className="chat-scroll">{chatMessages.map((m,i)=><div className={`chat-bubble ${m.role}`} key={i}><div className="bubble-role">{m.role==='ai'?'COPILOT':'YOU'}</div><div>{m.content}</div>{m.snippet&&<div className="snippet"><pre>{m.snippet}</pre><div className="snippet-actions"><button onClick={()=>navigator.clipboard?.writeText(m.snippet)}><Copy size={10}/> Copy</button><button onClick={()=>applySnippet(m.snippet)}><Wand2 size={10}/> {applied===m.snippet?'Applied':'Apply'}</button></div></div>}</div>)}</div><div className="chat-input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask Copilot: find bugs, refactor, generate…"/><button onClick={send} aria-label="Send"><Send size={15}/></button></div></>:<div className="preview-shell"><iframe key={previewKey} title="CodeForge Live Preview" className="preview-frame" style={{width:device==='mobile'?'390px':'100%'}} srcDoc={preview} sandbox="allow-scripts allow-forms allow-modals"/></div>}</div>
  </div>;
}
