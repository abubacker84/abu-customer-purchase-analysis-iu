"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dataStore } from "@/lib/data-store"
import type { Customer } from "@/lib/types"
import { Users, Search, Plus, Edit, Trash2, Eye, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { CustomerDialog } from "@/components/customer-dialog"
import { CustomerDetailsDialog } from "@/components/customer-details-dialog"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const loadCustomers = () => {
    const data = dataStore.getCustomers()
    setCustomers(data)
    setFilteredCustomers(data)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      dataStore.deleteCustomer(id)
      loadCustomers()
    }
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsOpen(true)
  }

  const handleSave = () => {
    loadCustomers()
    setIsDialogOpen(false)
    setSelectedCustomer(null)
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
            <Link href="/customers" className="text-sm font-medium text-primary">
              Customers
            </Link>
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Products
            </Link>
            <Link href="/transactions" className="text-sm font-medium text-muted-foreground hover:text-foreground">
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
              <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
              <p className="text-muted-foreground">Manage your customer database and view purchase history</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-green-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                  <p className="text-2xl font-bold">{customers.reduce((sum, c) => sum + c.totalPurchases, 0)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-orange-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-orange-500/10 p-3">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Table */}
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Phone</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Join Date</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Purchases</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Total Spent</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">{customer.id}</td>
                      <td className="py-4 text-sm">{customer.name}</td>
                      <td className="py-4 text-sm text-muted-foreground">{customer.email}</td>
                      <td className="py-4 text-sm text-muted-foreground">{customer.phone}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(customer.joinDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right text-sm font-medium">{customer.totalPurchases}</td>
                      <td className="py-4 text-right text-sm font-medium">₹{customer.totalSpent.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(customer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No customers found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try a different search query" : "Get started by adding your first customer"}
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
        onSave={handleSave}
      />

      <CustomerDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} customer={selectedCustomer} />
    </div>
  )
}
