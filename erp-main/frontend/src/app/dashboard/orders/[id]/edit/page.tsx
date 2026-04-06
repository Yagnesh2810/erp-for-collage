//project\frontend\src\app\dashboard\orders\[id]\edit\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { customersAPI, productsAPI, ordersAPI, calculateOrderTotal } from '@/lib/api/index';
import Layout from '@/components/Layout';

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

interface OrderProduct {
  product: string;
  quantity: number;
  price: number;
  _id?: string;
}

const EditOrderPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    customer: '',
    products: [] as OrderProduct[],
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    paymentMethod: 'credit_card',
    status: 'pending'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch order
        const orderResponse = await ordersAPI.getById(id);
        const order = orderResponse.data;

        // Fetch customers
        const customerResponse = await customersAPI.getAll();

        // Fetch products
        const productResponse = await productsAPI.getAll();

        // Transform order data
        const transformedProducts = order.products.map((item: any) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          _id: item._id
        }));

        setFormData({
          customer: order.customer._id,
          products: transformedProducts,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          status: order.status
        });

        setCustomers(customerResponse.data);
        setProducts(productResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch required data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      const parentObj = formData[parent as keyof typeof formData];
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
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddProduct = () => {
    if (products.length === 0) return;
    
    const productId = products[0]._id;
    const product = products.find(p => p._id === productId);
    
    if (!product) return;
    
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          product: productId,
          quantity: 1,
          price: product.price
        }
      ]
    });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };

  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];
    
    if (name === 'product') {
      const product = products.find(p => p._id === value);
      if (product) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          product: value,
          price: product.price
        };
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [name]: name === 'quantity' ? parseInt(value) : parseFloat(value)
      };
    }
    
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };

  const calculateTotal = () => {
    return calculateOrderTotal(formData.products);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.products.length === 0) {
      setError('Please add at least one product');
      return;
    }
    
    if (!formData.customer) {
      setError('Please select a customer');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const orderData = {
        ...formData,
        totalAmount: calculateTotal()
      };
      
      const response = await ordersAPI.update(id, orderData);
      router.push(`/dashboard/orders/${response.data._id}`);
    } catch (err) {
      setError('Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (<Layout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div></Layout>
    );
  }

  return (<Layout>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/dashboard/orders/${id}`} className="text-blue-600 hover:text-blue-800">
          ← Back to Order
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Order</h1>
          
          {error && (
            <div className="bg-red-100 p-3 rounded-md mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Customer Information</h2>
              <div className="mb-4">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Customer
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
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="shippingAddress.street"
                    value={formData.shippingAddress.street}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="shippingAddress.city"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="shippingAddress.state"
                    value={formData.shippingAddress.state}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="shippingAddress.zipCode"
                    value={formData.shippingAddress.zipCode}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="shippingAddress.country"
                    value={formData.shippingAddress.country}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Payment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
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
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Order Items</h2>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                >
                  Add Product
                </button>
              </div>

              {formData.products.length === 0 ? (
                <p className="text-gray-500 italic mb-4">No products added yet</p>
              ) : (
                <div className="mb-4">
                  {formData.products.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">Product {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product
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
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
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
                            Price
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
                  <div className="text-right mt-4">
                    <p className="text-lg font-semibold">
                      Total: ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div></Layout>
  );
};

export default EditOrderPage;