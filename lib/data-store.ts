"use client"

import type { Customer, Product, Transaction } from "./types"
import { mockCustomers, mockProducts, mockTransactions } from "./mock-data"

class DataStore {
  private customers: Customer[] = []
  private products: Product[] = []
  private transactions: Transaction[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromLocalStorage()
    }
  }

  private loadFromLocalStorage() {
    const storedCustomers = localStorage.getItem("foodbazar_customers")
    const storedProducts = localStorage.getItem("foodbazar_products")
    const storedTransactions = localStorage.getItem("foodbazar_transactions")

    this.customers = storedCustomers ? JSON.parse(storedCustomers) : mockCustomers
    this.products = storedProducts ? JSON.parse(storedProducts) : mockProducts
    this.transactions = storedTransactions ? JSON.parse(storedTransactions) : mockTransactions

    // If nothing in localStorage, save mock data
    if (!storedCustomers) this.saveCustomers()
    if (!storedProducts) this.saveProducts()
    if (!storedTransactions) this.saveTransactions()
  }

  private saveCustomers() {
    localStorage.setItem("foodbazar_customers", JSON.stringify(this.customers))
  }

  private saveProducts() {
    localStorage.setItem("foodbazar_products", JSON.stringify(this.products))
  }

  private saveTransactions() {
    localStorage.setItem("foodbazar_transactions", JSON.stringify(this.transactions))
  }

  // Customer methods
  getCustomers(): Customer[] {
    return this.customers
  }

  getCustomer(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id)
  }

  addCustomer(customer: Customer) {
    this.customers.push(customer)
    this.saveCustomers()
  }

  updateCustomer(id: string, updates: Partial<Customer>) {
    const index = this.customers.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...updates }
      this.saveCustomers()
    }
  }

  deleteCustomer(id: string) {
    this.customers = this.customers.filter((c) => c.id !== id)
    this.saveCustomers()
  }

  // Product methods
  getProducts(): Product[] {
    return this.products
  }

  getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id)
  }

  addProduct(product: Product) {
    this.products.push(product)
    this.saveProducts()
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const index = this.products.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates }
      this.saveProducts()
    }
  }

  deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id)
    this.saveProducts()
  }

  // Transaction methods
  getTransactions(): Transaction[] {
    return this.transactions
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id)
  }

  getCustomerTransactions(customerId: string): Transaction[] {
    return this.transactions.filter((t) => t.customerId === customerId)
  }

  addTransaction(transaction: Transaction) {
    this.transactions.push(transaction)
    this.saveTransactions()

    // Update customer stats
    const customer = this.getCustomer(transaction.customerId)
    if (customer) {
      this.updateCustomer(transaction.customerId, {
        totalPurchases: customer.totalPurchases + 1,
        totalSpent: customer.totalSpent + transaction.totalAmount,
      })
    }

    // Update product stock
    transaction.items.forEach((item) => {
      const product = this.getProduct(item.productId)
      if (product) {
        this.updateProduct(item.productId, {
          stock: product.stock - item.quantity,
        })
      }
    })
  }

  deleteTransaction(id: string) {
    this.transactions = this.transactions.filter((t) => t.id !== id)
    this.saveTransactions()
  }

  resetToMockData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("foodbazar_customers")
      localStorage.removeItem("foodbazar_products")
      localStorage.removeItem("foodbazar_transactions")
      this.customers = mockCustomers
      this.products = mockProducts
      this.transactions = mockTransactions
      this.saveCustomers()
      this.saveProducts()
      this.saveTransactions()
    }
  }
}

export const dataStore = new DataStore()
