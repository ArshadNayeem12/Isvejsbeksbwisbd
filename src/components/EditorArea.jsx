import React, { useEffect, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es';
import { useStore } from '../store/useStore';
import { X, FileCode2, FileJson, FileText, FileType2, Circle } from 'lucide-react';

const icons = {
  html: <FileCode2 size={14}/>, css: <FileType2 size={14}/>,
  json: <FileJson size={14}/>, javascript: <span className="mini-lang js">JS</span>,
  typescript: <span className="mini-lang ts">TS</span>, python: <span className="mini-lang py">PY</span>
};

export default function EditorArea() {
  const { files, activeFileId, setActiveFile, openTabs, updateFileContent, closeTab, theme, setCursor, dirty } = useStore();
  const monaco = useMonaco();
  const configured = useRef(false);
  const currentFile = files.find(f => f.id === activeFileId);

  useEffect(() => {
    if (!monaco || configured.current) return;
    monaco.editor.defineTheme('codeforge-dark', {
      base: 'vs-dark', inherit: true, rules: [],
      colors: { 'editor.background': '#0b0f17', 'editorLineNumber.foreground': '#526071', 'editorLineNumber.activeForeground': '#b9c7da', 'editor.lineHighlightBackground': '#101827', 'editorCursor.foreground': '#67e8f9' }
    });
    monaco.editor.defineTheme('codeforge-light', {
      base: 'vs', inherit: true, rules: [],
      colors: { 'editor.background': '#fbfcfe', 'editorLineNumber.foreground': '#a1a9b5', 'editor.lineHighlightBackground': '#f3f6fa' }
    });
    try { emmetHTML(monaco); emmetCSS(monaco); emmetJSX(monaco); } catch (e) { console.warn('Emmet setup:', e); }
    configured.current = true;
  }, [monaco]);

  const monacoTheme = theme === 'vs-light' ? 'codeforge-light' : 'codeforge-dark';

  const getIcon = file => icons[file.language] || <FileText size={14}/>;

  return (
    <div className="editor-area">
      <div className="editor-tabs">
        {openTabs.map(id => {
          const file = files.find(f => f.id === id);
          if (!file) return null;
          return <div key={id} className={`tab ${activeFileId === id ? 'active' : 'inactive'}`} onClick={() => setActiveFile(id)}>
            {getIcon(file)} <span>{file.name}</span>{dirty && activeFileId === id && <Circle size={7} fill="currentColor" className="dirty-dot"/>}
            <X size={14} className="tab-close" onClick={e => { e.stopPropagation(); closeTab(id); }}/>
          </div>;
        })}
        {!openTabs.length && <div className="empty-tabs">No open editors</div>}
      </div>
      <div className="editor-wrapper">
        {currentFile ? <Editor
          key={currentFile.id}
          height="100%" language={currentFile.language} theme={monacoTheme} value={currentFile.content}
          onChange={value => updateFileContent(currentFile.id, value ?? '')}
          onMount={(editor) => {
            const update = () => {
              const p = editor.getPosition();
              if (p) setCursor({line:p.lineNumber, column:p.column});
            };
            editor.onDidChangeCursorPosition(update);
            update();
          }}
          options={{
            minimap: { enabled: window.innerWidth > 1050, renderCharacters: false, scale: 0.7 }, fontSize: 11, lineHeight: 16,
            wordWrap: 'off', smoothScrolling: true, cursorSmoothCaretAnimation: 'on',
            padding: {top: 8, bottom: 16}, automaticLayout: true,
            bracketPairColorization: {enabled:true}, guides: {bracketPairs:true},
            suggest: {selectOnLineChange:true, showWords:true}, quickSuggestions: true,
            tabSize: 2, insertSpaces: true, formatOnPaste: true, formatOnType: true,
            scrollbar: {verticalScrollbarSize: 7, horizontalScrollbarSize: 7, useShadows: false}
          }}
        /> : <div className="empty-editor"><FileCode2 size={34}/><h3>No file open</h3><p>Create or open a file from Explorer.</p></div>}
      </div>
    </div>
  );
}
