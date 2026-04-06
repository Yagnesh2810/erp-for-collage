"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import employeeAPI from '@/lib/api/employeeAPI';

export default function DebugCreateEmployeePage() {
  const { user, isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicEmployee = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult("🔍 Starting employee creation test...");
      
      // Check authentication
      addResult(`✅ User authenticated: ${user?.name} (${user?.role})`);
      addResult(`✅ Token exists: ${token ? 'Yes' : 'No'}`);
      
      // Test minimal employee data
      const minimalEmployee = {
        firstName: "Test",
        lastName: "Employee",
        email: `test.employee.${Date.now()}@company.com`,
        phone: "1234567890",
        department: "IT",
        position: "Developer",
        salary: 50000,
        hireDate: "2024-01-01",
        status: "active"
      };
      
      addResult("📝 Prepared minimal employee data");
      addResult(`📧 Email: ${minimalEmployee.email}`);
      
      // Make API call
      addResult("🚀 Making API call...");
      const response = await employeeAPI.create(minimalEmployee);
      
      addResult("✅ Employee created successfully!");
      addResult(`👤 Employee ID: ${response.employee?.employeeId}`);
      addResult(`📧 Email: ${response.employee?.email}`);
      
      if (response.userCreated) {
        addResult("✅ User account also created");
      }
      
      toast({
        title: "Success!",
        description: "Test employee created successfully",
      });
      
    } catch (error: any) {
      addResult("❌ Error occurred:");
      addResult(`Status: ${error?.response?.status || 'Unknown'}`);
      addResult(`Message: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
      
      if (error?.response?.data) {
        addResult(`Full error: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Test failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAPIConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult("🔍 Testing API connection...");
      
      // Test basic API health
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      
      if (data.success) {
        addResult("✅ Backend API is healthy");
      } else {
        addResult("❌ Backend API health check failed");
      }
      
      // Test authenticated endpoint
      addResult("🔐 Testing authenticated endpoint...");
      const employeesResponse = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (employeesResponse.ok) {
        const employees = await employeesResponse.json();
        addResult(`✅ Can access employees endpoint (${employees.length} employees found)`);
      } else {
        const errorData = await employeesResponse.json();
        addResult(`❌ Cannot access employees endpoint: ${errorData.message}`);
      }
      
    } catch (error: any) {
      addResult(`❌ Connection test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground">Please log in to test employee creation</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Creation Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={testAPIConnection} 
                disabled={loading}
                variant="outline"
              >
                Test API Connection
              </Button>
              
              <Button 
                onClick={testBasicEmployee} 
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Employee Creation'}
              </Button>
            </div>
            
            <div className="mt-6">
              <Label>User Info:</Label>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>Name: {user?.name}</p>
                <p>Email: {user?.email}</p>
                <p>Role: {user?.role}</p>
                <p>Token: {token ? 'Present' : 'Missing'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}