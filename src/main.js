import './style.css'

// ============================================
// Application State & Configuration
// ============================================
const APP_STATE = {
  articles: [],
  summaries: {},
  currentSection: 'hero',
  selectedCategory: '',
  searchQuery: ''
}

// Sample articles data - replace with API calls to fetch real data
const SAMPLE_ARTICLES = [
  {
    id: 1,
    title: 'Spaced Repetition and the AI Learning Revolution',
    excerpt: 'Explore how spaced repetition, combined with AI-powered personalization, is transforming how we retain information in the age of artificial intelligence.',
    category: 'learning',
    date: '2025-10-24',
    author: 'Dr. Sarah Mitchell',
    source: 'Journal of Educational AI'
  },
  {
    id: 2,
    title: 'Active Recall vs. Passive Reading: What AI Research Reveals',
    excerpt: 'New studies using machine learning models show how active recall significantly outperforms passive learning methods, with implications for modern education.',
    category: 'brain',
    date: '2025-10-23',
    author: 'Prof. James Chen',
    source: 'Cognitive Science Today'
  },
  {
    id: 3,
    title: 'The Feynman Technique Meets Machine Learning',
    excerpt: 'Discover how the Feynman Technique can be enhanced with AI tools to accelerate learning and improve understanding of complex topics.',
    category: 'learning',
    date: '2025-10-22',
    author: 'Alice Rodriguez',
    source: 'Learning Methods Blog'
  },
  {
    id: 4,
    title: 'How AI is Personalizing Learning Pathways',
    excerpt: 'Artificial intelligence is enabling adaptive learning systems that customize education to individual learning styles, speeds, and preferences.',
    category: 'ai',
    date: '2025-10-21',
    author: 'Dr. Thomas Kumar',
    source: 'EdTech Innovations'
  },
  {
    id: 5,
    title: 'Neuroplasticity and AI: Training Your Brain in the Digital Age',
    excerpt: 'Understanding how neuroplasticity works and how AI-powered apps can help optimize your brain\'s ability to learn new skills faster.',
    category: 'brain',
    date: '2025-10-20',
    author: 'Dr. Emma Watson',
    source: 'Neuroscience Review'
  },
  {
    id: 6,
    title: 'Time Management with AI Assistants: Maximize Learning Hours',
    excerpt: 'Learn strategies to use AI tools for better time management, ensuring maximum productivity during your learning sessions.',
    category: 'productivity',
    date: '2025-10-19',
    author: 'Mark Sullivan',
    source: 'Productivity Weekly'
  },
  {
    id: 7,
    title: 'Deep Work and AI: Creating Distraction-Free Learning Environments',
    excerpt: 'How to leverage AI-powered focus tools and techniques to achieve deep work while learning complex subjects.',
    category: 'productivity',
    date: '2025-10-18',
    author: 'Laura Bennett',
    source: 'Focus Matters'
  },
  {
    id: 8,
    title: 'Machine Learning Models That Learn Like Humans',
    excerpt: 'Exploring how modern LLMs and neural networks mimic human learning processes and what we can learn from them.',
    category: 'ai',
    date: '2025-10-17',
    author: 'Dr. Michael Park',
    source: 'AI Research Digest'
  }
]

// ============================================
// DOM Elements
// ============================================
const heroSection = document.getElementById('hero')
const articlesSection = document.getElementById('articles-section')
const summariesSection = document.getElementById('summaries-section')
const articlesGrid = document.getElementById('articles-grid')
const summariesList = document.getElementById('summaries-list')
const startBtn = document.getElementById('start-btn')
const homeBtn = document.getElementById('home-btn')
const navBtns = document.querySelectorAll('.nav-btn')
const categoryFilter = document.getElementById('category-filter')
const searchInput = document.getElementById('search-input')
const searchBtn = document.querySelector('.search-btn')
const loadingSpinner = document.getElementById('loading-spinner')

