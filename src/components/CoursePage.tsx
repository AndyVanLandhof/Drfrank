import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Search, MapPin } from 'lucide-react';
import { CourseService } from '../services/courseService';
import { Course, CourseSearchResult, TeeBox } from '../types/course';
import UKGolfCourseSelector from './UKGolfCourseSelector';
import ScorecardScanner from './ScorecardScanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

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
	const [mode, setMode] = useState<'local' | 'uk'>('local');
	const [scanOpen, setScanOpen] = useState(false);
	
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
	
	const handleCourseSelect = async (courseId: string) => {
		setIsLoading(true);
		try {
			const course = await CourseService.getCourseById(courseId);
			if (course) {
				setSelectedCourse(course);
				setSelectedTeeBox(null);
			}
		} catch (error) {
			console.error('Failed to load course details:', error);
		} finally {
			setIsLoading(false);
		}
	};
	
	const handleTeeBoxSelect = (teeBox: TeeBox) => {
		setSelectedTeeBox(teeBox);
	};
	
	const handleConfirm = () => {
		if (selectedCourse && selectedTeeBox) {
			onContinue(selectedCourse, selectedTeeBox);
		}
	};

	// Handle UK API downloaded course -> map to local types and continue
	const handleCourseDownloaded = useCallback((downloaded: any) => {
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
	
	useEffect(() => {
		const timer = setTimeout(() => {
			handleSearch(searchQuery);
		}, 300);
		
		return () => clearTimeout(timer);
	}, [searchQuery]);
	
	return (
		<div className="min-h-screen bg-background p-4">
			<div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
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
				
				<div className="container mx-auto px-4 flex-1">
					{/* Mode toggle */}
					<div className="flex justify-center mb-6 gap-2">
						<Button
							onClick={() => setMode('local')}
							className={`rounded-2xl px-6 py-2 text-lg font-playfair border-2 ${mode === 'local' ? 'bg-transparent text-augusta-yellow border-augusta-yellow' : 'bg-transparent text-augusta-yellow-dark border-augusta-yellow/40'}`}
						>
							Local
						</Button>
						<Button
							onClick={() => setMode('uk')}
							className={`rounded-2xl px-6 py-2 text-lg font-playfair border-2 ${mode === 'uk' ? 'bg-transparent text-augusta-yellow border-augusta-yellow' : 'bg-transparent text-augusta-yellow-dark border-augusta-yellow/40'}`}
						>
							UK (beta)
						</Button>
					</div>

					{mode === 'uk' ? (
						<>
							<UKGolfCourseSelector onCourseDownloaded={handleCourseDownloaded} />
							<div className="flex justify-center mt-8">
								<Button 
									onClick={onBack}
									className="bg-transparent text-augusta-yellow-dark rounded-2xl px-6 py-3 text-lg font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
								>
									Back to Home
								</Button>
							</div>
						</>
					) : (
						!selectedCourse ? (
							<>
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

								{/* Scan scorecard entry */}
								<div className="flex justify-center mb-6">
									<Dialog open={scanOpen} onOpenChange={setScanOpen}>
										<DialogTrigger asChild>
											<Button className="rounded-2xl px-6 py-2 text-lg font-playfair border-2 bg-transparent text-augusta-yellow border-augusta-yellow">Scan scorecard (beta)</Button>
										</DialogTrigger>
										<DialogContent className="border-2 border-augusta-yellow">
											<DialogHeader>
												<DialogTitle className="text-augusta-yellow">Scan scorecard</DialogTitle>
											</DialogHeader>
											<ScorecardScanner
												onCancel={() => setScanOpen(false)}
												onConfirm={({ clubName, courseName, holes }) => {
													// Map to Course/TeeBox and continue; also save to My Courses & Recent
													const teeBox: TeeBox = {
														color: 'white',
														name: 'Default',
														courseRating: 0,
														slopeRating: 113,
														totalYardage: holes.reduce((s, h) => s + (h.yardage || 0), 0),
														par: holes.reduce((s, h) => s + (h.par || 0), 0),
													};
													const course: Course = {
														id: `${clubName}-${courseName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
														name: courseName,
														location: clubName,
														teeBoxes: [teeBox],
														totalPar: teeBox.par || 72,
														holes: holes.map(h => ({
															number: h.number,
															par: h.par || 0,
															strokeIndex: h.strokeIndex || 0,
															yardages: { white: h.yardage || 0 },
														})),
													};

													try {
														const completeCourseData = {
															courseId: course.id,
															courseName: course.name,
															clubName: course.location,
															clubLocation: course.location,
															totalHoles: holes.length,
															totalPar: course.totalPar,
															totalYardage: teeBox.totalYardage,
															holes: holes.map(h => ({
																number: h.number,
																par: h.par || 0,
																yardage: h.yardage || 0,
																handicapIndex: h.strokeIndex || 0,
																description: '',
															})),
															slopeRating: teeBox.slopeRating,
															courseRating: teeBox.courseRating,
															downloadedAt: new Date().toISOString(),
															source: 'Scanned scorecard',
														};
														localStorage.setItem(`golf_course_${course.id}`, JSON.stringify(completeCourseData));
														// Update My Courses
														const myRaw = localStorage.getItem('my_golf_courses') || '[]';
														const myList = JSON.parse(myRaw) as any[];
														const myWithout = myList.filter(c => String(c.courseId) !== String(course.id));
														myWithout.unshift(completeCourseData);
														localStorage.setItem('my_golf_courses', JSON.stringify(myWithout.slice(0,50)));
														// Update Recent
														const recentRaw = localStorage.getItem('recent_golf_courses') || '[]';
														const recent = JSON.parse(recentRaw) as any[];
														recent.unshift({ courseId: course.id, courseName: course.name, clubName: course.location, downloadedAt: new Date().toISOString() });
														localStorage.setItem('recent_golf_courses', JSON.stringify(recent.slice(0,10)));
													} catch {}
													setScanOpen(false);
													onContinue(course, teeBox);
												}}
											/>
										</DialogContent>
									</Dialog>
								</div>
								
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
								
								{searchQuery && !isSearching && searchResults.length === 0 && (
									<div className="text-center py-8">
										<p className="text-lg font-playfair text-augusta-yellow-dark">
											No courses found for "{searchQuery}"
										</p>
									</div>
								)}
							</>
						) : (
							<>
								<div className="text-center">
									<h2 className="text-4xl font-playfair text-augusta-yellow mb-2">
										{selectedCourse!.name}
									</h2>
									<p className="text-lg font-playfair text-augusta-yellow-dark flex items-center justify-center">
										<MapPin className="w-5 h-5 mr-2" />
										{selectedCourse!.location}
									</p>
								</div>
								
								<Card className="p-6 border-2 border-augusta-yellow bg-transparent">
									<div className="mb-6">
										<h3 className="text-xl font-playfair text-augusta-yellow mb-3 text-center">Select Tee Box</h3>
										<div className="space-y-3">
											{selectedCourse!.teeBoxes.map((tee, index) => (
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
								</Card>
								
								<div className="text-center pt-4 border-t-2 border-augusta-yellow/30">
									<p className="text-lg font-playfair text-augusta-yellow">
										{selectedTeeBox ? `Selected: ${selectedTeeBox.name}` : 'Please select a tee box'}
									</p>
									{selectedTeeBox && (
										<p className="text-sm font-playfair text-augusta-yellow-dark mt-1">
											Par {selectedTeeBox.par || selectedCourse!.totalPar} • {selectedTeeBox.totalYardage} yards
										</p>
									)}
								</div>
							</>
						)
					)}

					{/* Action buttons shown always; Continue is disabled until tee box selected */}
					<div className="flex flex-col items-center gap-4 mt-6">
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
					
					<div className="flex justify-center mt-4">
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

interface CourseCardProps {
	course: CourseSearchResult;
	onSelect: () => void;
	isLoading: boolean;
}

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