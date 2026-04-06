'use client';

import React, { useState, useEffect } from 'react';

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

interface OrderFormData {
  customer: string;
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
}

interface OrderFormProps {
  initialData?: OrderFormData;
  customers: Customer[];
  products: Product[];
  onSubmit: (formData: OrderFormData & { totalAmount: number }) => Promise<void>;
  submitButtonText: string;
  loading: boolean;
  error: string | null;
}

const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  customers,
  products,
  onSubmit,
  submitButtonText,
  loading,
  error
}) => {
  const [formData, setFormData] = useState<OrderFormData>(
    initialData || {
      customer: '',
      products: [],
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      paymentMethod: 'credit_card',
      status: 'pending'
    }
  );
  
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
    return formData.products.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.products.length === 0) {
      setFormError('Please add at least one product');
      return;
    }
    
    if (!formData.customer) {
      setFormError('Please select a customer');
      return;
    }
    
    setFormError(null);
    
    await onSubmit({
      ...formData,
      totalAmount: calculateTotal()
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {(error || formError) && (
        <div className="bg-red-100 p-3 rounded-md mb-6">
          <p className="text-red-800">{error || formError}</p>
        </div>
      )}
      
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
          disabled={loading}
        >
          {loading ? 'Processing...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default OrderForm;