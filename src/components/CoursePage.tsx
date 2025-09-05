import { useCallback } from 'react';
import { Button } from './ui/button';
import UKGolfCourseSelector from './UKGolfCourseSelector';
import { Course, TeeBox } from '../types/course';

interface CoursePageProps {
  onBack: () => void;
  onContinue: (course: Course, teeBox: TeeBox) => void;
}

export function CoursePage({ onBack, onContinue }: CoursePageProps) {
  const handleCourseDownloaded = useCallback((downloaded: any) => {
    // Map downloaded data into existing Course/TeeBox shapes
    const teeBox: TeeBox = {
      color: 'white',
      name: 'Default',
      courseRating: downloaded.courseRating || 0,
      slopeRating: downloaded.slopeRating || 113,
      totalYardage: downloaded.totalYardage || 0,
      par: downloaded.totalPar,
    };

    const course: Course = {
      id: String(downloaded.courseId),
      name: downloaded.courseName,
      location: downloaded.clubLocation || '',
      totalPar: downloaded.totalPar || 72,
      teeBoxes: [teeBox],
      holes: downloaded.holes.map((h: any) => ({
        number: h.number,
        par: h.par,
        strokeIndex: h.handicapIndex ?? 0,
        yardages: { white: h.yardage || 0 },
      })),
    };

    onContinue(course, teeBox);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-playfair-black text-augusta-yellow">Select Course</h1>
            <p className="text-xl font-playfair text-augusta-yellow-dark">Choose a UK club and course</p>
          </div>
        </div>

        <div className="container mx-auto px-4 flex-1">
          <UKGolfCourseSelector onCourseDownloaded={handleCourseDownloaded} />
          <div className="flex justify-center mt-8">
            <Button 
              onClick={onBack}
              className="bg-transparent text-augusta-yellow-dark rounded-2xl px-6 py-3 text-lg font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
            >
              Back to Home
            </Button>
          </div>
        </div>

        <div className="pb-4"></div>
      </div>
    </div>
  );
}