/**
 * Hook for image preloading
 * 
 * Usage:
 * const { preloadImage } = useImagePreload();
 * 
 * // Later:
 * preloadImage('/images/hero.jpg');
 */
export function useImagePreload() {
  const preloadImage = (src: string) => {
    const img = new Image();
    img.src = src;
  };

  const preloadImages = (srcs: string[]) => {
    srcs.forEach(preloadImage);
  };

  return { preloadImage, preloadImages };
}