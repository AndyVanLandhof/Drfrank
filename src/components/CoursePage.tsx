import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Search, MapPin, TrendingUp, Target } from 'lucide-react';
import { CourseService } from '../services/courseService';
import { Course, CourseSearchResult, TeeBox } from '../types/course';

interface CoursePageProps {
  onBack: () => void;
  onContinue: (course: Course, teeBox: TeeBox) => void;
}

export function CoursePage({ onBack, onContinue }: CoursePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseSearchResult[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<CourseSearchResult[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTeeBox, setSelectedTeeBox] = useState<TeeBox | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load featured courses on mount
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const courses = await CourseService.getFeaturedCourses();
        setFeaturedCourses(courses);
      } catch (error) {
        console.error('Failed to load featured courses:', error);
      }
    };
    
    loadFeatured();
  }, []);
  
  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await CourseService.searchCourses(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle course selection
  const handleCourseSelect = async (courseId: string) => {
    setIsLoading(true);
    try {
      const course = await CourseService.getCourseById(courseId);
      if (course) {
        setSelectedCourse(course);
      }
    } catch (error) {
      console.error('Failed to load course details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle tee box selection
  const handleTeeBoxSelect = (teeBox: TeeBox) => {
    setSelectedTeeBox(teeBox);
  };

  // Confirm course and tee selection
  const handleConfirm = () => {
    if (selectedCourse && selectedTeeBox) {
      onContinue(selectedCourse, selectedTeeBox);
    }
  };
  
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-playfair-black text-augusta-yellow">
              {selectedCourse ? 'Select Tee Box' : 'Select Course'}
            </h1>
            <p className="text-xl font-playfair text-augusta-yellow-dark">
              {selectedCourse 
                ? 'Choose your preferred tee box for this round' 
                : 'Choose your golf course to get started'
              }
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 flex-1">
          {!selectedCourse ? (
            <>
              {/* Search Section */}
              <div className="mb-8">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-augusta-yellow-dark w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-lg font-playfair bg-transparent border-2 border-augusta-yellow text-augusta-yellow rounded-2xl"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-augusta-yellow"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-playfair text-augusta-yellow mb-4">
                    Search Results
                  </h2>
                  <div className="space-y-3">
                    {searchResults.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onSelect={() => handleCourseSelect(course.id)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Featured Courses */}
              {searchResults.length === 0 && featuredCourses.length > 0 && (
                <div>
                  <h2 className="text-2xl font-playfair text-augusta-yellow mb-4">
                    Featured Courses
                  </h2>
                  <div className="space-y-3">
                    {featuredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onSelect={() => handleCourseSelect(course.id)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* No Results */}
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-lg font-playfair text-augusta-yellow-dark">
                    No courses found for "{searchQuery}"
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Course Details and Tee Selection */
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-4xl font-playfair text-augusta-yellow mb-2">
                  {selectedCourse.name}
                </h2>
                <p className="text-lg font-playfair text-augusta-yellow-dark flex items-center justify-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {selectedCourse.location}
                </p>
              </div>
              
              <Card className="p-6 border-2 border-augusta-yellow bg-transparent">
                <div className="mb-6">
                  <h3 className="text-xl font-playfair text-augusta-yellow mb-3 text-center">Select Tee Box</h3>
                  <div className="space-y-3">
                    {selectedCourse.teeBoxes.map((tee, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedTeeBox?.color === tee.color 
                            ? 'border-augusta-yellow bg-augusta-yellow/10' 
                            : 'border-augusta-yellow/30 hover:border-augusta-yellow/60 hover:bg-augusta-yellow/5'
                        }`}
                        onClick={() => handleTeeBoxSelect(tee)}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-5 h-5 rounded-full mr-4 border-2 border-augusta-yellow"
                            style={{ backgroundColor: getTeeColor(tee.color) }}
                          ></div>
                          <div>
                            <span className="text-lg font-playfair text-augusta-yellow block">{tee.name}</span>
                            {tee.par && (
                              <span className="text-sm font-playfair text-augusta-yellow-dark">Par {tee.par}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex space-x-4 text-sm font-playfair text-augusta-yellow-dark">
                            <span>{tee.courseRating}CR</span>
                            <span>{tee.slopeRating}SR</span>
                            <span>{tee.totalYardage}y</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center pt-4 border-t-2 border-augusta-yellow/30">
                  <p className="text-lg font-playfair text-augusta-yellow">
                    {selectedTeeBox ? `Selected: ${selectedTeeBox.name}` : 'Please select a tee box'}
                  </p>
                  {selectedTeeBox && (
                    <p className="text-sm font-playfair text-augusta-yellow-dark mt-1">
                      Par {selectedTeeBox.par || selectedCourse.totalPar} • {selectedTeeBox.totalYardage} yards
                    </p>
                  )}
                </div>
              </Card>
              
              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedTeeBox}
                  className={`rounded-2xl px-8 py-3 text-lg font-playfair border-2 w-64 ${
                    selectedTeeBox
                      ? 'bg-transparent text-augusta-yellow hover:bg-augusta-yellow/10 border-augusta-yellow'
                      : 'bg-transparent text-augusta-yellow-dark/50 border-augusta-yellow-dark/50 cursor-not-allowed'
                  }`}
                >
                  Continue to Players
                </Button>
                <Button
                  onClick={() => {
                    setSelectedCourse(null);
                    setSelectedTeeBox(null);
                  }}
                  className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-3 text-lg font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-augusta-yellow-dark w-64"
                >
                  Change Course
                </Button>
              </div>
              
              {/* Back to Home button for tee selection */}
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={onBack}
                  className="bg-transparent text-augusta-yellow-dark rounded-2xl px-6 py-3 text-lg font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          )}
          
          {/* Back Button */}
          {!selectedCourse && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={onBack}
                className="bg-transparent text-augusta-yellow-dark rounded-2xl px-6 py-3 text-lg font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
              >
                Back to Home
              </Button>
            </div>
          )}
        </div>
        
        <div className="pb-4"></div>
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: CourseSearchResult;
  onSelect: () => void;
  isLoading: boolean;
}

// Helper function to get tee box colors
function getTeeColor(teeColor: string): string {
  const colors: Record<string, string> = {
    black: '#000000',
    blue: '#0066CC',
    white: '#FFFFFF',
    yellow: '#FFD700',
    red: '#CC0000',
    green: '#00AA00'
  };
  return colors[teeColor.toLowerCase()] || '#999999';
}

function CourseCard({ course, onSelect, isLoading }: CourseCardProps) {
  return (
    <Card className="p-4 border-2 border-augusta-yellow bg-transparent hover:bg-augusta-yellow/5 transition-colors cursor-pointer"
          onClick={onSelect}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-playfair text-augusta-yellow mb-1">
            {course.name}
          </h3>
          <p className="text-sm font-playfair text-augusta-yellow-dark flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {course.location}
          </p>
        </div>
        <div className="text-right">
          <div className="text-center">
            <p className="text-xs font-playfair text-augusta-yellow">Tee Options</p>
            <p className="text-sm font-playfair text-augusta-yellow-dark">
              {course.teeBoxes.length} available
            </p>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-augusta-yellow"></div>
          <span className="ml-2 text-sm font-playfair text-augusta-yellow-dark">Loading...</span>
        </div>
      )}
    </Card>
  );
}