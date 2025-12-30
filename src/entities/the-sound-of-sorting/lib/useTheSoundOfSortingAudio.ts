import { useRef } from 'react';

const MAX_FREQUENCY = 1200;
const MIN_FREQUENCY = 120;
const SUSTAIN_FACTOR = 2;

function arrayValueToFrequency(value: number, maxRange: number): number {
  const normalizedValue = value / maxRange;
  return MIN_FREQUENCY + MAX_FREQUENCY * (normalizedValue * normalizedValue);
}

function useTheSoundOfSortingAudio(): {
  initAudio: () => void;
  playTone: ({
    maxRange,
    toneDurationMs,
    value,
  }: {
    maxRange: number;
    toneDurationMs: number;
    value: number;
  }) => void;
} {
  const audioCtxRef = useRef<AudioContext>(null);
  const compressorRef = useRef<DynamicsCompressorNode>(null);
  const masterGainRef = useRef<GainNode>(null);

  function initAudio(): void {
    if (audioCtxRef.current !== null) {
      return;
    }
    const AudioContextClass = window.AudioContext;
    const ctx = new AudioContextClass();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(20, ctx.currentTime);
    compressor.attack.setValueAtTime(0.025, ctx.currentTime);
    compressor.release.setValueAtTime(0.1, ctx.currentTime);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, ctx.currentTime);
    filter.Q.value = 0.5;
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    compressor.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    audioCtxRef.current = ctx;
    compressorRef.current = compressor;
    masterGainRef.current = masterGain;
  }

  function playTone({
    maxRange,
    toneDurationMs,
    value,
  }: {
    maxRange: number;
    toneDurationMs: number;
    value: number;
  }): void {
    if (audioCtxRef.current === null) {
      return;
    }
    if (compressorRef.current === null) {
      return;
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    const totalDurationSec = (toneDurationMs * SUSTAIN_FACTOR) / 1000;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = arrayValueToFrequency(value, maxRange);
    osc.connect(gainNode);
    gainNode.connect(compressorRef.current);
    const releaseTime = totalDurationSec * 0.4;
    const startTime = ctx.currentTime + 0.01;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.setTargetAtTime(0.2, startTime, 1 / 300);
    const releaseStart = startTime + totalDurationSec - releaseTime;
    gainNode.gain.setTargetAtTime(0, releaseStart, releaseTime / 5);
    osc.start(startTime);
    osc.stop(startTime + totalDurationSec + 0.1);
  }

  return { initAudio, playTone };
}

export default useTheSoundOfSortingAudio;
