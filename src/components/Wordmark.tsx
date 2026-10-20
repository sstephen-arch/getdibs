/** The wordmark is a command mid-keystroke: `get dibs.io` typed at a prompt, with
 *  the cursor still sitting after the domain. `get` carries the command colour
 *  the way the program name does in `git pull`, and the caret is a prompt cursor
 *  rather than decoration, which is why it blinks and then stops under
 *  `prefers-reduced-motion`.
 *
 *  The prompt glyph and the caret are hidden from assistive tech; the link reads
 *  as "get dibs.io" on its own. */
export function Wordmark() {
  return (
    <span className="record flex items-baseline text-2xl leading-none">
      <span aria-hidden className="select-none text-muted-foreground">
        $
      </span>
      <span className="ml-2 text-foreground">
        <span className="text-primary">get</span> dibs
        <span className="text-muted-foreground">.io</span>
      </span>
      <span aria-hidden className="caret" />
    </span>
  );
}
