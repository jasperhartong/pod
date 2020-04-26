/* eslint no-extend-native: 0 */

// This file runs before React and Next.js core
// This file is loaded for all browsers
// Next.js includes a number of polyfills only for older browsers like IE11
// Make sure you don't duplicate these in this file
// https://github.com/zeit/next.js/blob/canary/packages/next-polyfill-nomodule/src/index.js
console.log("Load polyfills");

// MediaRecorder polyfill for all browsers: let them all use mp3
import AudioRecorder from "audio-recorder-polyfill";
import mpegEncoder from "audio-recorder-polyfill/mpeg-encoder";

AudioRecorder.encoder = mpegEncoder;
AudioRecorder.prototype.mimeType = "audio/mpeg";
window.MediaRecorder = AudioRecorder;
