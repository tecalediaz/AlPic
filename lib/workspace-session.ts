export function workspaceStyleStorageKey(codeId: string) {
  return `alpic-workspace-style-${codeId}`;
}

export function rememberWorkspaceStyle(codeId: string, styleId: string) {
  sessionStorage.setItem(workspaceStyleStorageKey(codeId), styleId);
}

export function forgetWorkspaceStyle(codeId: string) {
  sessionStorage.removeItem(workspaceStyleStorageKey(codeId));
}

export function getRememberedWorkspaceStyleId(codeId: string): string | null {
  return sessionStorage.getItem(workspaceStyleStorageKey(codeId));
}
