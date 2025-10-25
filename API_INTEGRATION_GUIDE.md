# LLM API Integration Guide

This guide covers how to integrate real LLM APIs (like Claude, GPT-4, etc.) into the AI Learning Methods application.

## Overview

The current application uses mock/template-based summaries. To add real AI-powered summarization, you'll need to:

1. Set up API credentials
2. Create backend endpoint (recommended for security)
3. Integrate API calls into the frontend
4. Handle errors and rate limiting

## Option 1: Backend Integration (Recommended)

### Setup

Create a backend service (Node.js/Express example):

```javascript
// backend/api/summarize.js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function summarizeArticle(article) {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Summarize the following article about learning methods in the AI era.
        Provide a concise summary with key points and actionable insights.

        Title: ${article.title}
        Excerpt: ${article.excerpt}
        Category: ${article.category}

        Format the response with bullet points for key takeaways.`
      }
    ]
  });

  return message.content[0].text;
}
```

### Frontend Integration

Update `src/main.js`:

```javascript
async function generateAndShowSummary(article) {
  const button = document.querySelector(
    `[data-article-id="${article.id}"][data-action="summarize"]`
  );
  const originalText = button.textContent;
  button.textContent = '⏳ Generating...';
  button.disabled = true;

  try {
    // Call your backend endpoint
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        excerpt: article.excerpt,
        category: article.category
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const { summary } = await response.json();
    APP_STATE.summaries[article.id] = summary;

    button.textContent = '✅ Done';
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      showSection('summaries');
    }, 1000);
  } catch (error) {
    console.error('Error generating summary:', error);
    button.textContent = 'Error';
    button.disabled = false;
    alert(`Failed to generate summary: ${error.message}`);
  }
}
```

## Option 2: Direct Frontend Integration

For development/testing only (exposes API keys - not recommended for production):

```javascript
async function generateAndShowSummary(article) {
  // ... existing code ...

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Create a comprehensive summary of this article about learning methods in the AI era.

Title: ${article.title}
Content: ${article.excerpt}

Provide key points, important insights, and actionable recommendations.`
          }
        ]
      })
    });

    const data = await response.json();
    const summary = data.content[0].text;
    APP_STATE.summaries[article.id] = summary;

    // ... rest of existing code ...
  } catch (error) {
    // ... error handling ...
  }
}
```

## Environment Setup

### Create `.env.local`:

```env
# For backend integration
VITE_API_ENDPOINT=http://localhost:3001/api

# For direct frontend integration (development only)
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### Access in code:

```javascript
const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
```

## Error Handling

Add robust error handling:

```javascript
async function generateAndShowSummary(article) {
  const button = document.querySelector(
    `[data-article-id="${article.id}"][data-action="summarize"]`
  );
  const originalText = button.textContent;
  button.textContent = '⏳ Generating...';
  button.disabled = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId: article.id }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limited. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('API authentication failed.');
      } else {
        throw new Error(`API error: ${response.statusText}`);
      }
    }

    const data = await response.json();
    APP_STATE.summaries[article.id] = data.summary;

    button.textContent = '✅ Done';
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      showSection('summaries');
    }, 1000);
  } catch (error) {
    console.error('Summary generation error:', error);

    if (error.name === 'AbortError') {
      button.textContent = 'Timeout';
      alert('Request timed out. Please try again.');
    } else {
      button.textContent = 'Error';
      alert(`Failed: ${error.message}`);
    }

    button.disabled = false;
  }
}
```

## Rate Limiting & Caching

Implement client-side caching to reduce API calls:

```javascript
// In APP_STATE, track summary generation status
const APP_STATE = {
  // ... existing properties ...
  summaryCache: {},      // Cache summaries
  isGenerating: false,   // Prevent concurrent requests
  requestQueue: []       // Queue requests
};

// Debounce rapid requests
function throttleSummaryRequests(article) {
  if (APP_STATE.isGenerating) {
    APP_STATE.requestQueue.push(article);
    return;
  }

  APP_STATE.isGenerating = true;

  generateAndShowSummary(article).then(() => {
    APP_STATE.isGenerating = false;

    // Process queued requests
    if (APP_STATE.requestQueue.length > 0) {
      const nextArticle = APP_STATE.requestQueue.shift();
      throttleSummaryRequests(nextArticle);
    }
  });
}
```

## Testing the Integration

1. **Test with mock data first:**
   ```javascript
   const mockSummary = "This is a test summary...";
   APP_STATE.summaries[article.id] = mockSummary;
   ```

2. **Verify API credentials:**
   ```bash
   curl -H "x-api-key: your-key" https://api.anthropic.com/v1/messages
   ```

3. **Monitor console for errors:**
   Open browser DevTools (F12) and check the Console tab for any errors

4. **Check network requests:**
   Use the Network tab to verify API calls are being made correctly

## Production Checklist

- [ ] API key is in backend only (not in frontend code)
- [ ] Error handling is comprehensive
- [ ] Rate limiting is implemented
- [ ] Summaries are cached to reduce API calls
- [ ] Request timeouts are set
- [ ] User-friendly error messages
- [ ] Loading states are clear
- [ ] API costs are monitored
- [ ] CORS is properly configured (if needed)
- [ ] API requests are logged for debugging

## Supported LLM Providers

### Anthropic Claude
- Recommended for production
- Great summarization capabilities
- [Documentation](https://docs.anthropic.com)

### OpenAI GPT-4
- Powerful language model
- Token-based pricing
- [Documentation](https://platform.openai.com/docs)

### Google Gemini
- Competitive pricing
- Multimodal capabilities
- [Documentation](https://ai.google.dev)

### Other Options
- Cohere
- Hugging Face Inference API
- Open-source models (Llama, Mistral)

## Cost Optimization

- **Batch requests** when possible
- **Cache summaries** to avoid re-generation
- **Use appropriate model sizes** (Sonnet vs Opus)
- **Implement request pagination** for large datasets
- **Monitor usage** with API analytics

## Troubleshooting

### "API key not found"
- Check `.env.local` file exists
- Verify key format is correct
- Restart dev server after changing `.env`

### "CORS error"
- Add CORS headers in backend
- Or use backend proxy endpoint

### "Rate limit exceeded"
- Implement exponential backoff
- Add request queuing
- Cache results

### "Empty summaries"
- Check API response format
- Verify model is returning content
- Check token limits aren't being exceeded

## Support

For issues with LLM integration, refer to:
- API provider documentation
- Application logs in browser console
- Backend server logs
