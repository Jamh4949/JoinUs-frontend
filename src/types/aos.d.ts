/**
 * TypeScript Type Definitions for AOS (Animate On Scroll) Library
 * 
 * This file provides type definitions for the AOS library which is used
 * throughout the application for scroll-triggered animations.
 * 
 * AOS is a small library to animate elements on your page as you scroll.
 * 
 * @see https://michalsnik.github.io/aos/
 * @module aos
 */

declare module 'aos' {
  /**
   * Configuration options for AOS initialization
   * @interface AosOptions
   */
  interface AosOptions {
    /** Offset (in px) from the original trigger point */
    offset?: number;
    
    /** Delay animation (in ms) */
    delay?: number;
    
    /** Duration of animation (in ms) */
    duration?: number;
    
    /** Easing function for animations (e.g., 'ease', 'ease-in-out') */
    easing?: string;
    
    /** Whether animation should happen only once */
    once?: boolean;
    
    /** Whether elements should animate out while scrolling past them */
    mirror?: boolean;
    
    /** Anchor placement for animation trigger point */
    anchorPlacement?: string;
    
    /** Name of the event triggering initialization */
    startEvent?: string;
    
    /** Class applied on initialization */
    initClassName?: string;
    
    /** Class applied on animation */
    animatedClassName?: string;
    
    /** If true, will add class names from data-aos attribute */
    useClassNames?: boolean;
    
    /** Condition(s) when AOS should be disabled */
    disable?: boolean | 'phone' | 'tablet' | 'mobile' | (() => boolean);
    
    /** Delay on throttle used while scrolling (in ms) */
    throttleDelay?: number;
    
    /** Delay on debounce used while resizing window (in ms) */
    debounceDelay?: number;
  }

  /**
   * AOS instance interface with available methods
   * @interface AosInstance
   */
  interface AosInstance {
    /** Initialize AOS library with optional configuration */
    init(options?: AosOptions): void;
    
    /** Refresh AOS by recalculating all offsets and positions */
    refresh(): void;
    
    /** Hard refresh AOS by reinitializing the entire library */
    refreshHard(): void;
  }

  /** Main AOS instance */
  const AOS: AosInstance;

  /** Export AosOptions type */
  export type { AosOptions };
  
  /** Initialize AOS with options */
  export function init(options?: AosOptions): void;
  
  /** Refresh AOS calculations */
  export function refresh(): void;
  
  /** Hard refresh AOS */
  export function refreshHard(): void;
  
  /** Default export of AOS instance */
  export default AOS;
}
