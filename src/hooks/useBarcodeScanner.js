import { useState, useEffect, useCallback } from 'react';

/**
 * Hook that listens for barcode scanner input.
 * Barcode scanners typically type characters in rapid succession,
 * followed by an Enter key. This hook detects that pattern.
 *
 * @param {Object} options
 * @param {Function} options.onScan - Callback when a barcode is detected
 * @param {number} options.maxDelay - Max delay between keystrokes (ms). Default 50.
 * @param {number} options.minLength - Minimum barcode length. Default 3.
 * @param {boolean} options.enabled - Whether the hook is active. Default true.
 */
export default function useBarcodeScanner({ onScan, maxDelay = 50, minLength = 3, enabled = true }) {
    const [buffer, setBuffer] = useState('');
    const [lastKeyTime, setLastKeyTime] = useState(0);

    const handleKeyDown = useCallback((e) => {
        if (!enabled) return;

        // Don't capture when user is typing in an input/textarea/select
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        const now = Date.now();

        if (e.key === 'Enter') {
            if (buffer.length >= minLength) {
                onScan(buffer);
            }
            setBuffer('');
            return;
        }

        // Only capture printable characters
        if (e.key.length === 1) {
            if (now - lastKeyTime > maxDelay && buffer.length > 0) {
                // Too slow — reset buffer (user is typing normally)
                setBuffer(e.key);
            } else {
                setBuffer(prev => prev + e.key);
            }
            setLastKeyTime(now);
        }
    }, [enabled, buffer, lastKeyTime, maxDelay, minLength, onScan]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Auto-clear buffer after a timeout
    useEffect(() => {
        if (buffer.length === 0) return;
        const timer = setTimeout(() => setBuffer(''), 500);
        return () => clearTimeout(timer);
    }, [buffer]);

    return { buffer };
}
