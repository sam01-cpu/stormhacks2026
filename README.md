# MusicCraft

Learn music theory by making music: play a piano, discover chords, build a four-bar progression, and hear it loop.

## Local development

Use Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Checks and production preview

```bash
npm run lint
node --test tests/*.test.mjs
npm run build
npm run start
```

## Deploy to Vercel

1. Commit and push this project, including `package-lock.json` and `vercel.json`, to your Git repository.
2. In [Vercel's new-project page](https://vercel.com/new), import the repository.
3. Set **Root Directory** to the folder containing this `package.json`. Leave it at the repository root if this app is at the top level.
4. Use the **Next.js** framework preset. The committed configuration sets **Install Command** to `npm ci` and **Build Command** to `npm run build`. Leave **Output Directory** at its Next.js default.
5. Click **Deploy**.

`package.json` selects Node.js **24.x** for deployment. No environment variables, API keys, database, or separate audio server are required. The piano synthesizes audio in the browser after the user clicks or presses a key.

Check `/`, `/chords`, and `/loop` on the deployed URL. Play some notes, edit a chord, then start and stop the loop. Subsequent pushes to the connected production branch will trigger new deployments.

For an optional command-line deployment, run `npx vercel` from this directory, follow the project-linking prompts, and use `npx vercel --prod` to publish to production.

See [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), and [Node.js version selection](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
