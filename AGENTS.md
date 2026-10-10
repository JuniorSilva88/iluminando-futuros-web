<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public campaign and sponsor content lives in RLS-protected application tables; administrator writes use the authenticated browser client so database policies enforce permissions.
- Content images use the existing private gallery bucket and signed URLs with unique upload paths; bundled official assets are resolved by stable identifiers to preserve existing media.
- Public content subscribes to Realtime and invalidates query caches after mutations to reflect edits without page reloads.
- Donation QR codes are generated locally with a QR library so payment codes render without external image-service availability.
