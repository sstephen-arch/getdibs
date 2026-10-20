/** `dangerouslySetInnerHTML` is safe here for exactly one reason: the only string
 *  it is ever given comes from `renderMarkdown()` over markdown committed in this
 *  repository. No request, query value, database row or reader input reaches it.
 *  If that stops being true, this stops being safe.
 *
 *  Typography lives in `.prose-body` in globals.css: tables, code and headings
 *  need more rules than a class list can carry legibly. */
export function Prose({ html }: { html: string }) {
  return <div className="prose-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
