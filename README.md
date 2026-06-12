# CubeIndex

<p align="center">
  <img src=".github\images\CubeIndex-Pixel-Art.png" alt="CubeIndex Logo" width="160" />
</p>

<p align="center">
  <strong>Track your cubes, unlock achievements, and explore the world's largest cube database.</strong><br/>
</p>

<p align="center">
   <a href="https://thecubeindex.com/discord"><img src="https://img.shields.io/discord/1360562604535447732?logo=discord&label=Discord" /></a>
  <a href="https://github.com/cubeindex-project/CubeIndex/stargazers"><img src="https://img.shields.io/github/stars/cubeindex-project/CubeIndex" /></a>
  <a href="https://github.com/cubeindex-project/CubeIndex/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-green" /></a>
</p>

<details>
<summary>See Screenshots</summary>
<br/>
<div align="center" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;">
  <img src=".github/images/cubeindex_home.png" alt="Home" style="max-width:48%;height:auto;border-radius:8px;" />
  <img src=".github/images/cubeindex_collection.png" alt="Collection" style="max-width:48%;height:auto;border-radius:8px;" />
  <img src=".github/images/cubeindex_price_tracking.png" alt="Price Tracking" style="max-width:48%;height:auto;border-radius:8px;" />
</div>
</details>

---

### Tech & Deploy

**Built with:** SvelteKit · Tailwind · Supabase · TypeScript  
**Live:** [thecubeindex.com](https://thecubeindex.com)

[![Netlify Status](https://api.netlify.com/api/v1/badges/d3a625d9-afd1-48a1-a431-f8855eaedbb8/deploy-status)](https://app.netlify.com/projects/cubeindex/deploys)

---

### Contribute

```bash
git clone https://github.com/cubeindex-project/CubeIndex.git
cd CubeIndex
npm install
cp .env.example .env
npx supabase db start
npm run dev
```

Then visit localhost:5173

#### Environment

- `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Frontend Supabase access
- `LOG_LEVEL`: Server-side Pino log level (`debug`, `info`, `warn`, etc.)
- `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`: For Cloudflare's turnstile service
- `AUTOFILL_SERVICE_URL`: The autofill service URL for the cube submission page

---

### Community

[Discord](https://thecubeindex.com/discord)

---

### Extras

[![Star History Chart](https://api.star-history.com/svg?repos=Saterz/CubeIndex&type=Date)](https://www.star-history.com/#Saterz/CubeIndex&Date)

---

### License

This project is under the Apache 2.0 license
