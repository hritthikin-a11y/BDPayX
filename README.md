# BDPayX Money Exchange App

## Overview

BDPayX is a comprehensive money exchange application for BDT ↔ INR transactions built with React Native and Expo Router.

## Features Implemented

1. **File-Based Routing System**:
   - Complete migration to Expo Router with proper file-based routing
   - Tab navigation for main app features
   - Authentication flow with protected routes

2. **Core Banking Features**:
   - Multi-currency wallet (BDT/INR)
   - Deposit requests (bKash, Nagad, Rocket, Bank)
   - Withdrawal requests
   - Currency exchange (BDT ↔ INR)
   - Transaction history
   - Bank account management

3. **Modern UI/UX**:
   - Clean, responsive design
   - Consistent styling across all screens
   - Intuitive navigation

## Project Structure

```
app/
  _layout.tsx              # Root layout
  index.tsx                # Entry point
  test.tsx                 # Test screen
  
  (auth)/                  # Authentication screens
    _layout.tsx            # Auth layout
    welcome.tsx            # Welcome screen
    login.tsx              # Login screen
    register.tsx           # Registration screen
    forgot-password.tsx    # Forgot password screen
  
  (tabs)/                  # Main app with tab navigation
    _layout.tsx            # Tab layout
    index.tsx              # Home screen
    deposit.tsx            # Deposit money
    withdraw.tsx           # Withdraw money
    exchange.tsx           # Exchange currency
    transactions.tsx       # Transaction history
    profile.tsx            # User profile
    bank-accounts.tsx      # Bank account management
    add-bank-account.tsx   # Add new bank account
    transaction-details/
      [id].tsx             # Transaction details

components/                # Reusable UI components
  CustomButton.tsx
  LoadingSpinner.tsx

lib/                       # Utility functions and services
  api.ts                 # API service layer
  constants.ts           # App constants
  supabase.ts            # Supabase client and types

providers/                 # React context providers
  AuthProvider.tsx
  BankingProvider.tsx
  ThemeProvider.tsx
```

## How to Run the Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm start
   ```

3. **Run on Specific Platforms**:
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For Web
   npm run web
   ```

## Supabase Integration

The app is designed to work with Supabase for backend services:

1. Set up your Supabase project
2. Update the Supabase URL and Anon Key in `lib/supabase.ts`
3. Create the necessary database tables
4. Configure Row Level Security policies

## Key Improvements

1. **Modern Architecture**: File-based routing with Expo Router
2. **Type Safety**: Full TypeScript implementation
3. **State Management**: React Context API for global state
4. **Responsive UI**: Clean, modern design with proper styling
5. **Error Handling**: Comprehensive error handling throughout
6. **Form Validation**: Proper input validation with user feedback
7. **Security**: Protected routes and proper authentication flow

## Next Steps

To get the app fully functional:

1. Set up your Supabase project
2. Configure the database tables as per the schema
3. Update the Supabase credentials in `lib/supabase.ts`
4. Test all functionality including authentication and transactions