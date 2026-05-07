/**
 * Web Navigation Service for Admin Portal
 * Provides a way to navigate outside of React components.
 */

export function navigate(path, state = {}) {
    // For web, we can use window.location or a custom history object if integrated.
    // For now, window.location is the most reliable way outside of the React lifecycle.

    // Convert mobile-style 'Main', { screen: 'Plans' } to web path
    if (path === 'Main' && state.screen === 'Plans') {
        window.location.href = '/admin/plans';
    } else {
        window.location.href = path;
    }
}
