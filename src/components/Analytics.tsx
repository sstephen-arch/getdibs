/** Cloudflare Web Analytics: no cookies, therefore no consent banner. The token is
 *  a build-time environment value; when it is absent the component renders nothing
 *  rather than a broken script tag. */
export function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON;
  if (!token) return null;

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
