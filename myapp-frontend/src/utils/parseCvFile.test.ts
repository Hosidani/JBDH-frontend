import { describe, it, expect, vi, beforeEach } from 'vitest';
import { maskPii, parseRtfText, parseCvFile } from './parseCvFile';

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage: vi.fn((n: number) =>
        Promise.resolve({
          getTextContent: vi.fn(() =>
            Promise.resolve({ items: [{ str: `Sida ${n} text` }] })
          ),
        })
      ),
    }),
  })),
}));

vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(() => Promise.resolve({ value: 'Mammoth-text från docx' })),
  },
}));

describe('maskPii', () => {
  it('maskerar e-postadress', () => {
    expect(maskPii('Kontakta mig på anna@example.com tack')).toContain('[EPOST]');
  });

  it('maskerar personnummer med bindestreck (kort form)', () => {
    expect(maskPii('Personnummer: 850312-1234')).toContain('[PERSONNR]');
  });

  it('maskerar personnummer lång form (19xx)', () => {
    expect(maskPii('Född: 19850312-1234')).toContain('[PERSONNR]');
  });

  it('maskerar personnummer lång form (20xx)', () => {
    expect(maskPii('20031205-5678 är ett personnr')).toContain('[PERSONNR]');
  });

  it('maskerar mobilnummer – olika grupperingsformat', () => {
    const variants = [
      '070-123 45 67',   // 3+3+2+2
      '0709 875 204',    // 4+3+3
      '0709 87 52 04',   // 4+2+2+2
      '070 98 75 204',   // 3+2+2+3
      '0701234567',      // inga separatorer
    ];
    for (const v of variants) {
      const result = maskPii(v);
      expect(result, `missade: ${v}`).toContain('[TELEFON]');
      expect(result, `lämnade kvar siffror: ${v}`).not.toMatch(/\b07\d/);
    }
  });

  it('maskerar telefonnummer med +46 (0) – varianter', () => {
    const variants = [
      '+46 (0)709 875204',
      '+46 (0)709875204',
      '+46 (0) 70 9875204',
      '+46 (0) 70 98 75 204',
      '+46 (0) 70-9875204',
      '+46 (0) 709875204',
      '+46 (0) 709-875204',
      '+46 (0) 709 87 52 04',
      '+46 (0) 709 875 204',
    ];
    for (const v of variants) {
      const result = maskPii(v);
      expect(result, `missade: ${v}`).toContain('[TELEFON]');
      expect(result, `lämnade kvar: ${v}`).not.toContain('+46');
    }
  });

  it('maskerar telefonnummer med +46 (utan parentes)', () => {
    const result = maskPii('Tel: +46 70 123 45 67');
    expect(result).toContain('[TELEFON]');
  });

  it('maskerar postnummer med mellanslag', () => {
    const result = maskPii('Jag bor i Göteborg 411 34');
    expect(result).toContain('[POSTNR]');
    expect(result).not.toContain('411 34');
  });

  it('maskerar postnummer utan mellanslag (kompakt)', () => {
    const result = maskPii('Postnummer: 42668');
    expect(result).toContain('[POSTNR]');
    expect(result).not.toContain('42668');
  });

  it('telefonnummer maskeras före postnummer', () => {
    // Siffrorna i telefonnumret ska inte råka maskas som postnummer
    const result = maskPii('Tel: 0709 875 204 Postnr: 411 34');
    expect(result).toContain('[TELEFON]');
    expect(result).toContain('[POSTNR]');
    expect(result).not.toContain('0709');
    expect(result).not.toContain('411 34');
  });

  it('maskerar gatuadress (sammansatt)', () => {
    const result = maskPii('Jag bor på Storgatan 5');
    expect(result).toContain('[ADRESS]');
    expect(result).not.toContain('Storgatan');
  });

  it('maskerar gatuadress med vägen-suffix', () => {
    const result = maskPii('Adress: Björkvägen 12B');
    expect(result).toContain('[ADRESS]');
  });

  it('maskerar adresser med riktningsord', () => {
    const cases = [
      'Östra hamngatan 45',
      'Västra Nordstan',
      'Västra Frölunda',
      'Norra stationsgatan 10',
      'Södra vägen 3B',
    ];
    for (const c of cases) {
      expect(maskPii(c), `missade: ${c}`).toContain('[ADRESS]');
    }
  });

  it('behåller vanlig text orörd', () => {
    const text = 'Erfarenhet av React och TypeScript';
    expect(maskPii(text)).toBe(text);
  });

  it('maskerar flera PII-förekomster i samma text', () => {
    const text = 'anna@test.com och 850312-1234 och 070-111 22 33 bor på Björkvägen 3';
    const result = maskPii(text);
    expect(result).toContain('[EPOST]');
    expect(result).toContain('[PERSONNR]');
    expect(result).toContain('[TELEFON]');
    expect(result).toContain('[ADRESS]');
    expect(result).not.toContain('anna@test.com');
    expect(result).not.toContain('850312-1234');
    expect(result).not.toContain('070-111 22 33');
    expect(result).not.toContain('Björkvägen');
  });

  it('maskerar personnummer utan separator (10 siffror)', () => {
    expect(maskPii('6701192345')).toContain('[PERSONNR]');
    expect(maskPii('0401192345')).toContain('[PERSONNR]');
    expect(maskPii('personnummer 6701192345 i text')).toContain('[PERSONNR]');
  });

  it('mobilnummer 10 siffror maskeras som TELEFON, inte PERSONNR', () => {
    const result = maskPii('0701234567');
    expect(result).toContain('[TELEFON]');
    expect(result).not.toContain('[PERSONNR]');
  });

  it('maskerar inte korta tal (under 5 siffror)', () => {
    expect(maskPii('30 års erfarenhet')).toBe('30 års erfarenhet');
    expect(maskPii('team på 12 personer')).toBe('team på 12 personer');
  });

  it('maskerar 5-siffriga tal som postnummer (även belopp som 25000)', () => {
    // Medvetet val: 5-siffriga tal maskeras alltid, inklusive belopp
    expect(maskPii('Postnummer 42668')).toContain('[POSTNR]');
    expect(maskPii('ökat med 25000 kr')).toContain('[POSTNR]');
  });
});

