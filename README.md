# Stakeit - Solana Staking Platform

A user-friendly, decentralized Solana staking application that allows users to view validators, delegate SOL, and track rewards.

## Features

- 🔍 **Validator Discovery**: Browse and filter through active Solana validators
- 💰 **Easy Staking**: Delegate SOL to validators with a simple interface
- 📊 **Rewards Calculator**: Estimate staking rewards with different parameters
- 📈 **Dashboard**: Track your active stakes and rewards in real-time
- 🔒 **Secure**: Non-custodial staking with popular Solana wallets
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit
- **Solana Integration**: @solana/web3.js, Wallet Adapter
- **Charts**: Recharts
- **UI Components**: Custom components with Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Solana wallet (Phantom recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/stakeit.git
cd stakeit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Solana RPC endpoint (optional, defaults to public endpoint)
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Solana network (mainnet-beta, testnet, devnet)
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── calculator/        # Staking calculator page
│   ├── staking/           # User dashboard page
│   ├── validators/        # Validators listing page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Hero.tsx
│   ├── Navigation.tsx
│   ├── ValidatorList.tsx
│   ├── StakingCalculator.tsx
│   ├── StakingDashboard.tsx
│   └── ...
├── store/                 # Redux store and slices
│   ├── slices/
│   │   ├── validatorSlice.ts
│   │   ├── stakingSlice.ts
│   │   └── walletSlice.ts
│   └── index.ts
├── utils/                 # Utility functions
│   └── formatters.ts
└── types/                 # TypeScript type definitions
```

## Core Features

### Validator List
- View all active Solana validators
- Filter by APY, commission, and other metrics
- Sort by various criteria
- Switch between table and card views

### Staking Calculator
- Calculate potential rewards based on stake amount and validator APY
- Interactive charts showing projected growth
- Support for different time frames
- Real-time calculations

### Staking Dashboard
- View all active stake accounts
- Track total staked amount and earned rewards
- Transaction history with Solana Explorer links
- Account status monitoring

### Wallet Integration
- Support for popular Solana wallets (Phantom, Solflare, etc.)
- Secure transaction signing
- Real-time balance updates
- Network switching support

## API Routes

- `GET /api/validators` - Fetch list of validators
- `GET /api/stake-accounts/[address]` - Get user's stake accounts
- `POST /api/delegate` - Create stake delegation transaction

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm test             # Run tests
```

### Code Style

This project uses:
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting
- Tailwind CSS for styling

### Testing

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Heroku
- Railway
- Your own server

Build the application:
```bash
npm run build
```

## Security Considerations

- Never store private keys in the application
- All transactions are signed client-side in the user's wallet
- API routes validate all inputs
- Rate limiting should be implemented for production
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Solana Foundation for the excellent blockchain infrastructure
- Wallet Adapter team for Solana wallet integration
- Community validators for maintaining the network

## Support

For support, email support@stakeit.app or join our Discord community.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced portfolio analytics
- [ ] Validator performance notifications
- [ ] Multi-validator staking strategies
- [ ] Integration with DeFi protocols
- [ ] Governance voting interface