import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).href;

const PII_RULES: { pattern: RegExp; mask: string }[] = [
  // Personnummer – lång form (19/20XXXXXXXX[-+]XXXX)
  { pattern: /\b(19|20)\d{6}[-+]?\d{4}\b/g,                                                               mask: '[PERSONNR]' },
  // Personnummer – kort form (YYMMDD[-+]XXXX), separator obligatorisk
  { pattern: /\b\d{6}[-+]\d{4}\b/g,                                                                        mask: '[PERSONNR]' },
  // E-postadresser
  { pattern: /[\w.+-]+@[\w-]+\.\w{2,}/gi,                                                                  mask: '[EPOST]'    },
  // Mobilnummer 07x – 3-siffrigt prefix: 070-XXX XX XX
  { pattern: /\b07\d[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b/g,                                               mask: '[TELEFON]'  },
  // Mobilnummer 07xx – 4-siffrigt prefix: 0709 XXX XXX
  { pattern: /\b07\d{2}[-\s]?\d{3}[-\s]?\d{3}\b/g,                                                       mask: '[TELEFON]'  },
  // Telefon med +46-prefix
  { pattern: /\+46[-\s]?\d{1,3}[-\s]?\d{3,4}[-\s]?\d{2,4}/g,                                             mask: '[TELEFON]'  },
  // Postnummer (123 45 — mellanslag krävs för att minska falsk positiva)
  { pattern: /\b\d{3} \d{2}\b/g,                                                                           mask: '[POSTNR]'   },
  // Gatuadresser: kapitalord + gatutyp + valfritt nummer (Storgatan 5, Björkvägen 12B)
  // OBS: \w täcker inte å/ä/ö — använd explicit teckenklass
  { pattern: /[A-ZÅÄÖ][a-zA-ZåäöÅÄÖ]*(gatan|vägen|gränd|torget|allén|stigen|parken|backen|höjden)(\s+\d+\s*[a-zA-ZåäöÅÄÖ]*)?\b/g, mask: '[ADRESS]'  },
];

export function maskPii(text: string): string {
  return PII_RULES.reduce((t, { pattern, mask }) => t.replace(pattern, mask), text);
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ');
    pages.push(pageText);
  }
  return pages.join('\n');
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function parseCvFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let raw: string;
  if (ext === 'pdf') {
    raw = await parsePdf(file);
  } else if (ext === 'docx') {
    raw = await parseDocx(file);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
  return maskPii(raw);
}
