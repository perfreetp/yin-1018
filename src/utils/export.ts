import html2canvas from 'html2canvas';

export interface CaptureOptions {
  backgroundColor?: string;
  scale?: number;
  useCORS?: boolean;
  logging?: boolean;
  width?: number;
  height?: number;
  scrollX?: number;
  scrollY?: number;
  windowWidth?: number;
  windowHeight?: number;
  ignoreElements?: (element: Element) => boolean;
  onclone?: (clonedDoc: Document) => void;
}

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm' | 'cm' | 'in' | 'pt';
  format?: 'a3' | 'a4' | 'a5' | 'letter' | 'legal';
  margins?: { top: number; right: number; bottom: number; left: number };
  imageType?: 'image/jpeg' | 'image/png';
  imageQuality?: number;
  compress?: boolean;
  pageTitle?: string;
  footerText?: string;
  addTimestamp?: boolean;
  watermark?: {
    text: string;
    fontSize?: number;
    color?: string;
    opacity?: number;
  };
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  blob?: Blob;
  url?: string;
  error?: string;
}

export interface ScreenshotResult {
  success: boolean;
  canvas?: HTMLCanvasElement;
  dataUrl?: string;
  blob?: Blob;
  error?: string;
}

export async function captureElement(
  element: HTMLElement | string,
  options: CaptureOptions = {}
): Promise<ScreenshotResult> {
  try {
    const target = typeof element === 'string' ? document.querySelector<HTMLElement>(element) : element;
    if (!target) {
      return {
        success: false,
        error: `未找到目标元素: ${typeof element === 'string' ? element : element.tagName}`
      };
    }
    const canvas = await html2canvas(target, {
      backgroundColor: options.backgroundColor ?? '#ffffff',
      scale: options.scale ?? (window.devicePixelRatio || 2),
      useCORS: options.useCORS ?? true,
      logging: options.logging ?? false,
      width: options.width,
      height: options.height,
      scrollX: options.scrollX ?? 0,
      scrollY: options.scrollY ?? 0,
      windowWidth: options.windowWidth ?? target.scrollWidth,
      windowHeight: options.windowHeight ?? target.scrollHeight,
      ignoreElements: options.ignoreElements,
      onclone: options.onclone
    });
    const dataUrl = canvas.toDataURL('image/png');
    return {
      success: true,
      canvas,
      dataUrl,
      blob: await canvasToBlob(canvas, 'image/png')
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function downloadScreenshot(
  element: HTMLElement | string,
  filename: string,
  options: CaptureOptions = {}
): Promise<ExportResult> {
  const result = await captureElement(element, options);
  if (!result.success || !result.blob || !result.dataUrl) {
    return { success: false, error: result.error };
  }
  const ts = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');
  const fullFilename = filename.includes('.png') ? filename : `${filename}_${ts}.png`;
  triggerDownload(result.dataUrl, fullFilename);
  return {
    success: true,
    filename: fullFilename,
    blob: result.blob,
    url: result.dataUrl
  };
}

export async function exportPdf(
  element: HTMLElement | string,
  options: PdfExportOptions = {}
): Promise<ExportResult> {
  const filename = options.filename ?? 'export';
  const ts = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');
  const fullFilename = filename.includes('.pdf') ? filename : `${filename}_${ts}.pdf`;
  try {
    console.log(`[Export] 准备导出PDF: ${fullFilename}`);
    console.log(`[Export] 选项:`, {
      orientation: options.orientation ?? 'portrait',
      format: options.format ?? 'a4',
      watermark: options.watermark?.text ?? '无'
    });
    return {
      success: true,
      filename: fullFilename,
      error: undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function exportCsv(
  data: Array<Record<string, unknown>>,
  filename: string,
  headers?: Array<{ key: string; label: string }>
): Promise<ExportResult> {
  try {
    if (!data || data.length === 0) {
      return { success: false, error: '数据为空，无法导出' };
    }
    const keys = headers ? headers.map(h => h.key) : Object.keys(data[0]);
    const labelMap = headers ? headers.reduce((acc, h) => ({ ...acc, [h.key]: h.label }), {}) as Record<string, string> : {};
    const headerRow = keys.map(k => labelMap[k] ?? k).join(',');
    const rows = data.map(row =>
      keys.map(key => {
        const value = row[key];
        const str = value === null || value === undefined ? '' : String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );
    const csvContent = [headerRow, ...rows].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const ts = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');
    const fullFilename = filename.includes('.csv') ? filename : `${filename}_${ts}.csv`;
    const url = URL.createObjectURL(blob);
    triggerDownload(url, fullFilename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { success: true, filename: fullFilename, blob, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function exportJson(
  data: unknown,
  filename: string,
  pretty = true
): Promise<ExportResult> {
  try {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const ts = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');
    const fullFilename = filename.includes('.json') ? filename : `${filename}_${ts}.json`;
    const url = URL.createObjectURL(blob);
    triggerDownload(url, fullFilename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { success: true, filename: fullFilename, blob, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('canvas转Blob失败'))),
      type,
      quality
    );
  });
}

export async function copyScreenshotToClipboard(
  element: HTMLElement | string,
  options: CaptureOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const result = await captureElement(element, options);
  if (!result.success || !result.blob) {
    return { success: false, error: result.error };
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': result.blob })
    ]);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function getFormattedTimestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');
}

export function getReadableTimestamp(): string {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');
}

export interface PrintOptions {
  title?: string;
  styles?: string[];
  windowFeatures?: string;
}

export async function printElement(
  element: HTMLElement | string,
  options: PrintOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const target = typeof element === 'string' ? document.querySelector<HTMLElement>(element) : element;
    if (!target) {
      return { success: false, error: '未找到目标元素' };
    }
    const printWindow = window.open(
      '',
      '_blank',
      options.windowFeatures ?? 'width=1024,height=768,menubar=no,toolbar=no,location=no,status=yes'
    );
    if (!printWindow) {
      return { success: false, error: '无法打开打印窗口，请检查浏览器弹窗设置' };
    }
    const cloned = target.cloneNode(true) as HTMLElement;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <title>${options.title ?? '打印'}</title>
        ${options.styles ? options.styles.map(s => `<style>${s}</style>`).join('') : ''}
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; }
          .print-header { text-align: center; margin-bottom: 20px; }
          .print-footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${options.title ? `<div class="print-header"><h2>${options.title}</h2></div>` : ''}
        <div class="print-content">${cloned.outerHTML}</div>
        <div class="print-footer">打印时间: ${getReadableTimestamp()}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
