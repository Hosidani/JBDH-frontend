import { useTranslation } from '../../hooks/TranslationProvider';

interface Props {
  items: any[];
}

function resolveItem(item: any, language: string): string {
  if (typeof item === 'string') return item;
  // Bilingual object: { sv: string, en: string }
  if (item && typeof item === 'object' && ('sv' in item || 'en' in item)) {
    return language === 'en' ? (item.en || item.sv || '') : (item.sv || item.en || '');
  }
  return item?.name ?? JSON.stringify(item);
}

export function BulletList({ items }: Props) {
  const { language } = useTranslation();
  return (
    <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
      {items.map((item, i) => (
        <li key={i}>{resolveItem(item, language)}</li>
      ))}
    </ul>
  );
}
