/** `youtube-nocookie`, no autoplay, lazy, and a text link, because a reader who
 *  does not want an embed should never be forced through one. */
export function VideoEmbed({
  id,
  title,
  channel,
  url,
}: {
  id: string;
  title: string;
  channel: string;
  url: string;
}) {
  return (
    <figure className="my-8">
      <div className="aspect-video w-full border border-border">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          loading="lazy"
          className="h-full w-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <figcaption className="record mt-2 flex items-baseline justify-between gap-4 text-[0.6875rem] text-muted-foreground">
        <span>{channel}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          Watch on YouTube
        </a>
      </figcaption>
    </figure>
  );
}
