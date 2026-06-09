import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).href;

// OBS: telefonnummer måste maskeras FÖRE postnummer — annars kan siffror i
// telefonnummer råka matcha postnummer-mönstret.
const PII_RULES: { pattern: RegExp; mask: string }[] = [
  // Personnummer – lång form (19/20XXXXXXXX[-+]XXXX)
  { pattern: /\b(19|20)\d{6}[-+]?\d{4}\b/g,                                                                         mask: '[PERSONNR]' },
  // Personnummer – kort form (YYMMDD[-+]XXXX), separator obligatorisk
  { pattern: /\b\d{6}[-+]\d{4}\b/g,                                                                                  mask: '[PERSONNR]' },
  // E-postadresser
  { pattern: /[\w.+-]+@[\w-]+\.\w{2,}/gi,                                                                            mask: '[EPOST]'    },
  // Mobilnummer 07X – generellt: 07X + 7 siffror med godtycklig gruppering
  // Täcker 070-123 45 67 / 0709 875 204 / 0709 87 52 04 / 070 98 75 204 etc.
  { pattern: /\b07\d(?:[-\s]?\d){7}\b/g,                                                                             mask: '[TELEFON]'  },
  // Telefon +46 utan (0): +46 70-XXX XX XX, +46 709 XXX XXX etc.
  { pattern: /\+46[-\s]?\d{1,3}[-\s]?\d{3,4}[-\s]?\d{2,4}/g,                                                       mask: '[TELEFON]'  },
  // Telefon +46 (0)XXXXXXXXX — 9 siffror med godtyckliga mellanslag/bindestreck
  { pattern: /\+46\s?\(0\)\s?(?:\d[-\s]?){8}\d/g,                                                                   mask: '[TELEFON]'  },
  // Personnummer utan separator – 10 siffror (YYMMDDXXXX), t.ex. 6701192345
  // Placeras efter telefon-regler så att 07xxxxxxxx fångas som [TELEFON] först
  { pattern: /\b\d{10}\b/g,                                                                                           mask: '[PERSONNR]' },
  // Postnummer med mellanslag: 123 45
  { pattern: /\b\d{3} \d{2}\b/g,                                                                                     mask: '[POSTNR]'   },
  // Postnummer utan mellanslag: 42668 (5 siffror)
  { pattern: /\b\d{5}\b/g,                                                                                           mask: '[POSTNR]'   },
  // Adresser med riktningsord: "Östra hamngatan 45", "Västra Frölunda", "Norra stationsgatan"
  { pattern: /(Norra|Södra|Östra|Västra)\s+[A-ZÅÄÖa-zåäö]+(\s+\d+\s*[a-zA-ZåäöÅÄÖ]*)?\b/g,                      mask: '[ADRESS]'  },
  // Gatuadresser: kapitalord + gatutyp + valfritt nummer (Storgatan 5, Björkvägen 12B)
  // OBS: \w täcker inte å/ä/ö — använd explicit teckenklass
  { pattern: /[A-ZÅÄÖ][a-zA-ZåäöÅÄÖ]*(gatan|vägen|gränd|torget|allén|stigen|parken|backen|höjden)(\s+\d+\s*[a-zA-ZåäöÅÄÖ]*)?\b/g, mask: '[ADRESS]'  },
];

export function maskPii(text: string): string {
  return PII_RULES.reduce((t, { pattern, mask }) => t.replace(pattern, mask), text);
}

// Windows-1252 hex-koder för vanliga svenska/latinska tecken i RTF
const RTF_HEX_MAP: Record<string, string> = {
  'e5': 'å', 'e4': 'ä', 'f6': 'ö',
  'c5': 'Å', 'c4': 'Ä', 'd6': 'Ö',
  'e9': 'é', 'e8': 'è', 'fc': 'ü', 'e0': 'à',
};

export function parseRtfText(raw: string): string {
  return raw
    // Unicode-escapes: \u229? → char
    .replace(/\\u(\d+)\??/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    // Stycke-/radbrytningar → newlines
    .replace(/\\par\b\s*/g, '\n')
    .replace(/\\line\b\s*/g, '\n')
    .replace(/\\tab\b\s*/g, '\t')
    // Hex-escapes cp1252 (svenska tecken m.m.)
    .replace(/\\'([0-9a-f]{2})/gi, (_, hex) => RTF_HEX_MAP[hex.toLowerCase()] ?? '')
    // Ta bort kontrollord
    .replace(/\\[a-z*]+[-\d]*\s?/gi, '')
    // Hantera escaped tecken: \{ \} \\
    .replace(/\\([{}\\])/g, '$1')
    // Ta bort kvarvarande måsvingar
    .replace(/[{}]/g, '')
    // Normalisera blankrader
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.rtf', '.md'] as const;
export const ACCEPT_STRING = SUPPORTED_EXTENSIONS.join(',');

export async function parseCvFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let raw: string;
  switch (ext) {
    case 'pdf':
      raw = await parsePdf(file);
      break;
    case 'docx':
      raw = await parseDocx(file);
      break;
    case 'txt':
    case 'md':
      raw = await file.text();
      break;
    case 'rtf':
      raw = parseRtfText(await file.text());
      break;
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
  return maskPii(raw);
}
