interface Props {
  items: any[];
}

export function BulletList({ items }: Props) {
  return (
    <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
      {items.map((item, i) => (
        <li key={i}>{typeof item === 'string' ? item : item.name ?? JSON.stringify(item)}</li>
      ))}
    </ul>
  );
}
