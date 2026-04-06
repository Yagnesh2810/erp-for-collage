"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  GitCommit,
  Filter
} from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

interface TimelineEvent {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'file_uploaded' | 'project_updated';
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  timestamp: string;
  metadata?: {
    taskId?: string;
    taskTitle?: string;
    oldStatus?: string;
    newStatus?: string;
    fileName?: string;
    commentText?: string;
  };
}

interface ProjectTimelineProps {
  projectId: string;
  tasks?: any[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId, tasks = [] }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateTimelineEvents();
  }, [projectId, tasks]);

  useEffect(() => {
    filterEvents();
  }, [events, selectedFilter]);

  const generateTimelineEvents = () => {
    // Generate mock timeline events based on tasks and project activities
    const mockEvents: TimelineEvent[] = [
      {
        id: '1',
        type: 'project_updated',
        title: 'Project Created',
        description: 'Project was initialized and team members were assigned',
        user: {
          id: 'user1',
          name: 'John Manager',
          avatar: '',
          role: 'Project Manager'
        },
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'task_created',
        title: 'New Task Created',
        description: 'Setup development environment',
        user: {
          id: 'user2',
          name: 'Sarah Developer',
          avatar: '',
          role: 'Developer'
        },
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          taskTitle: 'Setup development environment'
        }
      },
      {
        id: '3',
        type: 'comment_added',
        title: 'Comment Added',
        description: 'Added clarification on requirements',
        user: {
          id: 'user3',
          name: 'Mike Analyst',
          avatar: '',
          role: 'Business Analyst'
        },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          commentText: 'Need to clarify the authentication requirements'
        }
      },
      {
        id: '4',
        type: 'task_updated',
        title: 'Task Status Updated',
        description: 'Moved task from "To Do" to "In Progress"',
        user: {
          id: 'user2',
          name: 'Sarah Developer',
          avatar: '',
          role: 'Developer'
        },
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          taskTitle: 'Setup development environment',
          oldStatus: 'todo',
          newStatus: 'in-progress'
        }
      },
      {
        id: '5',
        type: 'file_uploaded',
        title: 'File Uploaded',
        description: 'Uploaded project documentation',
        user: {
          id: 'user4',
          name: 'Lisa Designer',
          avatar: '',
          role: 'UI/UX Designer'
        },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          fileName: 'project-wireframes.pdf'
        }
      },
      {
        id: '6',
        type: 'task_completed',
        title: 'Task Completed',
        description: 'Successfully completed development environment setup',
        user: {
          id: 'user2',
          name: 'Sarah Developer',
          avatar: '',
          role: 'Developer'
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          taskTitle: 'Setup development environment'
        }
      },
      {
        id: '7',
        type: 'task_created',
        title: 'New Task Created',
        description: 'Implement user authentication',
        user: {
          id: 'user1',
          name: 'John Manager',
          avatar: '',
          role: 'Project Manager'
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          taskTitle: 'Implement user authentication'
        }
      },
      {
        id: '8',
        type: 'comment_added',
        title: 'Comment Added',
        description: 'Great progress on the setup!',
        user: {
          id: 'user1',
          name: 'John Manager',
          avatar: '',
          role: 'Project Manager'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: {
          commentText: 'Great progress on the setup! Ready for next phase.'
        }
      }
    ];

    // Add events from actual tasks if available
    tasks.forEach(task => {
      mockEvents.push({
        id: `task-${task._id}`,
        type: 'task_created',
        title: 'Task Created',
        description: task.title,
        user: {
          id: 'current-user',
          name: 'Current User',
          avatar: '',
          role: 'Team Member'
        },
        timestamp: task.createdAt || new Date().toISOString(),
        metadata: {
          taskId: task._id,
          taskTitle: task.title
        }
      });
    });

    // Sort events by timestamp (newest first)
    mockEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setEvents(mockEvents);
    setLoading(false);
  };

  const filterEvents = () => {
    if (selectedFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.type === selectedFilter));
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
        return <FileText className="h-4 w-4" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'file_uploaded':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'project_updated':
        return <GitCommit className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'border-green-200 bg-green-50';
      case 'comment_added':
        return 'border-blue-200 bg-blue-50';
      case 'file_uploaded':
        return 'border-purple-200 bg-purple-50';
      case 'project_updated':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, yyyy HH:mm');
    }
  };

  const getFilterOptions = () => [
    { value: 'all', label: 'All Activities', count: events.length },
    { value: 'task_created', label: 'Tasks Created', count: events.filter(e => e.type === 'task_created').length },
    { value: 'task_completed', label: 'Tasks Completed', count: events.filter(e => e.type === 'task_completed').length },
    { value: 'comment_added', label: 'Comments', count: events.filter(e => e.type === 'comment_added').length },
    { value: 'file_uploaded', label: 'Files', count: events.filter(e => e.type === 'file_uploaded').length },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
            {getFilterOptions().map((option) => (
              <Button
                key={option.value}
                variant={selectedFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(option.value)}
                className="text-xs"
              >
                {option.label} ({option.count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline ({filteredEvents.length} activities)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Activities</h3>
              <p className="text-muted-foreground">
                {selectedFilter === 'all' 
                  ? 'No project activities yet' 
                  : `No ${selectedFilter.replace('_', ' ')} activities found`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {index < filteredEvents.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                  )}
                  
                  {/* Event card */}
                  <div className={`flex gap-4 p-4 rounded-lg border ${getEventColor(event.type)}`}>
                    {/* Avatar and icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={event.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {event.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border">
                          {getEventIcon(event.type)}
                        </div>
                      </div>
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{event.user.name}</span>
                            {event.user.role && (
                              <Badge variant="secondary" className="text-xs">
                                {event.user.role}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          
                          {/* Metadata */}
                          {event.metadata && (
                            <div className="space-y-1">
                              {event.metadata.taskTitle && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  <span>Task: {event.metadata.taskTitle}</span>
                                </div>
                              )}
                              {event.metadata.oldStatus && event.metadata.newStatus && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>
                                    Status: {event.metadata.oldStatus} → {event.metadata.newStatus}
                                  </span>
                                </div>
                              )}
                              {event.metadata.fileName && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  <span>File: {event.metadata.fileName}</span>
                                </div>
                              )}
                              {event.metadata.commentText && (
                                <div className="bg-white/50 p-2 rounded text-xs italic">
                                  "{event.metadata.commentText}"
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <div className="text-xs text-muted-foreground text-right">
                          <div>{formatEventTime(event.timestamp)}</div>
                          <div className="mt-1">
                            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimeline;