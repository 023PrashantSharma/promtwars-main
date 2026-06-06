/* ============================================
   Voice Service — Browser Audio Recorder
   ============================================ */

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private onStateChange: ((state: RecordingState) => void) | null = null;

  private state: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
  };

  setStateCallback(callback: (state: RecordingState) => void): void {
    this.onStateChange = callback;
  }

  private updateState(partial: Partial<RecordingState>): void {
    this.state = { ...this.state, ...partial };
    this.onStateChange?.(this.state);
  }

  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getSupportedMimeType(),
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        this.updateState({
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioUrl,
        });

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.start(250); // Collect data every 250ms
      this.startTime = Date.now();

      // Duration timer
      this.durationInterval = setInterval(() => {
        this.updateState({
          duration: Math.floor((Date.now() - this.startTime) / 1000),
        });
      }, 1000);

      this.updateState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
        error: null,
      });
    } catch (error) {
      this.updateState({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to access microphone. Please grant permission.',
      });
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.updateState({ isPaused: true });
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.updateState({ isPaused: false });
    }
  }

  getState(): RecordingState {
    return this.state;
  }

  private getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'audio/webm';
  }
}
