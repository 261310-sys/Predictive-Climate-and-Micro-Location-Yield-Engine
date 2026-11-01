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

## Architecture rules
- All metrics, forecasts and risk scores come from `src/lib/agri-model.ts` (deterministic seeded simulation over `src/lib/regions.ts` baselines); swap a function there to integrate real IMD/ISRO/Copernicus data — UI must never compute its own numbers. Why: one seam for real-data integration.
- Every simulated value shown in the UI must stay visibly labelled as simulated/demo. Why: data-transparency requirement.
- Selected state/district/village/crop is global via `SelectionProvider` (localStorage-persisted, read in useEffect). Why: no login/backend; avoids hydration mismatch.
- App console pages live under the pathless `_console` layout (sidebar + selector bar); the landing page `/` sits outside it.
- Leaflet is browser-only: load it only through `components/map/ClientMap` (lazy + ClientOnly). PDF generation lazy-imports jspdf on click.
- Advisory/chat replies are rule-based in `src/lib/advice.ts` (no paid AI). Why: no paid APIs required.
