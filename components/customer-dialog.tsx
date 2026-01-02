"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { dataStore } from "@/lib/data-store"
import type { Customer } from "@/lib/types"

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onSave: () => void
}

export function CustomerDialog({ open, onOpenChange, customer, onSave }: CustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      })
    }
  }, [customer, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (customer) {
      // Update existing customer
      dataStore.updateCustomer(customer.id, formData)
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: `C${String(dataStore.getCustomers().length + 1).padStart(3, "0")}`,
        ...formData,
        joinDate: new Date().toISOString().split("T")[0],
        totalPurchases: 0,
        totalSpent: 0,
      }
      dataStore.addCustomer(newCustomer)
    }

    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{customer ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
