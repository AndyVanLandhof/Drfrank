import React, { useEffect, useState } from 'react';
import { Search, MapPin, Download } from 'lucide-react';

type Club = {
  id: string | number;
  name: string;
  postcode?: string;
  address1?: string;
  address2?: string;
  address3?: string;
};

type Course = {
  id: string | number;
  name: string;
  holes?: number;
  par?: number;
  description?: string;
  slopeRating?: number;
  slope_rating?: number;
  courseRating?: number;
  course_rating?: number;
};

type Hole = {
  number?: number;
  hole_number?: number;
  par?: number;
  yardage?: number;
  yards?: number;
  index?: number;
  handicap_index?: number;
  stroke_index?: number;
  description?: string;
};

export interface UKGolfCourseSelectorProps {
  onCourseDownloaded: (courseData: any) => void;
}

const API_BASE_URL = '/api/uk-golf';

export default function UKGolfCourseSelector({ onCourseDownloaded }: UKGolfCourseSelectorProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/clubs`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      const items = (data && (data.items || [])) as Club[];
      setClubs(items);
    } catch (err: any) {
      setError(`Failed to load clubs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (clubId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      // API exposes courses under nested club path
      const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/courses`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      const items = (data && (data.items || [])) as Course[];
      setCourses(items);
    } catch (err: any) {
      setError(`Failed to load courses: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadCourseData = async (club: Club, course: Course) => {
    setLoading(true);
    setError(null);
    try {
      const holesResponse = await fetch(`${API_BASE_URL}/holes?course_id=${course.id}`);
      if (!holesResponse.ok) throw new Error(`API Error: ${holesResponse.status}`);
      const holesData = await holesResponse.json();
      const holes: Hole[] = (holesData && (holesData.holes || holesData)) || [];

      const completeCourseData = {
        courseId: course.id,
        courseName: course.name,
        clubName: club.name,
        clubLocation: club.location,
        totalHoles: holes.length,
        totalPar: holes.reduce((sum, hole) => sum + (hole.par || 0), 0),
        totalYardage: holes.reduce((sum, hole) => sum + (hole.yardage || hole.yards || 0), 0),
        holes: holes.map((hole) => ({
          number: hole.number ?? hole.hole_number,
          par: hole.par,
          yardage: hole.yardage ?? hole.yards,
          handicapIndex: hole.index ?? hole.handicap_index ?? hole.stroke_index,
          description: hole.description || '',
        })),
        slopeRating: (course as any).slopeRating || (course as any).slope_rating || 113,
        courseRating: (course as any).courseRating || (course as any).course_rating,
        downloadedAt: new Date().toISOString(),
        source: 'UK Golf API (bthree.uk)',
      };

      const storageKey = `golf_course_${course.id}`;
      localStorage.setItem(storageKey, JSON.stringify(completeCourseData));

      const recentCoursesRaw = localStorage.getItem('recent_golf_courses') || '[]';
      const recentCourses: any[] = JSON.parse(recentCoursesRaw);
      const exists = recentCourses.find((c) => c.courseId === course.id);
      if (!exists) {
        recentCourses.unshift({
          courseId: course.id,
          courseName: course.name,
          clubName: club.name,
          downloadedAt: completeCourseData.downloadedAt,
        });
        localStorage.setItem('recent_golf_courses', JSON.stringify(recentCourses.slice(0, 10)));
      }

      onCourseDownloaded(completeCourseData);
    } catch (err: any) {
      setError(`Failed to download course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClubSelect = async (club: Club) => {
    setSelectedClub(club);
    setCourses([]);
    await fetchCourses(club.id);
  };

  const handleSearch = async () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      // Reset to initial page
      await fetchClubs();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const pageSize = 500;
      const maxPages = 20; // safety cap
      const aggregated: Club[] = [];
      for (let page = 0; page < maxPages; page++) {
        const offset = page * pageSize;
        const url = `${API_BASE_URL}/clubs?offset=${offset}&limit=${pageSize}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        const items: Club[] = (data && (data.items || [])) as Club[];
        if (!items || items.length === 0) break;
        const filtered = items.filter((c) =>
          [c.name, c.postcode, c.address1, c.address2, c.address3]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(term)
        );
        aggregated.push(...filtered);
        if (aggregated.length >= 50) break; // enough to display
      }
      setClubs(aggregated);
    } catch (err: any) {
      setError(`Failed to search clubs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Select UK Golf Course</h2>

      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search UK golf clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading UK courses...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {clubs.length > 0 && !selectedClub && (
        <div className="mb-6">
          {(() => {
            const term = searchTerm.trim().toLowerCase();
            const filtered = term
              ? clubs.filter((c) => {
                  const hay = [c.name, c.postcode, c.address1, c.address2, c.address3]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                  return hay.includes(term);
                })
              : clubs;
            return (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Found {filtered.length} Golf Clubs</h3>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {filtered.map((club) => (
                    <div
                      key={String(club.id)}
                      onClick={() => handleClubSelect(club)}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-800">{club.name}</h4>
                      {(
                        club.postcode || club.address1 || club.address2 || club.address3
                      ) && (
                        <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{[club.address1, club.address2, club.address3, club.postcode].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {courses.length > 0 && selectedClub && (
        <div className="mb-6">
          <div className="mb-4">
            <button
              onClick={() => {
                setSelectedClub(null);
                setCourses([]);
              }}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              ← Back to clubs
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-3">Courses at {selectedClub.name}</h3>

          <div className="grid gap-3">
            {courses.map((course) => (
              <div key={String(course.id)} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{course.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      {course.holes && <span>{course.holes} holes</span>}
                      {course.par && <span>Par {course.par}</span>}
                    </div>
                    {course.description && <p className="text-gray-600 text-sm mt-2">{course.description}</p>}
                  </div>

                  <button
                    onClick={() => downloadCourseData(selectedClub, course)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Select Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const getStoredCourse = (courseId: string | number) => {
  const stored = localStorage.getItem(`golf_course_${courseId}`);
  return stored ? JSON.parse(stored) : null;
};

export const getRecentCourses = () => {
  const recent = localStorage.getItem('recent_golf_courses');
  return recent ? JSON.parse(recent) : [];
};