// ============================================
// Navigation & Section Management
// ============================================
function showSection(sectionName) {
  heroSection.classList.add('hidden')
  articlesSection.classList.add('hidden')
  summariesSection.classList.add('hidden')

  navBtns.forEach(btn => btn.classList.remove('active'))

  if (sectionName === 'discover') {
    articlesSection.classList.remove('hidden')
    document.querySelector('[data-section="discover"]').classList.add('active')
    APP_STATE.currentSection = 'discover'
    renderArticles()
  } else if (sectionName === 'summaries') {
    summariesSection.classList.remove('hidden')
    document.querySelector('[data-section="summaries"]').classList.add('active')
    APP_STATE.currentSection = 'summaries'
    renderSummaries()
  } else if (sectionName === 'curated') {
    articlesSection.classList.remove('hidden')
    document.querySelector('[data-section="curated"]').classList.add('active')
    APP_STATE.currentSection = 'curated'
    renderArticles(true)
  } else {
    heroSection.classList.remove('hidden')
  }
}

startBtn.addEventListener('click', () => showSection('discover'))

homeBtn.addEventListener('click', () => showSection('hero'))

navBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    showSection(e.target.dataset.section)
  })
})

// ============================================
// Article Rendering & Management
// ============================================
function renderArticles(curatedOnly = false) {
  let articles = [...SAMPLE_ARTICLES]

  // Filter by category
  if (APP_STATE.selectedCategory) {
    articles = articles.filter(a => a.category === APP_STATE.selectedCategory)
  }

  // Filter by search query
  if (APP_STATE.searchQuery) {
    const query = APP_STATE.searchQuery.toLowerCase()
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.excerpt.toLowerCase().includes(query) ||
      a.author.toLowerCase().includes(query)
    )
  }

  // For curated section, show only top articles
  if (curatedOnly) {
    articles = articles.slice(0, 4)
  }

  articlesGrid.innerHTML = ''

  if (articles.length === 0) {
    articlesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No articles found. Try adjusting your filters.</p>'
    return
  }

  articles.forEach(article => {
    const articleCard = createArticleCard(article)
    articlesGrid.appendChild(articleCard)
  })
}

function createArticleCard(article) {
  const card = document.createElement('div')
  card.className = 'article-card'

  const categoryColors = {
    learning: '#a855f7',
    ai: '#06b6d4',
    brain: '#7c3aed',
    productivity: '#f59e0b'
  }

  const categoryLabel = {
    learning: 'Learning Methods',
    ai: 'AI & Education',
    brain: 'Brain Science',
    productivity: 'Productivity'
  }

  card.innerHTML = `
    <div class="article-header">
      <span class="article-category">${categoryLabel[article.category] || article.category}</span>
      <h3 class="article-title">${article.title}</h3>
    </div>
    <div class="article-body">
      <p class="article-excerpt">${article.excerpt}</p>
    </div>
    <div class="article-meta">
      <div class="article-date">
        📅 ${new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      <div class="article-actions">
        <button class="action-btn" data-article-id="${article.id}" data-action="summarize">✨ Summarize</button>
        <button class="action-btn" data-article-id="${article.id}" data-action="read">📖 Read</button>
      </div>
    </div>
  `

  // Add event listeners for action buttons
  card.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      const action = btn.dataset.action
      const articleId = btn.dataset.articleId

      if (action === 'summarize') {
        await generateAndShowSummary(article)
      } else if (action === 'read') {
        alert(`Opening article: "${article.title}"\n\nIn a real implementation, this would open the full article in a new tab.`)
      }
    })
  })

  return card
}

// ============================================
// AI Summarization (Mock LLM Integration)
// ============================================
async function generateAndShowSummary(article) {
  // Check if summary already exists
  if (APP_STATE.summaries[article.id]) {
    showSection('summaries')
    return
  }

  // Show loading state
  const button = document.querySelector(`[data-article-id="${article.id}"][data-action="summarize"]`)
  const originalText = button.textContent
  button.textContent = '⏳ Generating...'
  button.disabled = true

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate a mock summary using template-based approach
    const summary = generateMockSummary(article)
    APP_STATE.summaries[article.id] = summary

    // Show success
    button.textContent = '✅ Done'
    setTimeout(() => {
      button.textContent = originalText
      button.disabled = false
      showSection('summaries')
    }, 1000)
  } catch (error) {
    console.error('Error generating summary:', error)
    button.textContent = originalText
    button.disabled = false
    alert('Failed to generate summary. Please try again.')
  }
}

