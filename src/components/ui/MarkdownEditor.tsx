'use client';

import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading2,
  Minus,
  Code2,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// ─── Mode ─────────────────────────────────────────────────────────────────────
// Visual: toolbar + textarea + live preview below (for non-Markdown users)
// Markdown: toolbar + split pane (textarea left, preview right)

type Mode = 'visual' | 'markdown';

// ─── Toolbar actions ──────────────────────────────────────────────────────────

function wrapSelection(
  textarea: HTMLTextAreaElement,
  value: string,
  before: string,
  after: string,
  placeholder: string
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || placeholder;
  const text = value.slice(0, start) + before + selected + after + value.slice(end);
  return { text, selectionStart: start + before.length, selectionEnd: start + before.length + selected.length };
}

function insertLinePrefix(
  textarea: HTMLTextAreaElement,
  value: string,
  prefix: string
) {
  const start = textarea.selectionStart;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const text = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  const offset = prefix.length;
  return { text, selectionStart: start + offset, selectionEnd: textarea.selectionEnd + offset };
}

type ToolbarResult = { text: string; selectionStart: number; selectionEnd: number };

const TOOLBAR: { icon: React.ReactNode; label: string; action: (ta: HTMLTextAreaElement, v: string) => ToolbarResult }[] = [
  {
    icon: <Bold className="w-3.5 h-3.5" />,
    label: 'Bold',
    action: (ta, v) => wrapSelection(ta, v, '**', '**', 'bold text'),
  },
  {
    icon: <Italic className="w-3.5 h-3.5" />,
    label: 'Italic',
    action: (ta, v) => wrapSelection(ta, v, '_', '_', 'italic text'),
  },
  {
    icon: <Heading2 className="w-3.5 h-3.5" />,
    label: 'Heading',
    action: (ta, v) => insertLinePrefix(ta, v, '## '),
  },
  {
    icon: <List className="w-3.5 h-3.5" />,
    label: 'Bullet list',
    action: (ta, v) => insertLinePrefix(ta, v, '- '),
  },
  {
    icon: <ListOrdered className="w-3.5 h-3.5" />,
    label: 'Numbered list',
    action: (ta, v) => insertLinePrefix(ta, v, '1. '),
  },
  {
    icon: <Code className="w-3.5 h-3.5" />,
    label: 'Inline code',
    action: (ta, v) => wrapSelection(ta, v, '`', '`', 'code'),
  },
  {
    icon: <Code2 className="w-3.5 h-3.5" />,
    label: 'Code block',
    action: (ta, v) => wrapSelection(ta, v, '```\n', '\n```', 'code'),
  },
  {
    icon: <Minus className="w-3.5 h-3.5" />,
    label: 'Divider',
    action: (_ta, v) => {
      const text = v + (v.endsWith('\n') ? '' : '\n') + '\n---\n\n';
      return { text, selectionStart: text.length, selectionEnd: text.length };
    },
  },
];

// ─── Main component ────────────────────────────────────────────────────────────

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content here…',
  minHeight = 'min-h-[160px]',
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<Mode>('visual');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyAction = (action: (typeof TOOLBAR)[0]) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const result = action.action(ta, value);
    onChange(result.text);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const baseTextarea = cn(
    'w-full px-3 py-2.5 resize-none text-base bg-transparent',
    'text-surface-800 dark:text-surface-100 placeholder:text-surface-400',
    'focus:outline-none font-mono text-sm leading-relaxed',
    minHeight
  );

  return (
    <div className="rounded-lg border border-surface-200 dark:border-surface-600 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors duration-150">

      {/* ── Toolbar bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-900/60">

        {/* Mode toggle */}
        <div className="flex rounded-md overflow-hidden border border-surface-200 dark:border-surface-700 shrink-0 mr-1.5">
          {(['visual', 'markdown'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium capitalize transition-colors duration-100',
                m === 'markdown' && 'border-l border-surface-200 dark:border-surface-700',
                mode === m
                  ? 'bg-primary-500 text-white'
                  : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-surface-200 dark:bg-surface-700 mx-0.5" />

        {/* Format buttons */}
        {TOOLBAR.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            aria-label={item.label}
            onMouseDown={(e) => {
              e.preventDefault(); // keep textarea focused
              applyAction(item);
            }}
            className="p-1.5 rounded text-surface-400 dark:text-surface-500 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-100"
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* ── Editor body ─────────────────────────────────────────────────── */}

      {mode === 'visual' ? (
        // Visual: textarea on top, live preview below
        <div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(baseTextarea, 'border-b border-surface-100 dark:border-surface-700')}
            spellCheck
          />
          {value ? (
            <div className="px-3 py-2.5 border-t border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/30">
              <p className="text-[10px] font-medium text-surface-300 dark:text-surface-600 uppercase tracking-wider mb-2">Preview</p>
              <MarkdownContent content={value} />
            </div>
          ) : null}
        </div>
      ) : (
        // Markdown: side-by-side split
        <div className="flex divide-x divide-surface-200 dark:divide-surface-600">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(baseTextarea, 'w-1/2')}
            spellCheck
          />
          <div className={cn('w-1/2 px-3 py-2.5 overflow-auto', minHeight)}>
            {value ? (
              <MarkdownContent content={value} />
            ) : (
              <p className="text-sm text-surface-400 italic">Preview will appear here…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Standalone renderer — used in CardDetail ──────────────────────────────────

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-surface-800 dark:text-surface-100 mt-4 mb-2 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-100 mt-3 mb-1.5 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-surface-700 dark:text-surface-200 mt-3 mb-1 first:mt-0">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-base leading-relaxed text-surface-600 dark:text-surface-300 mb-3 last:mb-0">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-surface-600 dark:text-surface-300">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-surface-600 dark:text-surface-300">{children}</ol>
        ),
        li: ({ children }) => <li className="text-base leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-surface-800 dark:text-surface-100">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children, className }) => {
          const isBlock = !!className?.includes('language-');
          return isBlock ? (
            <code className="block bg-surface-100 dark:bg-surface-950 text-surface-700 dark:text-surface-300 font-mono text-sm px-3 py-2 rounded-lg overflow-x-auto whitespace-pre">
              {children}
            </code>
          ) : (
            <code className="bg-surface-100 dark:bg-surface-950 text-primary-600 dark:text-primary-300 font-mono text-sm px-1.5 py-0.5 rounded">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-surface-100 dark:bg-surface-950 rounded-lg my-2 overflow-x-auto">{children}</pre>
        ),
        hr: () => <hr className="my-4 border-surface-200 dark:border-surface-700" />,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary-200 dark:border-primary-700 pl-4 my-3 text-surface-500 dark:text-surface-400 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary-500 hover:text-primary-600 underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-surface-200 dark:border-surface-600 px-3 py-1.5 bg-surface-50 dark:bg-surface-800 font-semibold text-left text-surface-700 dark:text-surface-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-surface-200 dark:border-surface-600 px-3 py-1.5 text-surface-600 dark:text-surface-300">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
