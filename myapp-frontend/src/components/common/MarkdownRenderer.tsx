import React, { lazy, Suspense } from 'react';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = lazy(() => import('react-markdown'));

const components: Components = {
  h1: ({ children }) => <h1 className="text-2xl font-bold text-blue-600 mt-6 mb-3">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-semibold text-blue-700 mt-5 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-semibold text-blue-700 mt-4 mb-1">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold text-blue-600 mt-3 mb-1">{children}</h4>,
  p:  ({ children }) => <p className="text-slate-700 text-sm mb-3 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside text-slate-700 text-sm mb-3 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside text-slate-700 text-sm mb-3 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="text-slate-700 text-sm">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
  hr: () => <hr className="border-slate-200 my-4" />,
  table: ({ children }) => <table className="w-full text-sm border-collapse mb-4">{children}</table>,
  th: ({ children }) => <th className="text-left font-semibold text-slate-700 border border-slate-200 px-3 py-2 bg-slate-50">{children}</th>,
  td: ({ children }) => <td className="text-slate-700 border border-slate-200 px-3 py-2">{children}</td>,
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => (
  <Suspense fallback={null}>
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
    </div>
  </Suspense>
);

export default MarkdownRenderer;
