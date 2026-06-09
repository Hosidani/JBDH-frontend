import { describe, it, expect, vi, beforeEach } from 'vitest';
import { maskPii, parseCvFile } from './parseCvFile';

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

  it('maskerar mobilnummer 07x (3-siffrigt prefix)', () => {
    const result = maskPii('Ring 070-123 45 67');
    expect(result).toContain('[TELEFON]');
    expect(result).not.toContain('070-123');
  });

  it('maskerar mobilnummer 07xx (4-siffrigt prefix)', () => {
    const result = maskPii('Ring 0709 875 204');
    expect(result).toContain('[TELEFON]');
    expect(result).not.toContain('0709 875 204');
  });

  it('maskerar telefonnummer med +46', () => {
    const result = maskPii('Tel: +46 70 123 45 67');
    expect(result).toContain('[TELEFON]');
  });

  it('maskerar postnummer med mellanslag', () => {
    const result = maskPii('Jag bor i Göteborg 411 34');
    expect(result).toContain('[POSTNR]');
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

  it('maskerar inte vanliga tal som inte är postnummer', () => {
    expect(maskPii('30 års erfarenhet')).toBe('30 års erfarenhet');
    expect(maskPii('ökat med 25000 kr')).toBe('ökat med 25000 kr');
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

  it('kastar fel för okänt filformat', async () => {
    const file = new File(['dummy'], 'cv.txt', { type: 'text/plain' });
    await expect(parseCvFile(file)).rejects.toThrow('Unsupported file type: txt');
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
    } as ReturnType<typeof getDocument>);

    const file = new File(['dummy'], 'cv.pdf', { type: 'application/pdf' });
    const result = await parseCvFile(file);
    expect(result).toContain('[EPOST]');
    expect(result).toContain('[TELEFON]');
    expect(result).not.toContain('anna@test.com');
    expect(result).not.toContain('070-111 22 33');
  });
});
