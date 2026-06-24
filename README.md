# Virtual Kitchen

An immersive kitchen inventory app built with Next.js, React Three Fiber, and Prisma.

Click into your 3D kitchen to navigate zones (fridge, pantry, spice cabinet), then manage inventory items within each zone. A recipe suggestion feature shows what you can cook based on what's in stock.

Live demo: https://virtual-kitchen-1xhi.vercel.app/

---

## Prerequisites

- Node.js 18+
- A running PostgreSQL database (local or hosted)

---

## Local Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd virtual-kitchen
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `DATABASE_URL` to your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/virtual_kitchen"
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed sample data (optional)**
   ```bash
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

---

## Database Commands

| Command | Description |
|---|---|
| `npx prisma migrate dev` | Apply migrations locally (creates the DB if needed) |
| `npx prisma migrate deploy` | Apply migrations in production (used by build script) |
| `npx prisma db seed` | Seed sample inventory items |
| `npx prisma studio` | Open a visual database browser |
| `npx prisma generate` | Regenerate the Prisma client after schema changes |

---

## Project Structure

```
src/
├── types/           # Shared TypeScript interfaces and Zod schemas
├── config/          # Static configuration (e.g. kitchen zone mappings)
├── app/
│   ├── api/         # Next.js route handlers
│   │   ├── inventory/       # GET, POST, PUT, DELETE inventory
│   │   └── recipes/         # Recipe suggestion API
│   ├── repositories/        # Prisma data access layer
│   ├── components/          # React UI components
│   │   ├── home/            # Main layout and state
│   │   ├── kitchen.tsx      # Three.js kitchen scene
│   │   ├── inventory-list.tsx
│   │   ├── add-inventory.tsx
│   │   ├── recipe-suggestions.tsx
│   │   └── error-boundary.tsx
│   └── lib/
│       └── prisma.ts        # Prisma client singleton
prisma/
├── schema.prisma    # Data models
├── migrations/      # Migration history
└── seed.ts          # Sample data
```

---

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add a Postgres database in the Vercel dashboard (Storage → Create → Postgres).
3. Vercel auto-populates `DATABASE_URL`.
4. The build script (`prisma migrate deploy && next build`) runs migrations automatically on each deploy.
