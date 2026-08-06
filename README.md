<div align="center">

# Nutrition Tracker

**A personal recipe and nutrition tracker with AI-assisted recipe writing and cooking-streak stats.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI-8E75B2?logo=googlegemini&logoColor=white)

</div>

---

## About

Nutrition Tracker is a personal, single-user tool for managing recipes and tracking what you actually cook. You build recipes from a library of ingredients (227 preloaded, each with calories/protein/carbs/fat per 100g), and the app calculates the nutrition breakdown automatically from quantities. An AI assistant (Gemini) can write the recipe description and step-by-step instructions for you from just a name and an ingredient list. A cooking history log tracks what you've made and when, with streaks and weekly stats on a dashboard. There's no login system — it's built as a local, single-user tool rather than a multi-account product.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Available Scripts](#available-scripts)
- [AI Recipe Generation](#ai-recipe-generation)
- [CI/CD](#cicd)
- [Known Issues](#known-issues)
- [License](#license)

## Features

- **Ingredients library** — 227 preloaded ingredients with calories, protein, carbs, and fat per 100g; add custom ones as needed
- **Recipes** — build recipes from the ingredient library with per-ingredient quantities in grams
- **Automatic nutrition calculation** — total macros per recipe are derived from ingredient quantities, not entered by hand
- **AI recipe writing** — generate a description and step-by-step cooking instructions from a recipe name, servings, and ingredient list, powered by Gemini
- **Cooking history** — log when you cook a recipe; track cooking streaks, today's/this week's cooks, and your most-cooked recipe
- **Dashboard** — recent recipes and weekly nutrition charts at a glance
- **Dark mode**
- **No accounts** — single-user by design, no login required

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| Language | TypeScript |
| Database | PostgreSQL via [Prisma 6](https://www.prisma.io/) |
| Data fetching (client) | [TanStack Query](https://tanstack.com/query) |
| Forms & validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| AI | [Google Gemini](https://ai.google.dev/) (`gemini-2.5-flash`) via `@google/generative-ai` |

## Project Structure

```
nutrition-tracker/
├── prisma/
│   └── schema.prisma            # Data model
├── src/
│   ├── app/
│   │   ├── (pages)/
│   │   │   ├── page.tsx          # Dashboard — "/"
│   │   │   ├── ingredients/      # "/ingredients"
│   │   │   ├── recipes/          # "/recipes"
│   │   │   └── cooking-history/  # "/cooking-history"
│   │   ├── api/
│   │   │   ├── dashboard/        # Dashboard aggregate data
│   │   │   ├── ingredients/      # Ingredient CRUD
│   │   │   ├── recipes/          # Recipe CRUD
│   │   │   ├── cooking-history/  # Log + stats
│   │   │   └── ai/generate-recipe/  # Gemini recipe writer
│   │   ├── hooks/
│   │   └── services/
│   ├── components/
│   │   ├── dashboard/            # Charts, streak, recent recipes
│   │   ├── recipes/ ingredients/ cooking-history/
│   │   ├── forms/ cards/ layout/ providers/
│   │   └── ui/                   # shadcn/ui primitives
│   ├── lib/                      # http client, query client, utils
│   └── scripts/
│       ├── import-ingredients.ts # Loads data/ingredients.json into the DB
│       ├── validate-data.ts      # Sanity-checks the ingredient dataset
│       └── data/ingredients.json # 227-ingredient seed dataset
├── utils/
│   ├── prisma/                   # Prisma client instance
│   ├── calculations/             # Nutrition + streak math
│   └── schemas/                  # Zod schemas
└── package.json
```

## Data Model

Defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

- **Ingredient** — name, calories/protein/carbs/fat per 100g, category, whether it's a custom (user-added) or seeded ingredient
- **Recipe** — name, description, instructions, servings, cooking time, rating, favorite flag
- **RecipeIngredient** — join table linking a recipe to its ingredients with a quantity in grams; this is what nutrition totals are calculated from
- **CookingHistory** — a timestamped log entry each time a recipe is cooked, used for streaks and stats

There is no `User` model — the app has no authentication layer.

## Getting Started

### Prerequisites

- **Node.js 18.18+** (required by Next.js 15)
- **npm** or **pnpm**
- A **PostgreSQL** database
- A **Gemini API key** ([Google AI Studio](https://aistudio.google.com/)) — only required for the AI recipe generation feature; the rest of the app works without it

### Installation

```bash
git clone https://github.com/KreoSteel/nutrition-tracker.git
cd nutrition-tracker
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://user:password@host:5432/nutrition_tracker"
DIRECT_URL="postgresql://user:password@host:5432/nutrition_tracker"

GEMINI_API_KEY=your-gemini-api-key
```

### Database Setup

```bash
# Apply migrations
npx prisma migrate dev

# Load the 227-ingredient seed dataset
npm run import-ingredients
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev --turbopack` | Start the local dev server |
| `npm run build` | `next build --turbopack` | Create a production build |
| `npm run start` | `next start -H 0.0.0.0` | Run the production build |
| `npm run lint` | `eslint` | Lint the codebase |
| `npm run typecheck` | `tsc --noEmit` | Type-check without emitting output |
| `npm run import-ingredients` | `ts-node .../import-ingredients.ts` | Load the seed ingredient dataset into the DB |
| `npm run validate-data` | `ts-node .../validate-data.ts` | Check the ingredient dataset for missing/invalid values |

## AI Recipe Generation

`POST /api/ai/generate-recipe` takes a recipe name, servings, and a list of ingredients with gram quantities, and calls Gemini (`gemini-2.5-flash`) to write a one-sentence description and a step-by-step instruction list, returned as validated JSON. Requires `GEMINI_API_KEY` to be set — without it, this one endpoint returns an error, but the rest of the app (ingredients, recipes, cooking history, dashboard) works independently of it.

## CI/CD

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`/`develop`: ESLint, a TypeScript check, and a full production build (with Prisma Client generation).

## License

This project is licensed under the [MIT License](./LICENSE).
