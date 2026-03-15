/**
 * Download a file from the API via authenticated fetch
 * @param {string} endpoint - API endpoint path (e.g. '/export/products/csv')
 * @param {string} filename - Desired filename for download
 */
export async function downloadFile(endpoint, filename) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
