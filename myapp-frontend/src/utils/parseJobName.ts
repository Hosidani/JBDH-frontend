export function parseJobName(name: string): { title: string; channel: string; url: string } {
  const parts = name.split('<>');
  return {
    title: parts[0] ?? '',
    channel: parts[1] ?? '',
    url: parts[2] ?? '',
  };
}

export function buildJobName(title: string, channel: string, url: string): string {
  if (!channel && !url) return title;
  if (!url) return `${title}<>${channel}`;
  return `${title}<>${channel}<>${url}`;
}
