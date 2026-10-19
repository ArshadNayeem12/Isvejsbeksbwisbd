export interface WorkspaceFile { name: string; content: string; }
export interface CodeForgeNativePlugin {
  openCodeServer(options?: { url?: string }): Promise<void>;
  pickDirectory(): Promise<{ path: string }>;
  getDirectory(): Promise<{ path?: string | null }>;
  writeFiles(options: { files: WorkspaceFile[] }): Promise<{ count: number }>;
  openPreview(options: { html: string }): Promise<void>;
}
export const CodeForgeNative: CodeForgeNativePlugin;
