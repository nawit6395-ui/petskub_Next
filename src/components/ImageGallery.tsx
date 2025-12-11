import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl w-full h-[80vh] p-0 pt-12 bg-transparent border-none shadow-none flex flex-col items-center justify-center focus:outline-none focus:ring-0 [&>button]:text-black [&>button]:bg-white [&>button]:opacity-80 [&>button]:hover:opacity-100 [&>button]:hover:bg-white [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:top-4 [&>button]:right-4 [&>button]:border-none [&>button]:shadow-lg [&>button]:transition-all">
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>
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
              <CarouselItem key={index} className="flex items-center justify-center h-full">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={image}
                    alt={`รูปที่ ${index + 1}`}
                    className="max-h-[60vh] w-auto max-w-[90vw] object-contain rounded-md shadow-2xl"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 md:left-8 bg-black/50 hover:bg-black/70 text-white border-none h-12 w-12" />
          <CarouselNext className="right-2 md:right-8 bg-black/50 hover:bg-black/70 text-white border-none h-12 w-12" />
        </Carousel>
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
          <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-prompt backdrop-blur-sm shadow-lg pointer-events-auto">
            รูปที่ {(api?.selectedScrollSnap() ?? initialIndex) + 1} / {images.length}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
