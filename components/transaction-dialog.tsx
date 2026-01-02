"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dataStore } from "@/lib/data-store"
import type { Customer, Product, Transaction, TransactionItem } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function TransactionDialog({ open, onOpenChange, onSave }: TransactionDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash")
  const [items, setItems] = useState<TransactionItem[]>([])

  useEffect(() => {
    if (open) {
      setCustomers(dataStore.getCustomers())
      setProducts(dataStore.getProducts())
      setSelectedCustomerId("")
      setPaymentMethod("cash")
      setItems([])
    }
  }, [open])

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        quantity: 1,
        price: 0,
        subtotal: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      const newItems = [...items]
      newItems[index] = {
        productId: product.id,
        productName: product.name,
        quantity: newItems[index].quantity || 1,
        price: product.price,
        subtotal: product.price * (newItems[index].quantity || 1),
      }
      setItems(newItems)
    }
  }

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...items]
    newItems[index].quantity = quantity
    newItems[index].subtotal = newItems[index].price * quantity
    setItems(newItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomerId || items.length === 0) {
      alert("Please select a customer and add at least one item")
      return
    }

    // Validate all items have products selected
    if (items.some((item) => !item.productId)) {
      alert("Please select a product for all items")
      return
    }

    const customer = customers.find((c) => c.id === selectedCustomerId)
    if (!customer) return

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)

    const newTransaction: Transaction = {
      id: `T${String(dataStore.getTransactions().length + 1).padStart(3, "0")}`,
      customerId: selectedCustomerId,
      customerName: customer.name,
      date: new Date().toISOString(),
      items,
      totalAmount,
      paymentMethod,
      status: "completed",
    }

    dataStore.addTransaction(newTransaction)
    onSave()
  }

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} required>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} required>
                <SelectTrigger id="payment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 rounded-lg border p-3">
                    <div className="flex-1">
                      <Select value={item.productId} onValueChange={(v) => updateItem(index, v)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ₹{product.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, Number.parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                        required
                      />
                    </div>
                    <div className="w-28 flex items-center justify-end font-medium">₹{item.subtotal.toFixed(2)}</div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No items added yet. Click "Add Item" to start.
              </div>
            )}

            {items.length > 0 && (
              <div className="flex justify-end border-t pt-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Transaction</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
