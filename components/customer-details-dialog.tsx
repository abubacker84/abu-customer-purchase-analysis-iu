"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { dataStore } from "@/lib/data-store"
import type { Customer, Transaction } from "@/lib/types"
import { User, Mail, Phone, MapPin, Calendar, ShoppingCart, DollarSign } from "lucide-react"

interface CustomerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}

export function CustomerDetailsDialog({ open, onOpenChange, customer }: CustomerDetailsDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (customer) {
      const customerTransactions = dataStore.getCustomerTransactions(customer.id)
      setTransactions(customerTransactions)
    }
  }, [customer])

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{new Date(customer.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="text-2xl font-bold">{customer.totalPurchases}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-emerald-500/10 p-3">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">₹{customer.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Transaction History</h3>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="border-b pb-4 last:border-0">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transaction.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{transaction.totalAmount.toFixed(2)}</p>
                        <p className="text-sm capitalize text-muted-foreground">{transaction.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="ml-4 space-y-1">
                      {transaction.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {item.quantity}x {item.productName} - ₹{item.subtotal.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">No transactions found</p>
              )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
