# CubeIndex

**CubeIndex** is a web app for speedcubers to track, explore, and manage their cube collections. Whether you're into speedcubes or collectibles, CubeIndex helps you organize and showcase your cubes with ease.

CubeIndex is set to release in August 2025. We are currently in the beta stage of development, which you can try out here: [cubeindexbeta.netlify.app](https://cubeindexbeta.netlify.app/)

[![Crowdin](https://badges.crowdin.net/cubeindex/localized.svg)](https://crowdin.com/project/cubeindex)

## 🧠 Tech Stack

- **Frontend:** SvelteKit, Tailwind CSS
- **Backend:** Supabase (PostgreSQL), Drizzle ORM
- **Auth:** Custom session-based authentication
- **i18n:** Inlang for multi-language support
- **Tooling:** TypeScript, ESLint, Vitest, Vite

## 🗂 Project Structure

- `src/routes/` – Pages and endpoints
- `src/lib/components/` – UI components
- `src/lib/server/db/` – Drizzle schema and DB access
- `src/lib/server/auth.ts` – Custom auth logic
- `messages/` – Translations (i18n)

## 🚀 Deployment

- **Main Branch (Production):** [cubeindex.netlify.app](https://cubeindex.netlify.app)
[![Netlify Status](https://api.netlify.com/api/v1/badges/d3a625d9-afd1-48a1-a431-f8855eaedbb8/deploy-status)](https://app.netlify.com/projects/cubeindex/deploys)
- **Developer Branch (Beta Preview):** [cubeindexbeta.netlify.app](https://cubeindexbeta.netlify.app)
[![Netlify Status](https://api.netlify.com/api/v1/badges/7b27c12d-e420-4e63-85be-e459ff3a4ae5/deploy-status)](https://app.netlify.com/projects/cubeindexbeta/deploys)

## 🛠 Setup Instructions

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Saterz/CubeIndex.git
   cd CubeIndex
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your `DATABASE_URL` (e.g. from Supabase).

4. **Set Up Database**

   ```bash
   npm run db:push
   ```

5. **Start the Dev Server**

   ```bash
   npm run dev
   ```

Visit [http://localhost:5173](http://localhost:5173)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

* **Fork & branch off `developer`**
* Use clear names like `feature/add-cube-model`
* Follow code style (TypeScript, ESLint)
* Commit clearly (e.g. `fix: login bug`)
* Open a PR with description and context
* Reference issues when applicable (e.g. `Closes #12`)
* Chat with us on Discord for guidance

### 🧩 Contribution Example

```bash
git checkout -b feature/my-feature
# Make your changes
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

Then open a Pull Request to `developer` on GitHub.

## 👥 Community & Support

* Join us on **[Discord](https://discord.gg/76ExrEAE7s)**
* Create issues for bugs or feature ideas
* Check the docs/comments for guidance

## 📦 Miscellaneous

- **⭐ Star History:**  
  [![Star History Chart](https://api.star-history.com/svg?repos=Saterz/CubeIndex&type=Date)](https://www.star-history.com/#Saterz/CubeIndex&Date)

## 📄 License

This project is licensed under the **Apache 2.0 License**. See the `LICENSE` file for details.

---

Thanks for helping build CubeIndex! 🧊
