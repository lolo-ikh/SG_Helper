import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { parseDocumentStructure, sectionsToBlocks } from './documentParser';
import { semanticChunk } from './semanticChunker';

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

const COMMON_SHORT = new Set(['i','a','an','in','on','at','to','of','is','it','be','by','or','as','do','no','so','if','up','us','we','he','me','my','am','go','pm','vs','ex','ok']);

function cleanOcrArtifacts(text) {
  let c = text;
  for (const lig of ['ffi','ffl','fi','fl','ff']) {
    c = c.replace(new RegExp(`(\\w+) ${lig} (\\w+)`, 'gi'), `$1${lig}$2`);
  }
  c = c.replace(/(\w{3,}) ([a-zA-Z]{1,2}) (\w+)/g, (_, prev, mid, next) => {
    if (COMMON_SHORT.has(mid.toLowerCase())) return `${prev} ${mid} ${next}`;
    return `${prev}${mid} ${next}`;
  });
  c = c.replace(/\u00A0/g, ' ');
  c = c.replace(/\s{3,}/g, '  ');
  return c;
}

function reconstructPageText(items) {
  if (!items || items.length === 0) return '';
  const lines = [];
  let currentLine = [];
  let lastY = null;

  for (const item of items) {
    const y = Math.round(item.transform[5]);
    const gap = lastY !== null ? Math.abs(lastY - y) : 0;

    if (lastY !== null && gap > 5) {
      lines.push(currentLine.join(' '));
      currentLine = [];
    }
    if (item.str) currentLine.push(item.str);
    lastY = y;

    if (item.hasEOL) {
      lines.push(currentLine.join(' '));
      currentLine = [];
      lastY = null;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine.join(' '));
  return lines.join('\n');
}

export async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = reconstructPageText(content.items).trim();
    if (text) fullText += '\n' + cleanOcrArtifacts(text);
  }

  return { pageCount: pdf.numPages, fullText: fullText.trim() };
}

export function chunkDocument(fullText) {
  const parsed = parseDocumentStructure(fullText);
  const blocks = sectionsToBlocks(parsed);
  return { title: parsed.title, chunks: semanticChunk(blocks) };
}
