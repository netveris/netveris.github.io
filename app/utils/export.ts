// Export utilities for generating reports

export interface ExportData {
  toolName: string;
  timestamp: string;
  results: Record<string, unknown>;
}

export function exportAsJSON(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `netveris-${data.toolName}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsText(data: ExportData): void {
  let text = `Netveris Report - ${data.toolName}\n`;
  text += `Generated: ${data.timestamp}\n`;
  text += '='.repeat(60) + '\n\n';
  
  function formatValue(value: unknown, indent = 0): string {
    const spaces = ' '.repeat(indent);
    
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(v => `${spaces}- ${formatValue(v, indent + 2)}`).join('\n');
      }
      return Object.entries(value)
        .map(([k, v]) => `${spaces}${k}: ${formatValue(v, indent + 2)}`)
        .join('\n');
    }
    
    return String(value);
  }
  
  text += formatValue(data.results);
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `netveris-${data.toolName}-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateShareableLink(toolPath: string, params?: Record<string, string>): string {
  const url = new URL(toolPath, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}
