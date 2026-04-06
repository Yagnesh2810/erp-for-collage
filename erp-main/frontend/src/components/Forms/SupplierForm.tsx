//path: frontend/src/components/Forms/SupplierForm.tsx
import React, { useState, useEffect } from 'react';
import { Supplier, SupplierInput } from '@/lib/api/index';

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (data: SupplierInput) => Promise<void>;
  isSubmitting: boolean;
}

const SupplierForm = ({ initialData, onSubmit, isSubmitting }: SupplierFormProps) => {
  const [formData, setFormData] = useState<SupplierInput>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
        contactPerson: initialData.contactPerson,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm font-medium text-foreground mb-1">
            Supplier Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`border rounded-md p-2 bg-background text-foreground ${errors.name ? 'border-red-500' : 'border-input'}`}
          />
          {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        
        {/* Email Field */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-foreground mb-1">
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`border rounded-md p-2 bg-background text-foreground ${errors.email ? 'border-red-500' : 'border-input'}`}
          />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        
        {/* Phone Field */}
        <div className="flex flex-col">
          <label htmlFor="phone" className="text-sm font-medium text-foreground mb-1">
            Phone Number*
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`border rounded-md p-2 bg-background text-foreground ${errors.phone ? 'border-red-500' : 'border-input'}`}
          />
          {errors.phone && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
        
        {/* Contact Person Field */}
        <div className="flex flex-col">
          <label htmlFor="contactPerson" className="text-sm font-medium text-foreground mb-1">
            Contact Person*
          </label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            className={`border rounded-md p-2 bg-background text-foreground ${errors.contactPerson ? 'border-red-500' : 'border-input'}`}
          />
          {errors.contactPerson && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.contactPerson}</p>}
        </div>
      </div>
      
      {/* Address Field */}
      <div className="flex flex-col">
        <label htmlFor="address" className="text-sm font-medium text-foreground mb-1">
          Address*
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`border rounded-md p-2 bg-background text-foreground ${errors.address ? 'border-red-500' : 'border-input'}`}
        />
        {errors.address && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.address}</p>}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Supplier' : 'Create Supplier'}
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;