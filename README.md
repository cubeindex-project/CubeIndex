# CubeIndex

**CubeIndex** is a web app for speedcubers to track, explore, and manage their cube collections. Whether you're into speedcubes or collectibles, CubeIndex helps you organize and showcase your cubes with ease.

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

- **Main Branch (Production):** [https://cube-index.vercel.app](https://cube-index.vercel.app)  
- **Developer Branch (Beta Preview):** [https://cube-index-beta.vercel.app](https://cube-index-beta.vercel.app)

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

* Join us on **[Discord](https://discord.gg/WpqqfCGCUs)**
* Create issues for bugs or feature ideas
* Check the docs/comments for guidance

## 📦 Miscellaneous

- **⭐ Star History:**  
  [![Star History Chart](https://api.star-history.com/svg?repos=Saterz/CubeIndex&type=Date)](https://www.star-history.com/#Saterz/CubeIndex&Date)

## 📄 License

This project is licensed under the **Apache 2.0 License**. See the `LICENSE` file for details.

---

Thanks for helping build CubeIndex! 🧊
