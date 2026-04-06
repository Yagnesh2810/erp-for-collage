"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Users, Clock, BarChart3, RefreshCw } from "lucide-react";
import { useTaskStats } from "@/hooks/useTaskStats";

const TaskManagerTab = () => {
  const router = useRouter();
  const { stats: taskStats, loading, refetch: fetchTaskStats } = useTaskStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Task Management Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => router.push("/dashboard/projects/tasks")}>
              <CardContent className="p-6 text-center">
                <CheckSquare className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Tasks</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View and manage all project tasks in one place
                </p>
                <Button variant="outline" className="w-full">
                  Manage Tasks
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push("/dashboard/projects/tasks")}>
              <CardContent className="p-6 text-center">
                <Plus className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Create Task</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create new tasks and assign them to team members
                </p>
                <Button variant="outline" className="w-full">
                  New Task
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push("/dashboard/projects/tasks")}>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Team Tasks</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Monitor team progress and task assignments
                </p>
                <Button variant="outline" className="w-full">
                  View Team Tasks
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/projects/tasks")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Task
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/projects/tasks")}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  View Kanban Board
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/projects/tasks")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Task Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Task Overview</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchTaskStats}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Tasks</span>
                      <span className="font-semibold">{taskStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">To Do</span>
                      <span className="font-semibold text-gray-600">{taskStats.todo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">In Progress</span>
                      <span className="font-semibold text-blue-600">{taskStats.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-semibold text-green-600">{taskStats.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Overdue</span>
                      <span className="font-semibold text-red-600">{taskStats.overdue}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Completion Rate</span>
                        <span>{taskStats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${taskStats.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <Button 
                  className="w-full mt-4"
                  onClick={() => router.push("/dashboard/projects/tasks")}
                >
                  View Full Task Manager
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManagerTab;