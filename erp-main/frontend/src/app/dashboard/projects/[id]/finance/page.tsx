"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { ProjectFinanceNav } from "@/components/projects/ProjectFinanceNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  Calculator
} from "lucide-react";
import { getProjectById, type Project } from "@/lib/api/projectsAPI";
import { toast } from "@/components/ui/use-toast";

const ProjectFinancePage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && projectId) {
      fetchProject();
    }
  }, [isAuthenticated, projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectById(projectId);
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to access Project Finance</p>
              <Button onClick={() => router.push("/login")}>Login</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/dashboard/projects/${projectId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  Project Finance
                </h1>
                <p className="text-muted-foreground">Loading financial data...</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
          <Button onClick={() => router.push("/dashboard/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/projects/${projectId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                Project Finance
              </h1>
              <p className="text-muted-foreground">{project.name} - Financial Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Budget Calculator
            </Button>
          </div>
        </div>

        {/* Quick Finance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project Budget</p>
                  <p className="text-2xl font-bold">${project.budget?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount Spent</p>
                  <p className="text-2xl font-bold">${project.spentBudget?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.budget ? Math.round(((project.spentBudget || 0) / project.budget) * 100) : 0}% utilized
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${((project.budget || 0) - (project.spentBudget || 0)).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">available</p>
                </div>
                <Calculator className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={
                    !project.budget || !project.spentBudget ? 'bg-gray-100 text-gray-800' :
                    (project.spentBudget / project.budget) >= 0.9 ? 'bg-red-100 text-red-800' :
                    (project.spentBudget / project.budget) >= 0.75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {!project.budget || !project.spentBudget ? 'No Data' :
                     (project.spentBudget / project.budget) >= 0.9 ? 'Critical' :
                     (project.spentBudget / project.budget) >= 0.75 ? 'Warning' : 'Good'}
                  </Badge>
                </div>
                <AlertTriangle className={`h-8 w-8 ${
                  !project.budget || !project.spentBudget ? 'text-gray-600' :
                  (project.spentBudget / project.budget) >= 0.9 ? 'text-red-600' :
                  (project.spentBudget / project.budget) >= 0.75 ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Utilization Progress */}
        {project.budget && project.spentBudget && (
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Budget Usage</span>
                  <span className="text-sm text-muted-foreground">
                    ${project.spentBudget.toLocaleString()} / ${project.budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      (project.spentBudget / project.budget) >= 0.9 ? 'bg-red-500' :
                      (project.spentBudget / project.budget) >= 0.75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((project.spentBudget / project.budget) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span>{Math.round((project.spentBudget / project.budget) * 100)}% used</span>
                  <span>${project.budget.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Finance Component */}
        <div className="bg-white rounded-lg border">
          <ProjectFinanceNav />
        </div>
      </div>
    </Layout>
  );
};

export default ProjectFinancePage;