function generateMockSummary(article) {
  // Mock summaries based on categories
  const summaryTemplates = {
    learning: `This article explores "${article.title}". Key points include:
    • Modern learning techniques enhance retention through evidence-based methods
    • Integration of AI tools can personalize the learning experience
    • Combining traditional methods with technology yields optimal results
    • Consistency and practice are fundamental to mastery
    Conclusion: Adapting these methods to your learning style can significantly improve comprehension and retention.`,

    ai: `Examining "${article.title}", this research reveals:
    • Artificial intelligence is reshaping educational approaches
    • Machine learning algorithms can identify individual learning patterns
    • AI systems provide real-time feedback and personalized recommendations
    • The technology enables scaling of personalized education
    Key Insight: AI democratizes access to high-quality personalized learning experiences.`,

    brain: `"${article.title}" provides insights into:
    • How the brain processes and retains information
    • Neurological mechanisms underlying successful learning
    • The role of sleep, exercise, and stress management
    • Neuroplasticity enables continuous learning throughout life
    Application: Understanding brain science optimizes learning strategies.`,

    productivity: `Based on "${article.title}":
    • Effective time management multiplies learning productivity
    • Strategic breaks and focus periods enhance performance
    • Tools and systems support sustainable learning habits
    • Environment design significantly impacts concentration
    Recommendation: Implement systems that align with natural productivity rhythms.`
  }

  return summaryTemplates[article.category] || summaryTemplates.learning
}

function renderSummaries() {
  summariesList.innerHTML = ''

  const summarizedArticles = SAMPLE_ARTICLES.filter(a => APP_STATE.summaries[a.id])

  if (summarizedArticles.length === 0) {
    summariesList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No summaries yet. Click "✨ Summarize" on any article to generate one!</p>'
    return
  }

  summarizedArticles.forEach(article => {
    const summaryCard = document.createElement('div')
    summaryCard.className = 'summary-card'
    summaryCard.innerHTML = `
      <div class="summary-header">
        <div>
          <h3 class="summary-title">${article.title}</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">By ${article.author}</p>
        </div>
        <span class="summary-badge">AI Summary</span>
      </div>
      <div class="summary-content">
        ${APP_STATE.summaries[article.id]}
      </div>
      <div class="summary-footer">
        <button class="read-more-btn" data-article-id="${article.id}">Read Full Article</button>
        <button class="read-more-btn" style="flex: 0; padding: 0.75rem 1.5rem;" data-article-id="${article.id}" data-action="remove">Remove</button>
      </div>
    `

    summaryCard.querySelectorAll('.read-more-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        if (btn.dataset.action === 'remove') {
          delete APP_STATE.summaries[article.id]
          renderSummaries()
        } else {
          alert(`Opening article: "${article.title}"\n\nIn a real implementation, this would open the full article.`)
        }
      })
    })

    summariesList.appendChild(summaryCard)
  })
}

// ============================================
// Search & Filter
// ============================================
categoryFilter.addEventListener('change', (e) => {
  APP_STATE.selectedCategory = e.target.value
  if (APP_STATE.currentSection === 'discover' || APP_STATE.currentSection === 'curated') {
    renderArticles(APP_STATE.currentSection === 'curated')
  }
})

searchInput.addEventListener('input', (e) => {
  APP_STATE.searchQuery = e.target.value
  if (APP_STATE.currentSection === 'discover' || APP_STATE.currentSection === 'curated') {
    renderArticles(APP_STATE.currentSection === 'curated')
  }
})

searchBtn.addEventListener('click', (e) => {
  e.preventDefault()
  if (APP_STATE.currentSection !== 'discover') {
    showSection('discover')
  }
})

// ============================================
// Initialization
// ============================================
APP_STATE.articles = SAMPLE_ARTICLES
console.log('🧠 AI Learning Methods App loaded and ready!')
console.log('Sample articles loaded:', APP_STATE.articles.length)
