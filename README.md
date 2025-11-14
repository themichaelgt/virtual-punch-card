# Virtual Punch Card

A Next.js 15 application that provides digital punch card/loyalty card functionality using NFC tags. Businesses can create campaigns, customers tap NFC tags to collect punches, and receive rewards upon completion.

## 🚀 Features

- **NFC Integration**: Customers tap physical NFC tags to collect punches
- **Business Dashboard**: Create and manage punch card campaigns
- **Customer Experience**: Passwordless authentication with magic links
- **Reward System**: Automatic reward code generation upon completion
- **Admin Portal**: Order management and tag fulfillment

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Links/OTP)
- **NFC Integration**: Web NFC API

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (free tier available)

## 🚦 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd virtual-punch-card
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Get these values from**: [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API

⚠️ **IMPORTANT**: Never commit your `.env.local` file. Keep your service role key secret!

### 4. Set up the database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create the necessary tables (refer to CLAUDE.md for schema details)
4. Set up Row Level Security (RLS) policies

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── punch/        # Core punch recording endpoint
│   │   ├── business/     # Business management APIs
│   │   └── admin/        # Admin operations
│   ├── business/         # Business dashboard pages
│   ├── tap/              # Customer tap interface
│   └── t/[token]/        # NFC redirect handler
└── lib/
    ├── supabase.ts       # Browser & Service clients
    ├── supabase-server.ts # Server client
    └── rate-limit.ts     # Rate limiting middleware
```

## 📱 Usage

### For Businesses

1. **Sign up** at `/business/signup`
2. **Complete profile** and create establishment
3. **Order NFC tags** from the dashboard
4. **Register tags** using activation codes
5. **Create campaigns** and assign tags
6. **Validate rewards** when customers redeem

### For Customers

1. **Tap NFC tag** with your phone
2. **Sign in** with magic link (passwordless)
3. **Collect punches** by tapping at the business
4. **Complete card** and receive reward code
5. **Redeem** at the business

## 🔒 Security

This project implements several security measures:

- ✅ Rate limiting on all API endpoints
- ✅ Environment variable protection
- ✅ Row Level Security (RLS) with Supabase
- ✅ Authentication required for sensitive operations
- ✅ Input validation and sanitization

**See [SECURITY.md](./SECURITY.md) for detailed security information and best practices.**

## 🧪 Available Scripts

```bash
# Development
npm run dev         # Start dev server with Turbopack

# Build
npm run build       # Production build with Turbopack

# Production
npm start           # Start production server

# Linting
npm run lint        # Run ESLint
```

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Detailed project architecture and patterns for AI assistants
- **[SECURITY.md](./SECURITY.md)** - Security implementation and best practices
- **[Next.js Docs](https://nextjs.org/docs)** - Learn about Next.js features
- **[Supabase Docs](https://supabase.com/docs)** - Learn about Supabase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🐛 Troubleshooting

### Common Issues

**"Authentication required" errors**:
- Ensure your Supabase environment variables are correct
- Check that cookies are enabled in your browser
- Verify RLS policies in Supabase

**NFC not working**:
- NFC is only available on HTTPS (or localhost for development)
- Ensure Web NFC API is supported in your browser
- Check that NFC is enabled on the device

**Rate limit errors**:
- Wait for the cooldown period specified in the error
- Rate limits reset on server restart in development
- Consider upgrading to Redis-based rate limiting for production

### Getting Help

- Check [CLAUDE.md](./CLAUDE.md) for architecture details
- Review [SECURITY.md](./SECURITY.md) for security-related issues
- Open an issue with detailed error information

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This is a standard Next.js 15 application and can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- Self-hosted with Docker

**Important**: Make sure to set environment variables on your deployment platform.

## 📊 Roadmap

- [ ] Customer dashboard
- [ ] Business analytics
- [ ] Mobile app (React Native)
- [ ] Multi-location support
- [ ] Advanced fraud detection
- [ ] Automated testing suite
- [ ] CI/CD pipeline

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
