# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Learning Methods Platform** - A single-page application (SPA) for discovering, curating, and summarizing articles about learning methods in the AI era. Built with vanilla JavaScript, Vite, and modern CSS.

**Key Stats:**
- No external JavaScript dependencies (framework-free)
- ~15KB minified + gzipped
- 8 pre-loaded sample articles
- Ready for real LLM API integration
- Production-ready code quality

---

## Common Development Commands

```bash
# Install dependencies (run once after cloning)
npm install

# Start development server with Hot Module Replacement
npm run dev
# Opens automatically at http://localhost:5173

# Build for production
npm run build
# Output in dist/ folder (~7KB gzipped)

# Preview production build locally
npm run preview

# Lint code quality
npm run lint

# Auto-format code
npm run format
```

---

## High-Level Architecture

### **Pattern: Client-Side MVC**

```
┌─ VIEW LAYER ────────────────────┐
│ index.html (semantic markup)    │
│ - Navigation header (sticky)    │
│ - 4 main sections (hide/show)   │
│ - Forms (search, filters)       │
└─────────────────────────────────┘
           ↓ (DOM manipulation)
┌─ CONTROLLER LAYER ─────────────┐
│ src/main.js (387 lines)         │
│ - APP_STATE (centralized)       │
│ - Event listeners               │
│ - Render functions              │
│ - Business logic                │
└─────────────────────────────────┘
           ↓ (styling via classes)
┌─ PRESENTATION LAYER ───────────┐
│ src/style.css (667 lines)       │
│ - CSS variables (design system) │
│ - Component styles              │
│ - Animations                    │
│ - Responsive breakpoints        │
└─────────────────────────────────┘
```

### **Data Flow**

```
User Action (click/type)
    ↓
Event Listener
    ↓
Update APP_STATE
    ↓
Call Render Function (renderArticles/renderSummaries/showSection)
    ↓
Filter/Transform Data
    ↓
Generate HTML Elements
    ↓
Append to DOM + Attach Listeners
```

---

## Core Architecture Components

### **1. State Management: APP_STATE**

Single JavaScript object holding all application state (top of `src/main.js`):

```javascript
const APP_STATE = {
  articles: [],              // Array of article objects
  summaries: {},             // Map of articleId → summary text
  currentSection: 'hero',    // Active view: 'hero'|'discover'|'summaries'|'curated'
  selectedCategory: '',      // Filter: 'learning'|'ai'|'brain'|'productivity'|''
  searchQuery: ''            // Real-time search string
}
```

**Key characteristics:**
- Single source of truth
- No persistence (resets on refresh - ready for localStorage if needed)
- Directly mutated by event handlers
- All render functions read from APP_STATE

### **2. Article Data Model**

From `SAMPLE_ARTICLES` array (currently 8 articles):

```javascript
{
  id: number,
  title: string,
  excerpt: string,
  category: 'learning' | 'ai' | 'brain' | 'productivity',
  date: 'YYYY-MM-DD',
  author: string,
  source: string
}
```

Summaries stored as: `APP_STATE.summaries[articleId] = "summary text..."`

### **3. Section Navigation**

Function: `showSection(sectionName)`

Implements tabbed interface with sections:
- **hero** - Landing page with CTA
- **discover** - Full article browse with search/filter
- **summaries** - View generated summaries
- **curated** - Featured articles (top 4)

Logic: Hide all sections → Show target → Update active button → Trigger render

### **4. Article Rendering Pipeline**

Function: `renderArticles(curatedOnly = false)`

```
Filter SAMPLE_ARTICLES:
  1. By category (if selectedCategory set)
  2. By search query (title OR excerpt OR author match)
  3. Limit to 4 if curatedOnly=true
    ↓
Create DOM elements for each:
  - createArticleCard(article)
    - Header: badge + title
    - Body: excerpt
    - Meta: date + buttons (Summarize, Read)
  - Attach event listeners to buttons
    ↓
Append to #articles-grid
```

### **5. Search & Filter System**

Two input sources:
- `#category-filter` → `APP_STATE.selectedCategory`
- `#search-input` → `APP_STATE.searchQuery`

Both have event listeners that trigger `renderArticles()` immediately (no debouncing).

Filters work in **combination** (AND logic):
```javascript
// Both must match if both are set
if (category && query) {
  article.category === category && titleOrExcerptMatches(query)
}
```

### **6. AI Summarization**

Function: `generateAndShowSummary(article)`

```
Check APP_STATE.summaries[articleId]
  ✓ If cached → Navigate to summaries
  ✗ If not cached:
    1. Show "⏳ Generating..." (button disabled)
    2. await generateMockSummary() [simulated 1.5s]
    3. Cache result in APP_STATE.summaries
    4. Show "✅ Done"
    5. Navigate to summaries section
```

**Currently:** Template-based mock summaries by category
**Ready for:** Real LLM API (Claude, GPT, Gemini) - see API_INTEGRATION_GUIDE.md

### **7. Styling Architecture**

CSS variables define design system (`:root` in style.css):

```css
/* Core Colors */
--primary-gradient: linear-gradient(135deg, #a855f7, #7c3aed)
--accent-color: #06b6d4
--dark-bg: #0f172a
--card-bg: #1e293b

/* Used throughout components */
.article-card { background: var(--card-bg); }
.btn-primary { background: var(--primary-gradient); }
```

**Components use BEM-adjacent naming:**
- `.article-card` (block)
- `.article-header`, `.article-title` (children)
- `.article-card:hover` (states)

**Responsive breakpoints:**
- `@media (max-width: 1024px)` - Tablet adjustments
- `@media (max-width: 768px)` - Mobile layout
- `@media (max-width: 480px)` - Small mobile

---

## How to Add Features

### **Add a New Article Category**

1. Update category dropdown in `index.html`:
   ```html
   <option value="new-category">Display Name</option>
   ```

2. Add to `categoryLabel` and `categoryColors` in `createArticleCard()` (main.js)

3. Add sample articles with `category: 'new-category'` to `SAMPLE_ARTICLES`

4. Add summary template in `generateMockSummary()`:
   ```javascript
   'new-category': `Template text...`
   ```

### **Add a New View Section**

1. Add HTML markup in `index.html`:
   ```html
   <section id="new-section" class="new-section hidden">...</section>
   ```

2. Store DOM reference in `main.js`:
   ```javascript
   const newSection = document.getElementById('new-section')
   ```

3. Add navigation button with `data-section="new-section"`

4. Handle in `showSection()` function:
   ```javascript
   } else if (sectionName === 'new-section') {
     newSection.classList.remove('hidden')
     renderNewSection()
   }
   ```

5. Create render function: `function renderNewSection() { ... }`

### **Integrate Real LLM API**

Replace mock `generateAndShowSummary()` with real API call:

```javascript
async function generateAndShowSummary(article) {
  // ... existing cache check and loading state ...

  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        excerpt: article.excerpt
      })
    })

    if (!response.ok) throw new Error('API error')
    const { summary } = await response.json()

    APP_STATE.summaries[article.id] = summary
    // ... show success and navigate ...
  } catch (error) {
    // ... handle error ...
  }
}
```

Full integration guide in `API_INTEGRATION_GUIDE.md`.

### **Connect Real Article Data**

Replace `SAMPLE_ARTICLES` initialization:

```javascript
async function loadArticles() {
  try {
    const response = await fetch('/api/articles')
    APP_STATE.articles = await response.json()
    renderArticles()
  } catch (error) {
    console.error('Failed to load articles:', error)
  }
}

// Call on app init instead of using SAMPLE_ARTICLES
loadArticles()
```

---

## Build System (Vite)

### **Configuration** (`vite.config.js`)

Key settings:
- Dev server: `http://localhost:5173` with HMR enabled
- Build target: `es2020` (modern browsers)
- Minification: Terser
- Output: `dist/` folder with asset hashing

### **Build Output**

```
dist/
├── index.html (3.3 KB)
├── css/index-[hash].css (9.2 KB)
└── js/index.js (10.3 KB)
Total: ~22.8 KB (7.2 KB gzipped)
```

### **Development vs Production**

- **Dev:** Full source maps, unminified, HMR enabled
- **Prod:** Minified, hashed assets, optimized

---

## File Organization

| File | Lines | Purpose |
|------|-------|---------|
| `src/main.js` | 387 | All JavaScript: state, events, rendering, logic |
| `src/style.css` | 667 | All styling: design system, components, responsive |
| `index.html` | 87 | HTML structure: semantic markup |
| `vite.config.js` | ~50 | Build configuration |
| `package.json` | ~30 | Project metadata, dependencies, scripts |

**Documentation files:**
- `README.md` - Main documentation and quick start
- `QUICK_START.md` - Getting started guide
- `FEATURES.md` - Detailed feature descriptions
- `API_INTEGRATION_GUIDE.md` - How to integrate LLM APIs
- `DEVELOPMENT_SUMMARY.md` - Project overview
- `PROJECT_STATUS.md` - Status and metrics

---

## Key Patterns to Know

### **Event Handling**
Events are attached during rendering to newly created elements:
```javascript
card.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const action = btn.dataset.action
    // Handle
  })
})
```

### **Visibility Control**
Uses `.hidden` CSS class instead of conditional rendering:
```javascript
section.classList.add('hidden')    // Hide
section.classList.remove('hidden') // Show
```

