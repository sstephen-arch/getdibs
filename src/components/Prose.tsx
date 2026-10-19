/** `dangerouslySetInnerHTML` is safe here for exactly one reason: the only string
 *  it is ever given comes from `renderMarkdown()` over markdown committed in this
 *  repository. No request, query value, database row or reader input reaches it.
 *  If that stops being true, this stops being safe. */
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-body font-display text-[1.0625rem] leading-[1.7] [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-highlight [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_hr]:my-10 [&_hr]:border-border [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-control [&_pre]:bg-muted [&_pre]:p-4 [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
