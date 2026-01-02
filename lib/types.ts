export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  joinDate: string
  totalPurchases: number
  totalSpent: number
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
  supplier: string
  description: string
}

export interface Transaction {
  id: string
  customerId: string
  customerName: string
  date: string
  items: TransactionItem[]
  totalAmount: number
  paymentMethod: "cash" | "card" | "mobile"
  status: "completed" | "pending" | "cancelled"
}

export interface TransactionItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface DashboardStats {
  totalCustomers: number
  totalProducts: number
  totalTransactions: number
  totalRevenue: number
  revenueGrowth: number
  customerGrowth: number
  topProducts: { name: string; sales: number }[]
  recentTransactions: Transaction[]
}
