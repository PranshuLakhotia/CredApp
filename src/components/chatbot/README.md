# AI Chatbot Component

## Quick Start

The AI chatbot is already integrated and will appear on all dashboard pages. Just add your OpenRouter API key!

### 1. Get API Key
Visit https://openrouter.ai/keys and create a free account to get your API key.

### 2. Add to Environment
Create `frontend1/CredApp/.env.local`:
```env
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=CredApp
```

### 3. Restart Server
```bash
cd frontend1/CredApp
npm run dev
```

## Features

✅ **Comprehensive Platform Knowledge**
- Knows all API endpoints and their usage
- Understands all user roles and permissions
- Familiar with workflows (issuance, verification, KYC)
- Backend and frontend architecture

✅ **Smart Conversations**
- Multi-turn conversations with context
- Role-aware responses (adapts to Learner, Employer, Institution, Admin)
- Persistent chat history in browser
- Copy messages, clear chat, minimize window

✅ **Beautiful UI**
- Floating action button in bottom-right
- Gradient purple theme
- Mobile responsive
- Unread message counter
- Message timestamps

## Component Structure

```
src/
├── components/
│   └── chatbot/
│       ├── AIChatbot.tsx          # Main chatbot component
│       └── README.md              # This file
├── services/
│   └── openrouter.service.ts      # API service
└── config/
    └── chatbot-context.ts         # System prompt with platform knowledge
```

## Usage Examples

### For Learners
```
User: How do I share my credential?
Bot: You can share credentials in multiple ways:
1. Go to Dashboard > Profile > Credentials
2. Click on the credential you want to share
3. Click "Share" button
4. Choose sharing method:
   - QR Code: Generate scannable QR code
   - Link: Create shareable link with expiry
   - Email: Send directly to employer's email
5. Set expiration time and privacy level
6. Save and share!

The share functionality uses POST /api/v1/learner/credentials/share endpoint.
```

### For Institutions
```
User: How do I issue credentials in bulk?
Bot: To issue credentials in bulk:
1. Go to Dashboard > Bulk Credentials
2. Download the CSV template
3. Fill in learner details (columns: learner_email, credential_type, course_name, grade, issue_date)
4. Upload the filled CSV
5. Review the preview
6. Click "Issue Credentials"
7. System will process and deploy to blockchain

You can track progress at GET /api/v1/issuer/batch-status/{batch_id}
Large batches (1000+) may take 5-10 minutes.
```

### For Employers
```
User: How do I search for Python developers?
Bot: To search for Python developers:
1. Go to Dashboard > Search Learners
2. Use the search form:
   - Enter "Python" in skills field
   - Add additional filters (location, experience, etc.)
   - Click Search
3. Results show verified candidates with Python skills
4. Click on candidate to view full profile
5. Verify their credentials with the "Verify" button

The search uses POST /api/v1/employer/search endpoint with filters.
```

## Customization

### Change AI Model
Edit `src/services/openrouter.service.ts`:
```typescript
model: 'openai/gpt-4o-mini', // Change to any OpenRouter model
```

Popular options:
- `openai/gpt-4o-mini` (recommended, fast & cheap)
- `openai/gpt-4o` (more powerful)
- `anthropic/claude-3.5-sonnet` (Claude)
- `google/gemini-pro` (Gemini)

### Update Platform Knowledge
Edit `src/config/chatbot-context.ts` to add:
- New features or API endpoints
- Updated workflows
- Additional troubleshooting guides

### Customize Appearance
Edit `src/components/chatbot/AIChatbot.tsx`:
```typescript
// Change gradient colors
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

// Change window size
width: { xs: 'calc(100% - 48px)', sm: 400 },
height: isMinimized ? 'auto' : 600,

// Change position
bottom: 100,
right: 24,
```

## Data Storage

All conversations are stored in browser localStorage:
- Key: `chatbot-messages`
- Persists across page reloads
- Cleared when user clicks "Clear Chat"
- No server-side storage

## API Costs

OpenRouter charges per token:
- **gpt-4o-mini**: ~$0.15/$0.60 per 1M tokens (input/output)
- Average conversation: ~2000 tokens
- Estimated cost: ~$0.001-0.002 per conversation
- Monthly (100 conversations): ~$0.10-0.20

## Security Notes

1. API key is exposed in browser (prefixed with NEXT_PUBLIC_)
2. Consider using a backend proxy for production
3. Implement rate limiting to prevent abuse
4. Monitor OpenRouter usage dashboard

## Troubleshooting

### Chatbot not appearing
- Check if AIChatbot is imported in DashboardLayout
- Verify component is rendered in the layout
- Check browser console for errors

### Not responding
- Verify API key in .env.local
- Check API key is valid on OpenRouter
- Restart development server
- Check browser console for API errors

### Slow responses
- gpt-4o-mini should respond in 2-5 seconds
- gpt-4o may take 5-10 seconds
- Check your internet connection
- Try a faster model

### Chat history lost
- localStorage may be cleared by browser
- Private/incognito mode doesn't persist
- Browser storage quota exceeded

## Future Enhancements

Possible additions:
- 🎤 Voice input (speech-to-text)
- 🌐 Multi-language support (integrate with next-intl)
- 📊 Chat analytics (send to backend)
- 📎 File upload support (analyze credentials)
- 🔔 Proactive suggestions (based on user actions)
- 💬 Suggested quick actions (buttons to navigate)
- 🎨 Custom themes
- 📱 Mobile app integration

## Support

For issues:
1. Check OpenRouter status: https://openrouter.ai/status
2. Review API docs: https://openrouter.ai/docs
3. Check browser console for detailed errors
4. Verify API key validity

---

**The chatbot is pre-configured with extensive knowledge about CredApp. It can help users with navigation, API integration, troubleshooting, and understanding features. The system context contains comprehensive information about the entire platform architecture.**