### **Filtering Pipeline**
Always starts fresh from SAMPLE_ARTICLES:
```javascript
let articles = [...SAMPLE_ARTICLES]
// Then apply filters sequentially
```

### **Mock Data as Template**
Replace `SAMPLE_ARTICLES` with API calls when ready. All render functions expect array of article objects.

---

## Common Customizations

### **Change Color Scheme**
Edit CSS variables in `src/style.css`:
```css
:root {
  --primary-gradient: linear-gradient(135deg, #new-color1, #new-color2);
  --accent-color: #new-accent;
  /* etc */
}
```

### **Change Layout**
Modify CSS in `src/style.css`. Key rules:
- `.articles-grid` - Article card layout
- `.navbar` - Header layout
- `@media` queries - Responsive behavior

### **Add Articles**
Add objects to `SAMPLE_ARTICLES` in `src/main.js`. Must include all fields: `id`, `title`, `excerpt`, `category`, `date`, `author`, `source`.

### **Change Navigation Sections**
Modify `showSection()` function and add/remove section HTML in `index.html`.

---

## Performance Notes

- **Bundle size:** ~7KB gzipped (very small, no dependencies)
- **Load time:** <1 second (all code local, no API calls initially)
- **Rendering:** Direct DOM manipulation is fast for <1000 items
- **Search/filter:** Linear filtering is fine for current data volume

**Optimization if needed:**
- Virtual scrolling for 1000+ articles
- Full-text search indexing (Lunr.js)
- Pagination/lazy loading
- Service worker for offline

---

## Testing & Quality

Currently no test suite. To add tests:

```bash
npm install --save-dev vitest @testing-library/dom

# Create tests/ directory with *.test.js files
npm run test
```

---

## Deployment

### **Build for Production**
```bash
npm run build
```

Outputs optimized files to `dist/` folder.

### **Deploy To**
- **Vercel** - `vercel deploy`
- **Netlify** - `netlify deploy --prod`
- **GitHub Pages** - Push `dist/` to gh-pages branch
- **Any Static Host** - Upload `dist/` folder contents

---

## Debugging Tips

1. **Check console logs:**
   - App initialization: "🧠 AI Learning Methods App loaded..."
   - Article loading: "Sample articles loaded: 8"

2. **Debug state:**
   ```javascript
   // In browser console:
   console.log(APP_STATE)
   ```

3. **Inspect DOM changes:**
   - F12 → Elements tab
   - Watch `.hidden` class additions/removals

4. **Test events:**
   - F12 → Console → Click buttons
   - Check event listeners in Elements tab

---

## Dependencies

**Production:** None (framework-free)

**Development:**
- `vite` - Build tool and dev server
- `terser` - JavaScript minifier
- `eslint` - Code quality
- `prettier` - Code formatting
- `@vitejs/plugin-vue` - Installed but not used

---

## Important Notes for Future Work

1. **Mock summaries are placeholders** - Use `generateMockSummary()` function for temporary functionality, replace with real LLM API calls

2. **No data persistence** - Summaries are lost on page refresh. Add localStorage or backend if needed.

3. **No authentication** - Design is ready to add user accounts and saved articles.

4. **Sample data only** - Replace `SAMPLE_ARTICLES` with API calls when connecting real article sources.

5. **Vanilla JS approach** - No framework means less abstraction but more direct control. Stay with this pattern or gradually add a framework if needed.

6. **CSS-only responsive** - No JavaScript for responsive behavior. All responsive logic is in CSS media queries.

---

## Related Documentation

- **API_INTEGRATION_GUIDE.md** - Step-by-step LLM integration (Claude, GPT-4, Gemini)
- **FEATURES.md** - Complete feature list and descriptions
- **README.md** - Full project documentation
- **QUICK_START.md** - Getting started guide
- **DEVELOPMENT_SUMMARY.md** - Architecture and implementation details
- **PROJECT_STATUS.md** - Project metrics and status

---

## Quick Reference: Where to Make Changes

| What | Where |
|------|-------|
| Add article category | `SAMPLE_ARTICLES` + `createArticleCard()` + `generateMockSummary()` |
| Change colors | CSS variables in `:root` of `style.css` |
| Add navigation section | `index.html` + `showSection()` in `main.js` |
| Change layout | CSS rules in `style.css`, especially grid and flex layouts |
| Add articles | `SAMPLE_ARTICLES` array in `main.js` |
| Integrate LLM API | `generateAndShowSummary()` function in `main.js` |
| Connect article API | Replace `SAMPLE_ARTICLES` initialization with `fetch()` call |
| Update header/branding | `index.html` navbar section and CSS |
- after each code change, make sure to commit and push it