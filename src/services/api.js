/**
 * API Service — Fetch-based, no authentication.
 *
 * Each endpoint URL is read from a separate environment variable
 * defined in .env (see project root). Vite exposes them via import.meta.env.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const PDF_API_URL = import.meta.env.VITE_PDF_API_URL || 'http://localhost:5000/pdf';
const CAMERA_API_URL = import.meta.env.VITE_CAMERA_API_URL || 'http://localhost:5000/camera';
const AUDIO_API_URL = import.meta.env.VITE_AUDIO_API_URL || 'http://localhost:5000/audio';

/* ─────────────────────── Helpers ─────────────────────── */

/**
 * Generic fetch wrapper.
 * Sends the request, parses JSON, and throws on non-2xx status.
 */
async function request(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
        },
    });

    // Returns true when the server declared a JSON content type
    const isJson = () => res.headers.get('content-type')?.includes('application/json');

    if (!res.ok) {
        let errorMessage = `Request failed with status ${res.status}`;
        try {
            if (isJson()) {
                const body = await res.json();
                errorMessage = body.message || body.error || errorMessage;
            } else {
                const text = await res.text();
                if (text) errorMessage = text;
            }
        } catch {
            // Keep the generic message if parsing fails
        }
        throw new Error(errorMessage);
    }

    if (res.status === 204) return null;

    // Parse success response based on what the server actually sent
    if (isJson()) return res.json();
    return res.text();
}

/* ─────────────── PDF ─────────────── */

/**
 * Upload a PDF file for processing.
 * @param {File} file - A PDF file
 * @returns {Promise<{ content?: string, resultId?: string }>}
 */
export async function uploadPdf(file) {
    const formData = new FormData();
    formData.append('document', file);   // backend expects key: 'document'

    return request(PDF_API_URL, {
        method: 'POST',
        body: formData,
        // No Content-Type — browser sets multipart boundary automatically
    });
}

/**
 * Fetch a previously processed PDF result by ID.
 * @param {string} id
 * @returns {Promise<{ content: string }>}
 */
export async function getPdfResult(id) {
    return request(`${PDF_API_URL}/result/${id}`);
}

/* ─────────────── Camera / Image ─────────────── */

/**
 * Upload a captured or selected image file for processing.
 * @param {File} imageFile - An image file (jpg, jpeg, png)
 * @returns {Promise<{ content?: string, resultId?: string }>}
 */
export async function uploadImageFromCamera(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return request(CAMERA_API_URL, {
        method: 'POST',
        body: formData,
    });
}

/* ─────────────── Audio ─────────────── */

/**
 * Upload an audio file for processing.
 * @param {File} file - An audio file
 * @returns {Promise<any>}
 */
export async function uploadAudio(file) {
    const formData = new FormData();
    formData.append('media', file);

    try {
        const response = await axios.post(`${AUDIO_API_URL}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        if (!error.response || error.code === 'ERR_NETWORK') {
            throw new Error('Backend is unreachable. Please check if the server is running.');
        }
        throw new Error(error.response?.data?.message || error.message || 'Error uploading audio');
    }
}

/**
 * Fetch a previously processed audio result by ID.
 * @param {string} id
 * @returns {Promise<{ content: string }>}
 */
export async function getAudioResult(id) {
    return request(`${AUDIO_API_URL}/result/${id}`);
}
