/**
 * Main Application Entry Point
 */

import { initMobileMenu, initScrollEffects, initMediaGallery } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CrownForge Engine Initialized...');
    
    // Initialize UI components
    initMobileMenu();
    initScrollEffects();
    initMediaGallery();
    
    // Example of dynamic console greeting
    const studioName = "CrownForge";
    console.log(`Welcome to ${studioName} - Where Worlds Are Born.`);
});