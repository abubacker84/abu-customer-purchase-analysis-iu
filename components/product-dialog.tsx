"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { dataStore } from "@/lib/data-store"
import type { Product } from "@/lib/types"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: () => void
}

export function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    unit: "",
    supplier: "",
    description: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        unit: product.unit,
        supplier: product.supplier,
        description: product.description,
      })
    } else {
      setFormData({
        name: "",
        category: "",
        price: "",
        stock: "",
        unit: "",
        supplier: "",
        description: "",
      })
    }
  }, [product, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (product) {
      // Update existing product
      dataStore.updateProduct(product.id, {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
      })
    } else {
      // Create new product
      const newProduct: Product = {
        id: `P${String(dataStore.getProducts().length + 1).padStart(3, "0")}`,
        name: formData.name,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        unit: formData.unit,
        supplier: formData.supplier,
        description: formData.description,
      }
      dataStore.addProduct(newProduct)
    }

    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., lb, gallon, dozen"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{product ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
