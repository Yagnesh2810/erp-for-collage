import { useState, useEffect } from 'react';
import { Customer, CustomerInput } from '@/lib/api/index';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function CustomerForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isSubmitting = false
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    customerType: 'regular',
    active: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Convert the initialData Customer to CustomerInput format
      const {
        _id,
        createdAt,
        updatedAt,
        totalOrders,
        totalSpent,
        lastPurchaseDate,
        ...restData
      } = initialData;
      
      setFormData(restData as CustomerInput);
      setShowAdditionalFields(!!initialData.contactPerson || !!initialData.taxId || 
        !!initialData.creditLimit || !!initialData.paymentTerms || !!initialData.notes);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'Zip Code is required';
    }
    
    if (!formData.address.country.trim()) {
      newErrors['address.country'] = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'address') {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <label htmlFor="customerType" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Type *
              </label>
              <select
                id="customerType"
                name="customerType"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.customerType}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="regular">Regular</option>
                <option value="wholesale">Wholesale</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.active === undefined ? true : formData.active}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    active: e.target.checked,
                  }));
                }}
                disabled={isSubmitting}
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Address</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                Street *
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['address.street'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.address.street}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors['address.street'] && (
                <p className="text-red-500 text-xs mt-1">{errors['address.street']}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.address.city}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors['address.city'] && (
                <p className="text-red-500 text-xs mt-1">{errors['address.city']}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province *
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['address.state'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.address.state}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors['address.state'] && (
                <p className="text-red-500 text-xs mt-1">{errors['address.state']}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Zip/Postal Code *
              </label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['address.zipCode'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.address.zipCode}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors['address.zipCode'] && (
                <p className="text-red-500 text-xs mt-1">{errors['address.zipCode']}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['address.country'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.address.country}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors['address.country'] && (
                <p className="text-red-500 text-xs mt-1">{errors['address.country']}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <button
          type="button"
          className="text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => setShowAdditionalFields(!showAdditionalFields)}
        >
          {showAdditionalFields ? 'Hide' : 'Show'} Additional Information
        </button>
      </div>
      
      {showAdditionalFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.contactPerson || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID
                </label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.taxId || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Limit
                </label>
                <input
                  type="number"
                  id="creditLimit"
                  name="creditLimit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.creditLimit || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          
          <div>
            <div className="space-y-4">
              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  id="paymentTerms"
                  name="paymentTerms"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.paymentTerms || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.tags ? formData.tags.join(', ') : ''}
                  onChange={(e) => {
                    const tagsValue = e.target.value;
                    const tagsArray = tagsValue
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter((tag) => tag !== '');
                    
                    setFormData((prev) => ({
                      ...prev,
                      tags: tagsArray.length > 0 ? tagsArray : undefined,
                    }));
                  }}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
}