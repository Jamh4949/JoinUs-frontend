/**
 * TypeScript Type Definitions for Style and Asset Imports
 * 
 * This file provides type definitions for importing style files and
 * image assets in TypeScript. It allows TypeScript to understand
 * imports that would otherwise cause compilation errors.
 * 
 * @module styles
 */

/**
 * Module declaration for SCSS files
 * Allows importing .scss files without TypeScript errors
 * The actual styles are processed by Vite and injected into the page
 */
declare module '*.scss';

/**
 * Module declaration for SASS files
 * Allows importing .sass files without TypeScript errors
 * The actual styles are processed by Vite and injected into the page
 */
declare module '*.sass';

/**
 * Module declaration for PNG image files
 * Allows importing .png images as strings (URLs)
 * 
 * @example
 * import logo from './assets/logo.png';
 * <img src={logo} alt="Logo" />
 */
declare module '*.png' {
	/** The URL/path to the image file as a string */
	const value: string;
	export default value;
}
