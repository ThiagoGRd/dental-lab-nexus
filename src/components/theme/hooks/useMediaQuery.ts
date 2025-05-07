
import { useEffect, useRef, useState } from "react";

/**
 * Hook to safely handle media queries with proper cleanup
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);
  const mediaQueryRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    try {
      // Initialize the media query
      mediaQueryRef.current = window.matchMedia(query);
      setMatches(mediaQueryRef.current.matches);
      
      // Handler function
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      const mediaQuery = mediaQueryRef.current;
      
      // Use correct EventListenerOptions type
      const listenerOptions: AddEventListenerOptions = { passive: true };
      
      try {
        // Modern event listener with correct type
        mediaQuery.addEventListener("change", handleChange, listenerOptions);
        
        return () => {
          mediaQuery.removeEventListener("change", handleChange, listenerOptions);
        };
      } catch (listenerError) {
        // Fallback for older browsers
        try {
          // @ts-ignore - For older browsers that don't support addEventListener
          if (typeof mediaQuery.addListener === 'function') {
            // @ts-ignore
            mediaQuery.addListener(handleChange);
            return () => {
              // @ts-ignore
              mediaQuery.removeListener(handleChange);
            };
          }
        } catch (fallbackError) {
          console.debug("Media query listener error:", fallbackError);
        }
      }
    } catch (error) {
      console.debug("Error setting up media query:", error);
    }
    
    return () => {};
  }, [query]);
  
  return matches;
};
