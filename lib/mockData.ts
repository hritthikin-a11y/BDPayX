// Mock data for testing admin functionality when database is not accessible

export const mockDepositRequests = [
  {
    id: '1',
    user_id: 'user1',
    amount: 5000,
    currency: 'BDT' as const,
    sender_name: 'John Doe',
    transaction_ref: 'TXN123456',
    status: 'PENDING' as const,
    created_at: new Date().toISOString(),
    admin_notes: '',
    user_profile: {
      full_name: 'John Doe',
      phone: '+8801234567890',
    },
    admin_bank_account: {
      account_name: 'BDPayX Official',
      bank_name: 'Dutch Bangla Bank',
    },
  },
  {
    id: '2',
    user_id: 'user2',
    amount: 10000,
    currency: 'BDT' as const,
    sender_name: 'Jane Smith',
    transaction_ref: 'TXN789012',
    status: 'SUCCESS' as const,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    admin_notes: 'Verified and approved',
    user_profile: {
      full_name: 'Jane Smith',
      phone: '+8801987654321',
    },
    admin_bank_account: {
      account_name: 'BDPayX Official',
      bank_name: 'BRAC Bank',
    },
  },
];

export const mockWithdrawalRequests = [
  {
    id: '3',
    user_id: 'user3',
    amount: 3000,
    currency: 'BDT' as const,
    bank_account_name: 'MD. Ahmed Khan',
    bank_account_number: '1234567890123',
    bank_name: 'Islami Bank Bangladesh',
    status: 'PENDING' as const,
    created_at: new Date().toISOString(),
    admin_notes: '',
    user_profile: {
      full_name: 'Ahmed Khan',
      phone: '+8801555666777',
    },
  },
];

export const mockExchangeRequests = [
  {
    id: '4',
    user_id: 'user4',
    from_currency: 'BDT' as const,
    to_currency: 'INR' as const,
    from_amount: 10000,
    to_amount: 9000,
    exchange_rate: 0.9,
    status: 'PENDING' as const,
    created_at: new Date().toISOString(),
    admin_notes: '',
    user_profile: {
      full_name: 'Rahul Sharma',
      phone: '+8801777888999',
    },
  },
];

export const mockAdminBankAccounts = [
  {
    id: '1',
    account_name: 'BDPayX Official Account',
    account_number: '2051234567890',
    bank_name: 'Dutch Bangla Bank Limited',
    bank_type: 'COMMERCIAL',
    currency: 'BDT' as const,
    is_active: true,
    branch_name: 'Dhanmondi Branch',
    routing_number: '205260020',
    daily_limit: 1000000,
    monthly_limit: 30000000,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    account_name: 'BDPayX INR Account',
    account_number: '50100123456789',
    bank_name: 'State Bank of India',
    bank_type: 'COMMERCIAL',
    currency: 'INR' as const,
    is_active: true,
    branch_name: 'Kolkata Main Branch',
    ifsc_code: 'SBIN0000001',
    daily_limit: 500000,
    monthly_limit: 15000000,
    created_at: new Date().toISOString(),
  },
];

export const mockExchangeRates = [
  {
    id: '1',
    from_currency: 'BDT' as const,
    to_currency: 'INR' as const,
    rate: 0.9,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    from_currency: 'INR' as const,
    to_currency: 'BDT' as const,
    rate: 1.11,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const isMockMode = true; // Set to false when database is working