"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dataStore } from "@/lib/data-store"
import type { Product } from "@/lib/types"
import { Package, Search, Plus, Edit, Trash2, ShoppingCart, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ProductDialog } from "@/components/product-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplier.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, categoryFilter, products])

  const loadProducts = () => {
    const data = dataStore.getProducts()
    setProducts(data)
    setFilteredProducts(data)

    // Extract unique categories
    const uniqueCategories = Array.from(new Set(data.map((p) => p.category)))
    setCategories(uniqueCategories)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      dataStore.deleteProduct(id)
      loadProducts()
    }
  }

  const handleSave = () => {
    loadProducts()
    setIsDialogOpen(false)
    setSelectedProduct(null)
  }

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const lowStockCount = products.filter((p) => p.stock < 100).length

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
            <Link href="/products" className="text-sm font-medium text-primary">
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
              <h2 className="text-3xl font-bold tracking-tight">Product Management</h2>
              <p className="text-muted-foreground">Manage your inventory and product catalog</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-green-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-emerald-500/10 p-3">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Stock</p>
                  <p className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-amber-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                  <p className="text-2xl font-bold">₹{totalValue.toFixed(2)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-red-500 p-6 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-red-500/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">{lowStockCount}</p>
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
                  placeholder="Search by name, category, ID, or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Product Name</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Supplier</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Price</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Value</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">{product.id}</td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.unit}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm">{product.category}</td>
                      <td className="py-4 text-sm text-muted-foreground">{product.supplier}</td>
                      <td className="py-4 text-right text-sm font-medium">₹{product.price.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            product.stock < 100 ? "text-red-600" : product.stock < 150 ? "text-amber-600" : ""
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 text-right text-sm font-medium">
                        ₹{(product.price * product.stock).toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by adding your first product"}
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>

      <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} product={selectedProduct} onSave={handleSave} />
    </div>
  )
}
