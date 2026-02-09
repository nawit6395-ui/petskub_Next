import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
}

export const ImageGallery = ({
  images,
  open,
  onOpenChange,
  initialIndex = 0
}: ImageGalleryProps) => {
  const [api, setApi] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update current index when carousel changes
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Reset to initial index when dialog opens
  useEffect(() => {
    if (open && api) {
      api.scrollTo(initialIndex);
      setCurrentIndex(initialIndex);
    }
  }, [open, api, initialIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 !left-0 !top-0 !max-w-none w-screen h-screen p-0 bg-black border-none shadow-none flex flex-col items-center justify-center [&>button]:hidden !z-[9999]">
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>
        <DialogDescription className="sr-only">ดูรูปภาพในแกลเลอรี่</DialogDescription>

        {/* Custom close button - visible on all devices */}
        {/* Custom close button - visible on all devices */}
        <div className="fixed top-[env(safe-area-inset-top,12px)] right-3 mt-3 z-[10000]" style={{ top: 'max(env(safe-area-inset-top, 0px) + 12px, 12px)' }}>
          <button
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/20 cursor-pointer"
            aria-label="ปิด"
            type="button"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </button>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            startIndex: initialIndex,
            loop: true,
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <CarouselContent className="h-full items-center">
            {images.map((image, index) => (
              <CarouselItem key={index} className="flex items-center justify-center h-full px-4 sm:px-8">
                <div className="relative w-full h-full flex items-center justify-center pt-24 pb-20 sm:py-24">
                  <img
                    src={image}
                    alt={`รูปที่ ${index + 1}`}
                    className="max-h-[60vh] sm:max-h-[75vh] w-auto max-w-[92vw] sm:max-w-[85vw] object-contain rounded-xl sm:rounded-2xl shadow-2xl"
                    loading="lazy"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation buttons - hidden on single image */}
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-2 sm:left-4 md:left-8 bg-white/10 hover:bg-white/25 text-white border-none h-10 w-10 sm:h-12 sm:w-12 backdrop-blur-sm transition-all" />
              <CarouselNext className="right-2 sm:right-4 md:right-8 bg-white/10 hover:bg-white/25 text-white border-none h-10 w-10 sm:h-12 sm:w-12 backdrop-blur-sm transition-all" />
            </>
          )}
        </Carousel>

        {/* Image counter - only show if multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center pointer-events-none">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs sm:text-sm font-prompt shadow-lg">
              <span className="font-medium">{currentIndex + 1}</span>
              <span className="text-white/60">/</span>
              <span className="text-white/80">{images.length}</span>
            </div>
          </div>
        )}

        {/* Thumbnail dots for navigation */}
        {images.length > 1 && images.length <= 10 && (
          <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 flex justify-center gap-1.5 sm:gap-2 pointer-events-none">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all pointer-events-auto ${index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/60'
                  }`}
                aria-label={`ไปยังรูปที่ ${index + 1}`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
