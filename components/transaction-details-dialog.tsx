"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { Calendar, User, CreditCard, Package, DollarSign } from "lucide-react"

interface TransactionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function TransactionDetailsDialog({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) {
  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Info */}
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-medium">{transaction.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{transaction.customerName}</p>
                  <p className="text-sm text-muted-foreground">{transaction.customerId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{new Date(transaction.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{transaction.paymentMethod}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Items */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Items Purchased</h3>
            <div className="space-y-3">
              {transaction.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">₹{item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Total */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/10 p-3">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">₹{transaction.totalAmount.toFixed(2)}</p>
                </div>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  transaction.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : transaction.status === "pending"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-red-500/10 text-red-600"
                }`}
              >
                {transaction.status}
              </span>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
