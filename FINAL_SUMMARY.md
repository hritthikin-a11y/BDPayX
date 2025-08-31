# BDPayX - Money Exchange App

## Overview
BDPayX is a production-grade money exchange application that allows users to exchange between BDT (Bangladeshi Taka) and INR (Indian Rupee). The app provides a complete banking experience with user authentication, wallet management, bank account integration, and transaction processing.

## Features Implemented

### Authentication
- User registration with email and password
- User login/logout
- Password reset functionality
- Automatic wallet and profile creation on signup

### Wallet Management
- BDT and INR balance tracking
- Real-time balance updates
- Automatic wallet creation for new users

### Bank Accounts
- Add and manage personal bank accounts
- Support for multiple bank types (bKash, Nagad, Rocket, Bank)
- View admin bank accounts for deposits

### Transactions
- Deposit requests with screenshot upload
- Withdrawal requests to personal bank accounts
- Currency exchange between BDT and INR
- Transaction history with status tracking

### UI/UX
- Modern, responsive design
- Intuitive navigation with tab-based interface
- Professional color scheme and typography
- Loading states and error handling
- Form validation and user feedback

## Technical Architecture

### Frontend
- Built with React Native and Expo
- TypeScript for type safety
- Supabase for backend services
- Expo Router for navigation
- Custom UI components

### Backend
- Supabase PostgreSQL database
- Row Level Security (RLS) for data protection
- Database triggers for automatic data creation
- Storage for deposit screenshots

### Database Schema
- User profiles with KYC status
- Wallets with BDT and INR balances
- User and admin bank accounts
- Exchange rates
- Transactions and request types (deposit, withdrawal, exchange)

## Screens Implemented

1. **Authentication Screens**
   - Welcome screen
   - Login screen
   - Registration screen
   - Password reset screen

2. **Main App Screens**
   - Home dashboard with balance overview
   - Wallet management
   - Transaction history
   - User profile

3. **Transaction Screens**
   - Deposit funds
   - Withdraw funds
   - Exchange currency
   - Transfer money (coming soon)

4. **Banking Screens**
   - Add bank account
   - Manage bank accounts

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Supabase local development server:
   ```bash
   supabase start
   ```

3. Run the app:
   ```bash
   npm start
   ```

4. For iOS development:
   ```bash
   npm run ios
   ```

5. For Android development:
   ```bash
   npm run android
   ```

## Future Enhancements

- Peer-to-peer transfers
- Push notifications for transaction updates
- Enhanced KYC verification
- Multi-language support
- Advanced analytics dashboard
- Admin panel for transaction management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.