describe('parseRtfText', () => {
  it('extraherar ren text ur ett enkelt RTF-dokument', () => {
    const rtf = '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\pard Hello World\\par}';
    const result = parseRtfText(rtf);
    expect(result).toContain('Hello World');
  });

  it('konverterar \\par till radbrytning', () => {
    const rtf = '\\pard Rad ett\\par Rad två\\par';
    const result = parseRtfText(rtf);
    expect(result).toContain('\n');
    expect(result).toContain('Rad ett');
    expect(result).toContain('Rad två');
  });

  it('konverterar svenska hex-escapes', () => {
    // \'e5 = å, \'e4 = ä, \'f6 = ö
    const rtfWithEscapes = "Namn: Anna \\'e5\\'e4\\'f6";
    const result = parseRtfText(rtfWithEscapes);
    expect(result).toContain('å');
    expect(result).toContain('ä');
    expect(result).toContain('ö');
  });

  it('tar bort RTF-kontrollord', () => {
    const rtf = '\\pard\\f0\\fs24 Ren text';
    const result = parseRtfText(rtf);
    expect(result).toContain('Ren text');
    expect(result).not.toContain('\\f0');
    expect(result).not.toContain('\\fs24');
  });

  it('tar bort semikolon- och backslash-artefakter', () => {
    // Realistisk RTF med fonttbl (skapar ; och fontnamn som artefakter om ej strippad)
    const rtf = '{\\rtf1\\ansi{\\fonttbl{\\f0\\fswiss Arial;}}{\\colortbl ;\\red0\\green0\\blue0;}\\pard\\f0\\fs24 CV-text\\par}';
    const result = parseRtfText(rtf);
    expect(result).toContain('CV-text');
    expect(result).not.toContain(';');
    expect(result).not.toContain('\\');
    expect(result).not.toContain('Arial');
  });
});

describe('parseCvFile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('parsar PDF och returnerar text från alla sidor', async () => {
    const file = new File(['dummy'], 'cv.pdf', { type: 'application/pdf' });
    const result = await parseCvFile(file);
    expect(result).toContain('Sida 1 text');
    expect(result).toContain('Sida 2 text');
  });

  it('parsar DOCX och returnerar text', async () => {
    const file = new File(['dummy'], 'cv.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const result = await parseCvFile(file);
    expect(result).toContain('Mammoth-text från docx');
  });

  it('parsar TXT och returnerar texten', async () => {
    const file = new File(['Jag är en konsult med 10 års erfarenhet.'], 'cv.txt', { type: 'text/plain' });
    const result = await parseCvFile(file);
    expect(result).toContain('Jag är en konsult');
  });

  it('parsar MD och returnerar texten', async () => {
    const file = new File(['# Henrik Carlsson\n\n## Erfarenhet\n\nReact, TypeScript'], 'cv.md', { type: 'text/markdown' });
    const result = await parseCvFile(file);
    expect(result).toContain('Henrik Carlsson');
    expect(result).toContain('React, TypeScript');
  });

  it('parsar RTF och extraherar ren text', async () => {
    const rtfContent = '{\\rtf1\\ansi\\pard CV-text\\par Erfarenhet\\par}';
    const file = new File([rtfContent], 'cv.rtf', { type: 'application/rtf' });
    const result = await parseCvFile(file);
    expect(result).toContain('CV-text');
    expect(result).toContain('Erfarenhet');
  });

  it('kastar fel för okänt filformat', async () => {
    const file = new File(['dummy'], 'cv.odt', { type: 'application/odt' });
    await expect(parseCvFile(file)).rejects.toThrow('Unsupported file type: odt');
  });

  it('applicerar PII-maskning på parsad PDF-text', async () => {
    const { getDocument } = await import('pdfjs-dist');
    vi.mocked(getDocument).mockReturnValueOnce({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn(() =>
          Promise.resolve({
            getTextContent: vi.fn(() =>
              Promise.resolve({
                items: [{ str: 'Kontakta: anna@test.com tel 070-111 22 33' }],
              })
            ),
          })
        ),
      }),
    } as unknown as ReturnType<typeof getDocument>);

    const file = new File(['dummy'], 'cv.pdf', { type: 'application/pdf' });
    const result = await parseCvFile(file);
    expect(result).toContain('[EPOST]');
    expect(result).toContain('[TELEFON]');
    expect(result).not.toContain('anna@test.com');
    expect(result).not.toContain('070-111 22 33');
  });

  it('applicerar PII-maskning på TXT-text', async () => {
    const content = 'Kontakta anna@test.com eller ring 070-111 22 33';
    const file = new File([content], 'cv.txt', { type: 'text/plain' });
    const result = await parseCvFile(file);
    expect(result).toContain('[EPOST]');
    expect(result).toContain('[TELEFON]');
  });
});
