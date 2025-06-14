
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Search,
  Filter,
  Star,
  CheckCircle
} from 'lucide-react';

const CourseHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Courses', count: 24 },
    { id: 'frontend', name: 'Frontend', count: 8 },
    { id: 'backend', name: 'Backend', count: 6 },
    { id: 'database', name: 'Database', count: 4 },
    { id: 'devops', name: 'DevOps', count: 3 },
    { id: 'design', name: 'Design', count: 3 },
  ];

  const courses = [
    {
      id: 1,
      title: 'React Advanced Patterns',
      description: 'Master advanced React patterns including compound components, render props, and custom hooks.',
      category: 'frontend',
      instructor: 'John Smith',
      duration: '6 hours',
      lessons: 24,
      enrolled: 156,
      rating: 4.8,
      progress: 65,
      level: 'Advanced',
      thumbnail: '/api/placeholder/300/200',
      isCompleted: false,
    },
    {
      id: 2,
      title: 'Node.js & Express Masterclass',
      description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
      category: 'backend',
      instructor: 'Sarah Johnson',
      duration: '8 hours',
      lessons: 32,
      enrolled: 203,
      rating: 4.9,
      progress: 30,
      level: 'Intermediate',
      thumbnail: '/api/placeholder/300/200',
      isCompleted: false,
    },
    {
      id: 3,
      title: 'Database Design Fundamentals',
      description: 'Learn relational database design, normalization, and SQL optimization.',
      category: 'database',
      instructor: 'Mike Davis',
      duration: '4 hours',
      lessons: 16,
      enrolled: 89,
      rating: 4.7,
      progress: 100,
      level: 'Beginner',
      thumbnail: '/api/placeholder/300/200',
      isCompleted: true,
    },
    {
      id: 4,
      title: 'UI/UX Design Principles',
      description: 'Master the fundamentals of user interface and user experience design.',
      category: 'design',
      instructor: 'Emily Chen',
      duration: '5 hours',
      lessons: 20,
      enrolled: 124,
      rating: 4.6,
      progress: 0,
      level: 'Beginner',
      thumbnail: '/api/placeholder/300/200',
      isCompleted: false,
    },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Course Hub</h1>
          <p className="text-slate-600 dark:text-slate-400">Expand your skills with our comprehensive courses</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <BookOpen className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id ? 
              "bg-gradient-to-r from-blue-500 to-purple-600" : ""
            }
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow overflow-hidden group">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Play className="w-12 h-12 text-white bg-black/30 rounded-full p-3 group-hover:scale-110 transition-transform" />
              </div>
              {course.isCompleted && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
              <Badge 
                className="absolute top-2 left-2" 
                variant={course.level === 'Beginner' ? 'secondary' : 
                        course.level === 'Intermediate' ? 'default' : 'destructive'}
              >
                {course.level}
              </Badge>
            </div>

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm ml-1">{course.rating}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {course.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrolled} students
                </div>
              </div>

              {course.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  by {course.instructor}
                </span>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  {course.progress > 0 ? 'Continue' : 'Start Course'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseHub;
