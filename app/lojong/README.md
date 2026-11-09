# Lojong companion

Public, unlinked learning area at `/lojong`. Its page metadata requests `noindex,nofollow`; no public navigation or sitemap includes it. This is discoverability guidance, not access control. Anyone with the URL can visit.

## Scope

The existing public pages, admin editors, global CSS, Supabase data, authentication, and migrations remain unchanged. This route reuses `ThusnessPageShell`, `SiteFooter`, and the existing design tokens. At Colin's request, a route-local wrapper overrides colors to black, white, and dark red. No global color or public navigation changes are needed.

The current version provides a five-step situational practice flow, Seven Points and Eight Verses overviews, Jinpa's 61-item slogan list, foundational distinctions, a six-question diagnostic, adaptive six-question sessions, single/multiple-choice, ordering, matching, missing-point, odd-one-out, and scenario exercises. Feedback, practice suggestions, and review text are deterministic. No AI provider or new dependency is required.

## Situational practice

The Practice tab is the default entry point. `lib/lojong/practice.ts` supplies observations, possible expectations, source-based root-instruction notes, practice outlines, and review formatting. The user describes an event, selects states they actually recognize, chooses relevant instructions and a practice, and reports the effect. Suggestions are not diagnoses or findings of broken commitments. A single selector offers compassion, equalizing self and others, loving-kindness, generosity, tonglen, patience, understanding through investigation, releasing expectations of reward, and emptiness inquiry. Only the chosen outline is shown. Tonglen also offers a self-paced written meditation with five prompts, previous/next controls, and an exit back to the outline. It begins with giving, makes taking optional, and introduces breath coordination only after familiarity. The meditation reuses Notice’s shared chime player and prompt styling, with 60/90/90/120/60-second countdowns, auto-advance, pause/resume, sound controls, and manual navigation. Timing pauses while the Practice tab is hidden; leaving the practice step ends the session. The final countdown ends with a bell and a completion prompt. The prompts adapt Lesson 5 rather than quote it; timings are editorial choices. Meditation position stays in memory and resets when leaving the practice step. Adaptations are explicitly distinguished from quotations.

The situation and review remain in component memory only. They are not written to localStorage, sent to a server, or included in learning exports. Switching tabs preserves them while the component is mounted; reloading or leaving the page loses them. Copy the review to keep it. Resetting requires an inline confirmation. An unchanged, stronger, or uncertain result never becomes a claim of successful transformation.

## Content

- `lib/lojong/curriculum.ts`: concepts, Seven Points, verse paraphrases, slogans, and attribution.
- `lib/lojong/questions.ts`: stable question IDs, answers, distractor explanations, concept/skill tags.
- Quoted slogans follow the participant-provided Jinpa course handouts; verse summaries and explanatory material are teaching paraphrases, not canonical quotations. The UI records edition differences and the correction to slogan 61.
- This is not a transcript distribution or replacement for the Wisdom Academy course. Course PDFs and recordings are not included.

## Progress and adaptation

`lib/lojong/engine.ts` keeps recognition, recall, and application separate. The MVP does not test unaided recall. Correct responses await “Knew it” or “Guessed”; guessed responses never become demonstrated knowledge. Incorrect and unsure answers prompt review. Confident responses have review intervals of 1, 3, 7, 14, then 30 days. Weak concepts are revisited through different questions, avoiding the last two concepts when possible. Application is favored after demonstrated recognition. None of these states measure spiritual attainment or actual real-world behavior.

`lib/lojong/storage.ts` saves a versioned snapshot under `thusness:lojong:progress:v1` in localStorage. A submitted response and a pending confidence decision survive reloads. Export/import transfers progress manually. Import validates its schema and does not replace existing progress without confirmation. Storage failure is visible and does not prevent a session in memory. Browser data removal clears the local copy. There is no server-side learner storage or built-in analytics.

## Validation

```sh
npm run lint
sh scripts/test-lojong.sh
npm run build
```

Open `/lojong` on mobile and desktop. Check the initial state, all confidence paths, study/quiz round trip, completed diagnostic, resumed session, ordering/matching controls, import/export, storage errors, sources, and noindex metadata. Revisit `/`, `/sinkin`, and `/orient` for regressions.

Use a feature branch and Vercel preview. Production publication requires Colin's approval. Existing Vercel project: `thusness`; use its existing environment configuration. This route needs no additional environment variables or database changes.
