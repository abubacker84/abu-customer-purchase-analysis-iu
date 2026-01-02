"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { dataStore } from "@/lib/data-store"
import type { Transaction, Product } from "@/lib/types"
import { ShoppingCart, Users, Package, DollarSign, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    revenueGrowth: 8.5,
    customerGrowth: 12.3,
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number; revenue: number }[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = () => {
    const customers = dataStore.getCustomers()
    const products = dataStore.getProducts()
    const transactions = dataStore.getTransactions()

    // Calculate stats
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0)

    setStats({
      totalCustomers: customers.length,
      totalProducts: products.length,
      totalTransactions: transactions.length,
      totalRevenue,
      revenueGrowth: 8.5,
      customerGrowth: 12.3,
    })

    // Get recent transactions
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setRecentTransactions(sorted.slice(0, 5))

    // Calculate top products
    const productSales = new Map<string, { name: string; sales: number; revenue: number }>()
    transactions.forEach((t) => {
      t.items.forEach((item) => {
        const existing = productSales.get(item.productId)
        if (existing) {
          existing.sales += item.quantity
          existing.revenue += item.subtotal
        } else {
          productSales.set(item.productId, {
            name: item.productName,
            sales: item.quantity,
            revenue: item.subtotal,
          })
        }
      })
    })
    const topProductsList = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    setTopProducts(topProductsList)

    // Get low stock products
    const lowStockProducts = products.filter((p) => p.stock < 100).slice(0, 5)
    setLowStock(lowStockProducts)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    dataStore.resetToMockData()
    setTimeout(() => {
      loadData()
      setIsRefreshing(false)
    }, 500)
  }

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
            <Link href="/" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Dashboard
            </Link>
            <Link
              href="/customers"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Customers
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Products
            </Link>
            <Link
              href="/transactions"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Transactions
            </Link>
            <Link
              href="/reports"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Reports
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-muted/20 via-accent/5 to-secondary/10 p-6">
        <div className="container space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
              <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-orange-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-600">+{stats.revenueGrowth}%</span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-orange-500/10 p-3">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-blue-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">+{stats.customerGrowth}%</span>
                    <span className="text-muted-foreground">new customers</span>
                  </div>
                </div>
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-purple-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Across all categories</span>
                  </div>
                </div>
                <div className="rounded-full bg-purple-500/10 p-3">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-green-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Completed orders</span>
                  </div>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Transactions */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{transaction.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{transaction.totalAmount.toFixed(2)}</p>
                      <p className="text-sm capitalize text-muted-foreground">{transaction.paymentMethod}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Products */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top Selling Products</h3>
                <Link href="/reports" className="text-sm font-medium text-primary hover:underline">
                  View report
                </Link>
              </div>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{product.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Low Stock Alert */}
            <Card className="p-6 transition-all hover:shadow-lg lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Low Stock Alert</h3>
                <Link href="/products" className="text-sm font-medium text-primary hover:underline">
                  Manage inventory
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {lowStock.map((product) => (
                  <div key={product.id} className="rounded-lg border bg-card p-4 transition-all hover:shadow-md">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${Math.min((product.stock / 200) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{product.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
