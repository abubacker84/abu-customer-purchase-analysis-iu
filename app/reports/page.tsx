"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { dataStore } from "@/lib/data-store"
import type { Transaction, Product, Customer } from "@/lib/types"
import { ShoppingCart, TrendingUp, Users, Package, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategorySales {
  category: string
  revenue: number
  units: number
}

interface DailySales {
  date: string
  revenue: number
  transactions: number
}

interface TopCustomer {
  id: string
  name: string
  purchases: number
  spent: number
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [timeRange, setTimeRange] = useState("all")

  const [categorySales, setCategorySales] = useState<CategorySales[]>([])
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; units: number; revenue: number }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (transactions.length > 0) {
      calculateAnalytics()
    }
  }, [transactions, products, customers, timeRange])

  const loadData = () => {
    setTransactions(dataStore.getTransactions())
    setProducts(dataStore.getProducts())
    setCustomers(dataStore.getCustomers())
  }

  const calculateAnalytics = () => {
    let filteredTransactions = [...transactions]

    // Apply time filter
    if (timeRange !== "all") {
      const now = new Date()
      const daysAgo = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= cutoffDate)
    }

    // Calculate category sales
    const categoryMap = new Map<string, { revenue: number; units: number }>()
    filteredTransactions.forEach((t) => {
      t.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          const existing = categoryMap.get(product.category) || { revenue: 0, units: 0 }
          categoryMap.set(product.category, {
            revenue: existing.revenue + item.subtotal,
            units: existing.units + item.quantity,
          })
        }
      })
    })
    const categoryData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        units: data.units,
      }))
      .sort((a, b) => b.revenue - a.revenue)
    setCategorySales(categoryData)

    // Calculate daily sales
    const dailyMap = new Map<string, { revenue: number; transactions: number }>()
    filteredTransactions.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString()
      const existing = dailyMap.get(date) || { revenue: 0, transactions: 0 }
      dailyMap.set(date, {
        revenue: existing.revenue + t.totalAmount,
        transactions: existing.transactions + 1,
      })
    })
    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        transactions: data.transactions,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
    setDailySales(dailyData)

    // Calculate top customers
    const topCustomerData = customers
      .map((c) => ({
        id: c.id,
        name: c.name,
        purchases: c.totalPurchases,
        spent: c.totalSpent,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
    setTopCustomers(topCustomerData)

    // Calculate top products
    const productSalesMap = new Map<string, { name: string; units: number; revenue: number }>()
    filteredTransactions.forEach((t) => {
      t.items.forEach((item) => {
        const existing = productSalesMap.get(item.productId)
        if (existing) {
          existing.units += item.quantity
          existing.revenue += item.subtotal
        } else {
          productSalesMap.set(item.productId, {
            name: item.productName,
            units: item.quantity,
            revenue: item.subtotal,
          })
        }
      })
    })
    const topProductData = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    setTopProducts(topProductData)
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const avgTransactionValue = transactions.length > 0 ? totalRevenue / transactions.length : 0
  const maxCategoryRevenue = categorySales.length > 0 ? Math.max(...categorySales.map((c) => c.revenue)) : 1

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-primary" />
            <h1 className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-2xl font-black tracking-wider text-transparent">
              FOOD BAZAR
            </h1>
          </div>
          <nav className="flex gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/customers" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Customers
            </Link>
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Products
            </Link>
            <Link href="/transactions" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Transactions
            </Link>
            <Link href="/reports" className="text-sm font-medium text-primary">
              Reports
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30 p-6">
        <div className="container space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
              <p className="text-muted-foreground">Comprehensive insights into your business performance</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-green-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-blue-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-purple-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                  <p className="text-2xl font-bold">₹{avgTransactionValue.toFixed(2)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-amber-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Category Sales */}
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sales by Category</h3>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {categorySales.map((category) => (
                <div key={category.category}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">
                      {category.units} units • ₹{category.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-green-500 transition-all"
                      style={{ width: `${(category.revenue / maxCategoryRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {categorySales.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">No data available</p>
              )}
            </div>
          </Card>

          {/* Daily Sales Trend */}
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Daily Sales</h3>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {dailySales.map((day) => (
                <div key={day.date} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{day.date}</p>
                    <p className="text-sm text-muted-foreground">{day.transactions} transactions</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">₹{day.revenue.toFixed(2)}</p>
                </div>
              ))}
              {dailySales.length === 0 && <p className="py-8 text-center text-muted-foreground">No data available</p>}
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Customers */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top Customers</h3>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.purchases} purchases</p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{customer.spent.toFixed(2)}</p>
                  </div>
                ))}
                {topCustomers.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">No data available</p>
                )}
              </div>
            </Card>

            {/* Top Products */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top Products</h3>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 font-semibold text-green-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{product.revenue.toFixed(2)}</p>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">No data available</p>
                )}
              </div>
            </Card>
          </div>

          {/* Summary Stats */}
          <Card className="p-6 transition-all hover:shadow-lg">
            <h3 className="mb-6 text-lg font-semibold">Business Summary</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Products in Catalog</p>
                <p className="text-3xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total inventory value: ₹{products.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Customer Base</p>
                <p className="text-3xl font-bold">{customers.length}</p>
                <p className="text-sm text-muted-foreground">
                  Avg spend per customer: ₹{(totalRevenue / customers.length || 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Product Categories</p>
                <p className="text-3xl font-bold">{new Set(products.map((p) => p.category)).size}</p>
                <p className="text-sm text-muted-foreground">Diversified product range</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
