/* ============================================
   Voice Service — Whisper Transcription
   ============================================ */

/**
 * Transcribe audio using OpenAI Whisper API
 * Falls back to returning empty string if no API key
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    const response = await fetch('/api/ai/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Transcription error:', error);
    return '';
  }
}
