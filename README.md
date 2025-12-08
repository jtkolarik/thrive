# Thrive - AI-Native Parenting Companion

Thrive is a mobile-first parenting app that combines developmental tracking, AI-powered coaching, and memory preservation.

## Features

- **Timeline & Entries**: Log notes, photos, milestones, and health records
- **AI Copilot**: Chat with an AI assistant that has full context of your child
- **Auto-Tagging**: AI automatically tags and categorizes entries
- **Milestone Tracking**: Track developmental milestones based on CDC guidelines
- **Weekly Digests**: Receive AI-generated summaries of your child's week
- **Memory Highlights**: Curated photo highlights and yearbook generation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo (SDK 52) |
| Navigation | Expo Router |
| Backend | Supabase (Auth, Postgres, Edge Functions, Storage) |
| Vector DB | Supabase pgvector |
| AI | OpenAI API (GPT-4o) |
| Email | Resend |

## Project Structure

```
thrive/
├── apps/
│   ├── mobile/          # React Native Expo app
│   │   ├── app/         # Expo Router screens
│   │   ├── components/  # UI and feature components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and clients
│   │   └── stores/      # Zustand state stores
│   └── web/             # Optional Next.js admin
├── packages/
│   └── shared/          # Shared types and utilities
└── supabase/
    ├── migrations/      # Database migrations
    └── functions/       # Edge Functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- OpenAI API key

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/thrive.git
   cd thrive
   ```

2. Install dependencies:
   ```bash
   cd apps/mobile
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Set up Supabase:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push

   # Seed milestone data
   supabase db seed

   # Deploy Edge Functions
   supabase functions deploy
   ```

5. Start the development server:
   ```bash
   npm start
   ```

6. Run on device/simulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Database Schema

The app uses the following main tables:

- `profiles` - User profiles (extends Supabase auth)
- `children` - Child profiles
- `entries` - Journal entries (notes, photos, milestones, health)
- `milestones` - Reference milestone data (CDC)
- `child_milestones` - Tracked milestone achievements
- `conversations` - Chat conversation threads
- `messages` - Chat messages
- `digests` - Weekly digest records

All tables have Row Level Security (RLS) enabled.

## Edge Functions

- `generate-embedding` - Generate OpenAI embeddings for entries
- `auto-tag-entry` - AI-powered entry tagging and sentiment analysis
- `chat-completion` - AI chat with RAG context retrieval
- `weekly-digest` - Generate and send weekly email digests

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT
