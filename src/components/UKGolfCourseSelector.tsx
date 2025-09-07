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
  const [courseToConfirm, setCourseToConfirm] = useState<{ club: Club; course: Course } | null>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [holesAvailable, setHolesAvailable] = useState<boolean>(true);

  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSize = 500;
      const maxPages = 10; // cap to avoid excessive requests
      const aggregated: Club[] = [];
      for (let page = 0; page < maxPages; page++) {
        const offset = page * pageSize;
        const res = await fetch(`${API_BASE_URL}/clubs?offset=${offset}&limit=${pageSize}`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        const items: Club[] = (data && (data.items || [])) as Club[];
        if (!items || items.length === 0) break;
        aggregated.push(...items);
        // stop if we've likely reached the end (API may return total)
        if ((data.total && aggregated.length >= data.total) || items.length < pageSize) break;
      }
      setClubs(aggregated);
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

  const downloadCourseData = async (
    club: Club,
    course: Course,
    action: 'load' | 'save' | 'saveAndLoad' = 'load'
  ) => {
    setLoading(true);
    setError(null);
    try {
      const holesResponse = await fetch(`${API_BASE_URL}/holes?course_id=${course.id}`);
      if (!holesResponse.ok) {
        if (holesResponse.status === 404) {
          throw new Error('Holes data endpoint not available from provider (404). Please use Local mode for now.');
        }
        throw new Error(`API Error: ${holesResponse.status}`);
      }
      const holesData = await holesResponse.json();
      const holes: Hole[] = (holesData && (holesData.holes || holesData)) || [];

      const completeCourseData = {
        courseId: course.id,
        courseName: course.name,
        clubName: club.name,
        clubLocation: (club as any).location,
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

      // Save to My Courses if required
      if (action === 'save' || action === 'saveAndLoad') {
        const raw = localStorage.getItem('my_golf_courses') || '[]';
        const list = JSON.parse(raw) as any[];
        const without = list.filter((c) => String(c.courseId) !== String(course.id));
        without.unshift(completeCourseData);
        localStorage.setItem('my_golf_courses', JSON.stringify(without.slice(0, 50)));
        setMyCourses(without.slice(0, 50));
      }

      if (action === 'load' || action === 'saveAndLoad') {
        onCourseDownloaded(completeCourseData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to download course');
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
        aggregated.push(...items);
        if (aggregated.length >= 50) break; // enough to display
      }
      // Keep aggregated list; we'll apply prefix-first filtering in render for best UX
      setClubs(aggregated);
    } catch (err: any) {
      setError(`Failed to search clubs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
    // Check if holes endpoint exists; if not, disable UK loading
    (async () => {
      try {
        const probe = await fetch(`${API_BASE_URL}/holes?limit=1`, { method: 'GET' });
        if (!probe.ok) {
          setHolesAvailable(false);
        }
      } catch {
        setHolesAvailable(false);
      }
    })();
    try {
      const raw = localStorage.getItem('my_golf_courses') || '[]';
      setMyCourses(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-2">Select UK Golf Course</h2>
      {!holesAvailable && (
        <div className="mb-4 p-3 rounded-xl border-2 border-augusta-yellow text-augusta-yellow">
          UK beta can list clubs/courses but cannot load holes (provider endpoint missing). Please use the Local tab for now.
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-augusta-yellow-dark" />
            <input
              type="text"
              placeholder="Search UK golf clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-augusta-yellow bg-augusta-yellow text-green-900 placeholder:text-green-800 focus:ring-2 focus:ring-augusta-yellow-dark"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 disabled:opacity-50"
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

      {/* My Courses pinned section */}
      {myCourses.length > 0 && !selectedClub && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">My Courses</h3>
          <div className="grid gap-3">
            {myCourses.map((saved) => (
              <div key={String(saved.courseId)} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{saved.courseName}</h4>
                  <p className="text-sm text-gray-600">{saved.clubName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onCourseDownloaded(saved)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => {
                      const next = myCourses.filter((c) => String(c.courseId) !== String(saved.courseId));
                      setMyCourses(next);
                      localStorage.setItem('my_golf_courses', JSON.stringify(next));
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {clubs.length > 0 && !selectedClub && (
        <div className="mb-6">
          {(() => {
            const normalize = (s: string) => s.toLowerCase().replace(/[.'’]/g, '').replace(/\s+/g, ' ').trim();
            const termRaw = searchTerm.trim();
            const term = normalize(termRaw);
            let list = clubs;
            if (term) {
              const prefix = list
                .filter((c) => normalize(c.name || '').startsWith(term))
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
              const contains = list
                .filter((c) => {
                  const n = normalize(c.name || '');
                  return !n.startsWith(term) && n.includes(term);
                })
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
              list = [...prefix, ...contains];
            } else {
              list = list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }
            const filteredByName = list;
            return (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Found {filteredByName.length} Golf Clubs</h3>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {filteredByName.map((club) => (
                    <div
                      key={String(club.id)}
                      onClick={() => handleClubSelect(club)}
                      className="p-4 rounded-2xl cursor-pointer border-2 border-augusta-yellow bg-augusta-yellow/10 hover:bg-augusta-yellow/20 transition-colors"
                    >
                      <h4 className="font-semibold text-augusta-yellow">{club.name}</h4>
                      {(club.postcode || club.address1 || club.address2 || club.address3) && (
                        <div className="flex items-center gap-1 text-augusta-yellow-dark text-sm mt-1">
                          <MapPin className="h-3 w-3 text-augusta-yellow-dark" />
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
              className="text-augusta-yellow hover:text-augusta-yellow-dark text-sm"
            >
              ← Back to clubs
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-3">Courses at {selectedClub.name}</h3>

          <div className="grid gap-3">
            {courses.map((course) => (
              <div key={String(course.id)} className="p-4 rounded-2xl border-2 border-augusta-yellow bg-augusta-yellow/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-augusta-yellow">{course.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-augusta-yellow-dark mt-2">
                      {course.holes && <span>{course.holes} holes</span>}
                      {course.par && <span>Par {course.par}</span>}
                    </div>
                    {course.description && <p className="text-augusta-yellow-dark text-sm mt-2">{course.description}</p>}
                  </div>

                  <button
                    onClick={() => selectedClub && holesAvailable && setCourseToConfirm({ club: selectedClub, course })}
                    disabled={loading || !holesAvailable}
                    className="px-4 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {holesAvailable ? 'Select Course' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Course Selection Panel */}
      {courseToConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="rounded-2xl shadow-lg w-[90%] max-w-md p-6 border-2 border-augusta-yellow bg-augusta-yellow/10">
            <h3 className="text-lg font-semibold text-augusta-yellow mb-2">Confirm course selection</h3>
            <div className="text-sm text-augusta-yellow-dark space-y-1 mb-4">
              <p><span className="font-medium">Club:</span> {courseToConfirm.club.name}</p>
              <p><span className="font-medium">Course:</span> {courseToConfirm.course.name}</p>
            </div>
            <div className="flex gap-2 justify-between">
              <button
                onClick={() => {
                  const { club, course } = courseToConfirm;
                  downloadCourseData(club, course, 'save');
                }}
                className="px-4 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10"
                disabled={loading}
              >
                Add to My Courses
              </button>
              <button
                onClick={() => setCourseToConfirm(null)}
                className="px-4 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { club, course } = courseToConfirm;
                  setCourseToConfirm(null);
                  downloadCourseData(club, course, 'saveAndLoad');
                }}
                className="px-4 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 disabled:opacity-50"
                disabled={loading}
              >
                Confirm & Load
              </button>
            </div>
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


