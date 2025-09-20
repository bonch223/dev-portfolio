import React, { useState, useEffect, useRef } from 'react';

const LightboxGallery = ({ images, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
        default:
          break;
      }
    };

    // Prevent background scrolling when lightbox is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 1));
    if (scale <= 1.2) {
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen || !images.length) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/98 backdrop-blur-md">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      
      {/* Main container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Media container */}
        <div 
          className="relative max-w-full max-h-full overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {images[currentIndex].endsWith('.mp4') || images[currentIndex].endsWith('.webm') || images[currentIndex].endsWith('.mov') ? (
            <video
              ref={imageRef}
              src={images[currentIndex]}
              className={`max-w-full max-h-full object-contain transition-transform duration-300 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center'
              }}
              controls
              autoPlay
              muted
              loop
              draggable={false}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              ref={imageRef}
              src={images[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-transform duration-300 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center'
              }}
              draggable={false}
            />
          )}
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-white text-sm px-2">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <button
            onClick={resetZoom}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex space-x-2 bg-white/10 backdrop-blur-sm rounded-full p-2 max-w-md overflow-x-auto">
            {images.map((image, index) => {
              const isVideo = image.endsWith('.mp4') || image.endsWith('.webm') || image.endsWith('.mov');
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    resetZoom();
                  }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 relative ${
                    index === currentIndex 
                      ? 'border-cyan-400 scale-110' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {isVideo ? (
                    <>
                      <video
                        src={image}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </>
                  ) : (
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Instructions */}
        <div className="absolute top-4 left-4 z-20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-white text-xs space-y-1">
            <div>• Mouse wheel to zoom</div>
            <div>• Drag to pan when zoomed</div>
            <div>• Arrow keys to navigate</div>
            <div>• ESC to close</div>
            {(images[currentIndex] && (images[currentIndex].endsWith('.mp4') || images[currentIndex].endsWith('.webm') || images[currentIndex].endsWith('.mov'))) && (
              <div>• Video controls available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightboxGallery;
