import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import drFrankImage from 'figma:asset/4affbe8373904a285e486c2684e55fc28d2ba1ab.png';

interface LandingPageProps {
  onPlayGolf: () => void;
}

export function LandingPage({ onPlayGolf }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5-percent-larger sm:text-5-percent-larger font-playfair-black text-augusta-yellow">
              Dr. Frank
            </h1>
            <p className="text-xl sm:text-2xl text-augusta-yellow-dark max-w-2xl italic font-playfair">
              Let's tee it up old bean
            </p>
          </div>

          {/* Dr. Frank Portrait */}
          <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-2xl overflow-hidden shadow-lg border-4 border-augusta-yellow">
            <ImageWithFallback 
              src={drFrankImage}
              alt="Dr. Frank - The Golf Scoring Expert"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Play Golf Button */}
          <Button 
            onClick={onPlayGolf}
            className="bg-augusta-yellow text-primary rounded-2xl w-40 h-40 text-3xl sm:text-4xl font-playfair hover:bg-augusta-yellow/90 border-2 border-augusta-yellow shadow-lg inset-border-augusta-green flex flex-col items-center justify-center"
          >
            <span>Play</span>
            <span>Golf</span>
          </Button>

        </div>
      </div>


      </div>
    </div>
  );
}