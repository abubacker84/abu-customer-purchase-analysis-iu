"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dataStore } from "@/lib/data-store"
import type { Transaction } from "@/lib/types"
import { ShoppingCart, Search, Plus, Eye, DollarSign, CreditCard, Smartphone } from "lucide-react"
import Link from "next/link"
import { TransactionDialog } from "@/components/transaction-dialog"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    let filtered = transactions

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.customerId.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((t) => t.paymentMethod === paymentFilter)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)
  }, [searchQuery, paymentFilter, transactions])

  const loadTransactions = () => {
    const data = dataStore.getTransactions()
    setTransactions(data)
    setFilteredTransactions(data)
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsOpen(true)
  }

  const handleSave = () => {
    loadTransactions()
    setIsDialogOpen(false)
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const cashTransactions = transactions.filter((t) => t.paymentMethod === "cash").length
  const cardTransactions = transactions.filter((t) => t.paymentMethod === "card").length
  const mobileTransactions = transactions.filter((t) => t.paymentMethod === "mobile").length

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <DollarSign className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      default:
        return null
    }
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
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/customers" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Customers
            </Link>
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Products
            </Link>
            <Link href="/transactions" className="text-sm font-medium text-primary">
              Transactions
            </Link>
            <Link href="/reports" className="text-sm font-medium text-muted-foreground hover:text-foreground">
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
              <h2 className="text-3xl font-bold tracking-tight">Transaction Management</h2>
              <p className="text-muted-foreground">View and create customer transactions</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-green-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
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
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cash</p>
                  <p className="text-2xl font-bold">{cashTransactions}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-purple-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Card</p>
                  <p className="text-2xl font-bold">{cardTransactions}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-amber-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Smartphone className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                  <p className="text-2xl font-bold">{mobileTransactions}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID, customer name, or customer ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Transaction ID</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date & Time</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Items</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Payment</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">{transaction.id}</td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-medium">{transaction.customerName}</p>
                          <p className="text-xs text-muted-foreground">{transaction.customerId}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleString()}
                      </td>
                      <td className="py-4 text-sm">{transaction.items.length} items</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(transaction.paymentMethod)}
                          <span className="text-sm capitalize">{transaction.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-sm font-semibold">₹{transaction.totalAmount.toFixed(2)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : transaction.status === "pending"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(transaction)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || paymentFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by creating your first transaction"}
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>

      <TransactionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSave} />

      <TransactionDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        transaction={selectedTransaction}
      />
    </div>
  )
}
