type Props = { html: string; className?: string };

export function TiptapHtml({ html, className = "" }: Props) {
  if (!html.trim()) return null;
  return (
    <div
      className={`tiptap-html ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
