# GitHub User Search

A React + TypeScript app that lets you search for GitHub users in real time, with autocomplete suggestions and a full profile view.

---

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** — dev server and bundler
- **Bootstrap 5** + **Bootstrap Icons** — UI components and icons
- Custom **CSS files** per component (no inline styles)

---

## Project Structure

```
src/
├── main.tsx                  # App entry point, Bootstrap imports
├── App.tsx                   # Root component, state wiring
├── App.css                   # Global layout, design tokens, typography
├── types.ts                  # Shared TypeScript interfaces
│
├── lib/
│   └── http.ts               # Fetch wrapper (request/response interceptor)
│
├── hooks/
│   └── useGithubSearch.ts    # All GitHub API logic, debounce, AbortController, state
│
└── components/
    ├── SearchBar.tsx          # Input + Search button
    ├── SearchBar.css
    ├── Suggestions.tsx        # Autocomplete dropdown
    ├── Suggestions.css
    ├── UserProfile.tsx        # Profile card + stats grid + skeleton loader
    └── UserProfile.css
```

---

## Installation

**Prerequisites:** Node.js v18 or later.

**1. Scaffold a new Vite project**

```bash
npm create vite@latest github-users -- --template react-ts
cd github-users
npm install
```

**2. Install Bootstrap and Bootstrap Icons**

```bash
npm install bootstrap bootstrap-icons
```

**3. Delete Vite's placeholder files**

The template generates several files you don't need. Remove them:

```bash
rm src/App.css           # Vite's default styles — yours replaces it
rm src/index.css         # Global reset — Bootstrap handles this instead
rm -rf src/assets/       # Entire assets folder (react.svg, vite.svg, hero.png — none are used)
```

**4. Copy the source files**

Replace the contents of `src/` with the files from this project, keeping the folder structure above intact.

**5. Edit `src/main.tsx`**

Remove the `import './index.css'` line (you just deleted that file), and add the Bootstrap imports at the top:

```ts
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
```

Your final `src/main.tsx` should look like this:

```ts
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

> **Leave these alone:** `index.html`, `vite.config.ts`, `tsconfig.json`, and `tsconfig.app.json` require no changes.

---

## Running the App

```bash
# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## How It Works

### Search flow

1. The user types into the search box.
2. Once 3 or more characters are entered, a debounced call (300ms) fires automatically against the GitHub search API.
3. Up to 10 matching usernames appear in a dropdown below the input.
4. Clicking a suggestion — or pressing Enter / clicking the Search button — loads the full user profile and dismisses the dropdown.

### State ownership

All state lives inside `useGithubSearch` — including the query. `App.tsx` only calls `setQuery` when the input changes and `selectUser` when a user is chosen. This keeps the component thin and the logic in one place.

### Debounce and request cancellation

Both are handled inside a single `useEffect` that reacts to query changes. On every keystroke, the cleanup function runs first, cancelling both the pending debounce timer and any in-flight request via `AbortController`:

```ts
useEffect(() => {
  const controller = new AbortController();

  const timer = setTimeout(async () => {
    await http.get(`/search/users?q=${query}`, { signal: controller.signal });
  }, 300);

  // Runs before the next effect fires — cancels timer and request
  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}, [query]);
```

This prevents two bugs at once: firing too many requests while the user is still typing, and stale responses from slower earlier requests overwriting fresher results.

### Preventing the dropdown from reappearing after selection

When `selectUser` is called it updates the query to the selected username, which would normally re-trigger the suggestions `useEffect` and repopulate the dropdown. A `skipNextSuggestions` ref is set to `true` just before the query update, causing the effect to skip the fetch for that one change and reset the flag immediately after:

```ts
// In selectUser:
skipNextSuggestions.current = true;
setState((prev) => ({ ...prev, query: username, suggestions: [] }));

// At the top of the useEffect:
if (skipNextSuggestions.current) {
  skipNextSuggestions.current = false;
  return;
}
```

### The fetch wrapper (`src/lib/http.ts`)

All HTTP calls go through a central wrapper instead of calling `fetch` directly. This is React's equivalent of Angular's `HttpInterceptor` — a single place to apply cross-cutting concerns to every request and response.

```ts
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // ← Request interceptor: runs before every request
  //   Add auth headers, log outgoing calls, inject tokens, etc.
  console.log(`[http] --> GET ${BASE_URL}${path}`);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  // ← Response interceptor: runs after every response
  //   Normalise errors, refresh tokens, log status codes, etc.
  console.log(`[http] <-- ${res.status} ${res.url}`);

  if (!res.ok) {
    if (res.status === 404) throw new Error(`Not found: ${path}`);
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data: T = await res.json();
  console.log('[http] response body:', data);
  return data;
}
```

**What you can add here without touching any other file:**

| Concern | Where in the wrapper |
|---|---|
| Auth token (`Authorization` header) | Request interceptor — add to `headers` |
| Global error toast / redirect to login on 401 | Response interceptor — check `res.status` |
| Request timing / performance logging | Measure time between request and response interceptor |
| Retry logic | Wrap the `fetch` call in a loop |
| Response caching | Check a `Map` before calling `fetch` |

The hook (`useGithubSearch`) only knows about paths and data shapes — it is unaware of base URLs, headers, or error normalisation. Those concerns live exclusively in `http.ts`.

---

## GitHub API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /search/users?q={query}&per_page=10` | Autocomplete suggestions |
| `GET /users/{username}` | Full user profile |

> **Note:** The GitHub API has a rate limit of 60 unauthenticated requests per hour. If you hit it, add a [personal access token](https://github.com/settings/tokens) as an `Authorization: Bearer <token>` header in `http.ts`.