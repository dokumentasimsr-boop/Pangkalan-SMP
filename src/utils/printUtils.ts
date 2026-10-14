import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

/**
 * Utility for printing report documents and downloading them as clean PDF files.
 * Fully compatible with Tailwind CSS v4 OKLCH / modern CSS color functions.
 */

export interface PrintOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  customStyles?: string;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

export interface PdfDownloadOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  marginMm?: number;
  scale?: number;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

/**
 * Helper to load an HTMLImageElement from a Data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

/**
 * Automatically downloads an HTML element as a PDF file with clean multi-page slice handling.
 * Strips any UI card border, shadow, or container outline to ensure a clean document without unwanted margin lines.
 */
export async function downloadElementAsPdf(
  elementId: string,
  options: PdfDownloadOptions = {}
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    const err = new Error(`Element #${elementId} not found for PDF download`);
    console.error(err);
    if (options.onError) options.onError(err);
    return false;
  }

  const {
    filename = 'Laporan_Pramuka.pdf',
    orientation = 'portrait',
    format = 'a4',
    marginMm = 10,
    scale = 2,
    onStart,
    onSuccess,
    onError,
  } = options;

  if (onStart) onStart();

  try {
    // Generate crisp PNG using html-to-image
    // Force style overrides so outer container card borders and shadows are NOT drawn into the PDF
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: '',
      style: {
        border: 'none',
        borderWidth: '0px',
        outline: 'none',
        boxShadow: 'none',
        borderRadius: '0px',
        margin: '0px',
        backgroundColor: '#ffffff',
      },
      filter: (node) => {
        // Exclude elements with no-print class inside the printable container
        if (node instanceof HTMLElement && node.classList?.contains('no-print')) {
          return false;
        }
        return true;
      },
    });

    const img = await loadImage(dataUrl);

    // Page dimensions in mm
    // A4 Portrait: 210 x 297 mm, Landscape: 297 x 210 mm
    const isLandscape = orientation === 'landscape';
    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;

    const contentWidthMm = pageWidth - marginMm * 2;
    const contentHeightMm = pageHeight - marginMm * 2;

    // Calculate scaling: how many pixels in the source image correspond to 1 mm on the PDF
    const pxPerMm = img.width / contentWidthMm;
    const pageSliceHeightPx = contentHeightMm * pxPerMm;

    const totalPages = Math.max(1, Math.ceil(img.height / pageSliceHeightPx));

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format,
      compress: true,
    });

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (pageIdx > 0) {
        pdf.addPage(format, orientation);
      }

      const sliceStartY = pageIdx * pageSliceHeightPx;
      const currentSliceHeightPx = Math.min(pageSliceHeightPx, img.height - sliceStartY);

      if (currentSliceHeightPx <= 0) continue;

      // Create an offscreen canvas to cleanly crop and slice this page only
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = img.width;
      sliceCanvas.height = Math.round(currentSliceHeightPx);
      const ctx = sliceCanvas.getContext('2d');

      if (ctx) {
        // Fill canvas with pure white to prevent any transparency or dark border artifacts
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        // Draw ONLY the exact slice belonging to this page
        ctx.drawImage(
          img,
          0,
          sliceStartY,
          img.width,
          currentSliceHeightPx,
          0,
          0,
          img.width,
          currentSliceHeightPx
        );

        const sliceDataUrl = sliceCanvas.toDataURL('image/png');
        const sliceHeightMm = currentSliceHeightPx / pxPerMm;

        // Render page slice at standard margins
        pdf.addImage(
          sliceDataUrl,
          'PNG',
          marginMm,
          marginMm,
          contentWidthMm,
          sliceHeightMm,
          undefined,
          'FAST'
        );
      }
    }

    const finalFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(finalFilename);

    if (onSuccess) onSuccess();
    return true;
  } catch (err) {
    console.error('Error generating PDF download:', err);
    if (onError) onError(err);
    return false;
  }
}

/**
 * Standard browser printing with clean styling and isolated iframe
 */
export function printHtmlElement(elementId: string, options: PrintOptions = {}): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for printing.`);
    if (options.onError) options.onError(new Error(`Element #${elementId} not found`));
    return false;
  }

  const {
    title = 'Laporan Administrasi Pramuka',
    orientation = 'portrait',
    customStyles = '',
    onSuccess,
    onError,
  } = options;

  try {
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${styleTags}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #ffffff !important;
      color: #1c1917 !important;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      font-size: 11px;
      line-height: 1.4;
    }

    @page {
      size: ${orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
      margin: 10mm 12mm 12mm 12mm;
    }

    .no-print {
      display: none !important;
    }

    .print-doc-container {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      background: transparent !important;
    }

    table {
      width: 100% !important;
      border-collapse: collapse !important;
      page-break-inside: auto;
    }

    tr {
      page-break-inside: avoid !important;
      page-break-after: auto;
    }

    thead {
      display: table-header-group !important;
    }

    tfoot {
      display: table-footer-group !important;
    }

    th, td {
      border: 1px solid #78716c !important;
    }

    ${customStyles}
  </style>
</head>
<body>
  <div class="print-doc-container">
    ${element.innerHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
    `;

    let iframe = document.getElementById('app-print-iframe') as HTMLIFrameElement | null;
    if (iframe) {
      document.body.removeChild(iframe);
    }

    iframe = document.createElement('iframe');
    iframe.id = 'app-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          if (iframe?.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            if (onSuccess) onSuccess();
          }
        } catch (iframeErr) {
          console.warn('Iframe print failed, falling back to direct window.print()', iframeErr);
          fallbackPrint(orientation);
          if (onSuccess) onSuccess();
        }
      }, 500);

      return true;
    } else {
      fallbackPrint(orientation);
      if (onSuccess) onSuccess();
      return true;
    }
  } catch (err) {
    console.error('Print execution error, trying fallback:', err);
    fallbackPrint(orientation);
    if (onError) onError(err);
    return false;
  }
}

function fallbackPrint(orientation: 'portrait' | 'landscape') {
  const styleEl = document.createElement('style');
  styleEl.id = 'temp-print-orientation-style';
  styleEl.innerHTML = `@page { size: ${orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'}; margin: 10mm; }`;
  document.head.appendChild(styleEl);

  window.print();

  setTimeout(() => {
    const el = document.getElementById('temp-print-orientation-style');
    if (el) el.remove();
  }, 1000);
}
