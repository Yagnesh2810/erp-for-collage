'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import API utilities
import { 
  customersAPI, 
  productsAPI, 
  ordersAPI, 
  employeesAPI, 
  inventoryAPI, 
  calculateOrderTotal
} from '@/lib/api/index';

// Import UI components
import Layout from '@/components/Layout';
import NotificationSystem from '@/components/NotificationSystem';
import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Type definitions
interface Customer {
  _id: string;
  name: string;
  email: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  creditStatus?: string;
  active: boolean;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  sku: string;
  category: string;
  stockQuantity?: number;
}

interface InventoryItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  location: string;
  status: string;
}

interface Employee {
  _id: string;
  name: string;
  department: string;
  role: string;
}

interface OrderProduct {
  product: string;
  quantity: number;
  price: number;
}

interface OrderFormData {
  customer: string;
  salesRepId: string;
  products: OrderProduct[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  status: string;
  notes?: string;
}

const CreateOrderPage = () => {
  const router = useRouter();
  
  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [validating, setValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('customer');
  
  // Form state
  const [formData, setFormData] = useState<OrderFormData>({
    customer: '',
    salesRepId: '',
    products: [],
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    paymentMethod: 'credit_card',
    status: 'pending',
    notes: ''
  });

  // Track available inventory for each product
  const [inventoryMap, setInventoryMap] = useState<Record<string, number>>({});

  // Calculate order total - memoized to prevent unnecessary recalculation
  const orderTotal = useMemo(() => {
    return formData.products.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }, [formData.products]);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel for better performance
        const [
          customerResponse, 
          productResponse, 
          inventoryResponse, 
          employeeResponse
        ] = await Promise.all([
          customersAPI.getAll(),
          productsAPI.getAll(),
          inventoryAPI.getAll(),
          employeesAPI.getAll()
        ]);
        
        // Set state with fetched data
        setCustomers(customerResponse.data || []);
        setProducts(productResponse.data || []);
        setInventory(inventoryResponse.data || []);
        
        // Filter for only sales department employees
        const salesReps = (employeeResponse.data || []).filter(
          (emp: Employee) => emp.department === 'sales'
        );
        setEmployees(salesReps);
        
        // Create inventory map for quick lookup
        const invMap: Record<string, number> = {};
        (inventoryResponse.data || []).forEach((item: InventoryItem) => {
          const productId = item.productId._id;
          if (!invMap[productId]) {
            invMap[productId] = 0;
          }
          invMap[productId] += item.quantity;
        });
        setInventoryMap(invMap);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch required data. Please try refreshing the page.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle general form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like shippingAddress.street
      const [parent, child] = name.split('.');
      const parentObj = formData[parent as keyof OrderFormData];
      
      if (typeof parentObj === 'object' && parentObj !== null) {
        setFormData({
          ...formData,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        });
      }
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: value
      });
      
