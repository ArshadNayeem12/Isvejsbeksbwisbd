import { Capacitor } from '@capacitor/core';
import { CodeForgeNative } from '@codeforge/native';

let webFolderHandle = null;

export async function chooseWorkspaceFolder() {
  if (Capacitor.getPlatform() === 'android') {
    const result = await CodeForgeNative.pickDirectory();
    if (!result?.path) throw new Error('No folder was selected.');
    return { path: result.path, native: true };
  }
  if ('showDirectoryPicker' in window) {
    webFolderHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    return { name: webFolderHandle.name, native: false, web: true };
  }
  throw new Error('Folder access is not available on this platform.');
}

export async function saveWorkspaceToFolder(folder, files) {
  if (folder?.native) {
    const result = await CodeForgeNative.writeFiles({ files: files.map(({ name, content }) => ({ name, content })) });
    return { count: result?.count ?? files.length };
  }
  if (folder?.web || webFolderHandle) {
    const handle = webFolderHandle;
    if (!handle) throw new Error('The browser folder grant expired. Choose the folder again.');
    for (const file of files) {
      const handleFile = await handle.getFileHandle(file.name, { create: true });
      const writable = await handleFile.createWritable();
      await writable.write(file.content);
      await writable.close();
    }
    return { count: files.length };
  }
  throw new Error('No writable workspace folder is selected.');
}

export async function openPreviewHtml(html) {
  if (Capacitor.getPlatform() === 'android') return CodeForgeNative.openPreview({ html });
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  const popup = window.open(dataUrl, '_blank', 'noopener,noreferrer');
  if (!popup) window.location.href = dataUrl;
}