      // If customer changed, try to auto-fill shipping address
      if (name === 'customer' && value) {
        const selectedCustomer = customers.find(c => c._id === value);
        if (selectedCustomer) {
          // Auto-fill shipping address if available
          if (selectedCustomer.address) {
            setFormData(prev => ({
              ...prev,
              shippingAddress: {
                street: selectedCustomer.address?.street || '',
                city: selectedCustomer.address?.city || '',
                state: selectedCustomer.address?.state || '',
                zipCode: selectedCustomer.address?.zipCode || '',
                country: selectedCustomer.address?.country || ''
              }
            }));
          }
          
          // Validate customer credit status
          validateCustomer(selectedCustomer);
        }
      }
    }
  };

  // Add a product to the order
  const handleAddProduct = () => {
    if (products.length === 0) return;
    
    // Default to first product in the list
    const productId = products[0]._id;
    const product = products.find(p => p._id === productId);
    
    if (!product) return;
    
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          product: productId,
          quantity: 1,
          price: product.price
        }
      ]
    }));
    
    // Validate inventory after adding product
    setTimeout(() => validateInventory(), 100);
  };

  // Remove a product from the order
  const handleRemoveProduct = (index: number) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts.splice(index, 1);
      
      return {
        ...prev,
        products: updatedProducts
      };
    });
    
    // Revalidate inventory after removing product
    setTimeout(() => validateInventory(), 100);
  };

  // Handle product selection or quantity change
  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      
      if (name === 'product') {
        // If product changed, update price as well
        const product = products.find(p => p._id === value);
        if (product) {
          updatedProducts[index] = {
            ...updatedProducts[index],
            product: value,
            price: product.price
          };
        }
      } else {
        // Otherwise just update the specific field
        updatedProducts[index] = {
          ...updatedProducts[index],
          [name]: name === 'quantity' ? parseInt(value) : parseFloat(value)
        };
      }
      
      return {
        ...prev,
        products: updatedProducts
      };
    });
    
    // Validate inventory when product or quantity changes
    setTimeout(() => validateInventory(), 100);
  };

  // Validate customer credit status
  const validateCustomer = (customer: Customer) => {
    const newWarnings: string[] = [];
    
    if (!customer.active) {
      newWarnings.push("Customer account is inactive. Please check with the sales manager.");
    }
    
    if (customer.creditStatus === 'hold') {
      newWarnings.push("Customer credit is on hold. Approval required before proceeding.");
    } else if (customer.creditStatus === 'review') {
      newWarnings.push("Customer credit needs review. Proceed with caution.");
    }
    
    setWarnings(prevWarnings => {
      // Remove any previous customer warnings
      const filteredWarnings = prevWarnings.filter(w => 
        !w.includes('Customer account') && 
        !w.includes('credit')
      );
      
      return [...filteredWarnings, ...newWarnings];
    });
  };

  // Validate inventory for all products in order
  const validateInventory = () => {
    setValidating(true);
    
    // Remove previous inventory warnings
    setWarnings(prevWarnings => {
      return prevWarnings.filter(w => 
        !w.includes('stock') && 
        !w.includes('inventory')
      );
    });
    
    const newWarnings: string[] = [];
    
    // Check each product in the order
    formData.products.forEach(item => {
      const availableQuantity = inventoryMap[item.product] || 0;
      const product = products.find(p => p._id === item.product);
      const productName = product ? product.name : 'Product';
      
      if (availableQuantity < item.quantity) {
        newWarnings.push(
          `Insufficient stock for ${productName}. Available: ${availableQuantity}, Requested: ${item.quantity}`
        );
      } else if (availableQuantity <= item.quantity * 1.2) {
        // Warning if stock will be low after order (within 20% of order quantity)
        newWarnings.push(
          `Stock for ${productName} will be low after this order. Consider reordering.`
        );
      }
    });
    
    // Add new warnings
    if (newWarnings.length > 0) {
      setWarnings(prev => [...prev, ...newWarnings]);
    }
    
    setValidating(false);
    
    // Return true if no critical inventory issues (insufficient stock)
    return !newWarnings.some(warning => warning.includes('Insufficient stock'));
  };
  
  // Validate shipping address
  const validateShippingAddress = () => {
    const { street, city, state, zipCode, country } = formData.shippingAddress;
    
    if (!street || !city || !state || !zipCode || !country) {
      setError('Please complete all shipping address fields');
      return false;
    }
    
    return true;
  };

  // Navigate to next tab with validation
  const nextTab = () => {
    if (activeTab === 'customer') {
      if (!formData.customer) {
        setError('Please select a customer');
        return;
      }
      setActiveTab('shipping');
    } else if (activeTab === 'shipping') {
      if (!validateShippingAddress()) {
        return;
      }
      setActiveTab('products');
    } else if (activeTab === 'products') {
      if (formData.products.length === 0) {
        setError('Please add at least one product');
        return;
      }
      
      // Check for inventory warnings
      const hasInventoryErrors = warnings.some(warning => 
        warning.includes('Insufficient stock')
      );
      
      if (hasInventoryErrors) {
        setError('Please resolve inventory issues before proceeding');
        return;
      }
      
      setActiveTab('payment');
    }
    
    setError(null);
  };

  // Go back to previous tab
  const prevTab = () => {
    if (activeTab === 'shipping') {
      setActiveTab('customer');
    } else if (activeTab === 'products') {
      setActiveTab('shipping');
    } else if (activeTab === 'payment') {
      setActiveTab('products');
    }
    
    setError(null);
  };

  // Submit the order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (formData.products.length === 0) {
      setError('Please add at least one product');
      return;
    }
    
    if (!formData.customer) {
      setError('Please select a customer');
      return;
    }
    
    // Final validation of inventory
    const inventoryValid = validateInventory();
    
    if (!inventoryValid) {
      setError('Order cannot be submitted due to inventory issues');
      return;
    }
    
    // Proceed with order creation
    setSubmitting(true);
    setError(null);
    
    try {
      const orderData = {
        ...formData,
        totalAmount: orderTotal
      };
      
      const response = await ordersAPI.create(orderData);
      
      toast.success(`Order ${response.data.orderNumber} created successfully!`);
      router.push(`/dashboard/orders/${response.data._id}`);
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to create order');
      toast.error('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading spinner when data is being fetched
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
          <span className="ml-2 text-gray-600">Loading order form...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </Link>
          
          {/* Notification system at the top right */}
          <div className="flex items-center">
            <NotificationSystem isAuthenticated={true} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
            <CardDescription>Complete all required information to process the order</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Attention needed</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="payment">Payment & Review</TabsTrigger>
                </TabsList>
                {/* Customer Information Tab */}
                <TabsContent value="customer">
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                          Select Customer <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="customer"
                          name="customer"
                          value={formData.customer}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Select a customer</option>
                          {customers.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.name} ({customer.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="salesRepId" className="block text-sm font-medium text-gray-700 mb-1">
                          Sales Representative
                        </label>
                        <select
                          id="salesRepId"
                          name="salesRepId"
                          value={formData.salesRepId}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select a sales representative</option>
                          {employees.map((employee) => (
                            <option key={employee._id} value={employee._id}>
                              {employee.name} ({employee.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Order Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Enter any special instructions or notes for this order"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button type="button" onClick={nextTab}>
                        Next: Shipping
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                {/* Products Tab */}
                <TabsContent value="products">
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold">Order Items</h3>
                      <Button 
                        type="button" 
                        onClick={handleAddProduct}
                        variant="secondary"
                      >
                        Add Product
                      </Button>
                    </div>

                    {formData.products.length === 0 ? (
                      <div className="border border-dashed border-gray-300 rounded-md p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No products added yet</p>
                        <Button 
                          type="button" 
                          onClick={handleAddProduct}
                          variant="outline"
                          className="mt-3"
                        >
                          Add Your First Product
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-4 space-y-4">
                        {formData.products.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-md p-4 transition-all hover:shadow-sm">
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">Product {index + 1}</h3>
                              <Button
                                type="button"
                                onClick={() => handleRemoveProduct(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Product <span className="text-red-500">*</span>
                                </label>
                                <select
                                  name="product"
                                  value={item.product}
                                  onChange={(e) => handleProductChange(index, e)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  required
                                >
                                  {products.map((product) => (
                                    <option key={product._id} value={product._id}>
                                      {product.name} (${product.price.toFixed(2)})
                                    </option>
                                  ))}
                                </select>
                                
                                {/* Display available inventory */}
                                {item.product && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Available stock: {inventoryMap[item.product] || 0}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  name="quantity"
                                  value={item.quantity}
                                  onChange={(e) => handleProductChange(index, e)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  min="1"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Price <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  name="price"
                                  value={item.price}
                                  onChange={(e) => handleProductChange(index, e)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  step="0.01"
                                  min="0"
                                  required
                                />
                              </div>
                            </div>
                            <div className="mt-2 text-right">
                              <p className="text-gray-700">
                                Subtotal: ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {formData.products.length > 0 && (
                          <div className="text-right mt-4 p-4 border-t border-gray-200">
                            <p className="text-lg font-semibold">
                              Total: ${orderTotal.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-4">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Back: Shipping
                      </Button>
                      <Button type="button" onClick={nextTab}>
                        Next: Payment
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                {/* Payment and Review Tab */}
                <TabsContent value="payment">
                  <div className="space-y-4 py-4">
                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash_on_delivery">Cash on Delivery</option>
                      </select>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Customer</h4>
                            <p className="text-sm text-gray-900">
                              {customers.find(c => c._id === formData.customer)?.name || '-'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Sales Representative</h4>
                            <p className="text-sm text-gray-900">
                              {employees.find(e => e._id === formData.salesRepId)?.name || 'None assigned'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Shipping Address</h4>
                            <p className="text-sm text-gray-900">
                              {formData.shippingAddress.street}, {formData.shippingAddress.city}, {formData.shippingAddress.state}, {formData.shippingAddress.zipCode}, {formData.shippingAddress.country}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Payment Method</h4>
                            <p className="text-sm text-gray-900">
                              {formData.paymentMethod.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                          </div>
                        </div>
                        
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Products</h4>
                        <div className="border rounded-md mb-4 overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Product
                                </th>
                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subtotal
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {formData.products.map((item, index) => {
                                const product = products.find(p => p._id === item.product);
                                return (
                                  <tr key={index}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {product?.name || 'Unknown product'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                      {item.quantity}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                      ${item.price.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                      ${(item.quantity * item.price).toFixed(2)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-50">
                                <td colSpan={3} className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  Total:
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  ${orderTotal.toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    {/* Warnings and submission button */}
                    {warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mt-4">
                        <p className="text-sm text-yellow-800 font-medium mb-2">
                          Please resolve these issues before submitting:
                        </p>
                        <ul className="list-disc pl-5 text-sm text-yellow-700">
                          {warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-4">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Back: Products
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitting || validating || (warnings.length > 0 && warnings.some(w => w.includes('Insufficient')))}
                        className={`${
                          submitting || validating || (warnings.length > 0 && warnings.some(w => w.includes('Insufficient')))
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </>
                        ) : 'Create Order'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Toast container for notifications */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Layout>
  );
};

export default CreateOrderPage;