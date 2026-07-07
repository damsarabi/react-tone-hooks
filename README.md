# react-tone-hooks

[![npm version](https://badge.fury.io/js/react-tone-hooks.svg)](https://badge.fury.io/js/react-tone-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Production-ready, memory-safe React hooks for [Tone.js](https://tonejs.github.io/) and the Web Audio API.

## The Problem: React Re-renders vs. Web Audio
Integrating Tone.js with React is notoriously difficult. Tone.js audio nodes (Synths, Filters, LFOs) are **not automatically garbage collected** by React's component lifecycle. 

If a component re-renders and recreates an audio graph, the previous nodes remain active in memory. This leads to:
1. **Polyphonic Gain Stacking:** Volume multiplies exponentially on every re-render, causing severe digital clipping.
2. **Memory Leaks:** Stale oscillators run indefinitely in the background.
3. **Race Conditions:** `setTimeout` calls for audio envelopes (like release tails) trigger even if the component unmounts, crashing the destroyed graph.

## The Solution
`react-tone-hooks` bridges React's render cycle with the Web Audio API by enforcing strict, deterministic disposal of audio nodes and asynchronous timeouts.

## Installation

```bash
npm install react-tone-hooks
```
*Note: `react` and `tone` are peer dependencies.*

## Running the Example Locally
This repository includes a working Vite React application demonstrating the hooks in action. To run it locally:

```bash
# 1. Clone the repository
git clone https://github.com/damsarabi/react-tone-hooks.git
cd react-tone-hooks

# 2. Install and build the core library
npm install
npm run build

# 3. Start the example app
cd example
npm install
npm run dev
```

## Usage

### 1. `useToneTracker`
Wrap your Tone.js initializations in `trackNode()`. On component unmount, the hook automatically calls `.dispose()` on every tracked node in the graph, preventing memory leaks.

```tsx
import { useEffect } from 'react';
import * as Tone from 'tone';
import { useToneTracker } from 'react-tone-hooks';

export function SynthComponent() {
  const { trackNode } = useToneTracker();

  useEffect(() => {
    // ❌ BAD: Re-renders will leak this synth in memory
    // const synth = new Tone.PolySynth().toDestination();

    // ✅ GOOD: Synth will be deterministically disposed on unmount
    const synth = trackNode(new Tone.PolySynth().toDestination());
    const filter = trackNode(new Tone.Filter(400, 'lowpass').toDestination());
    
    synth.connect(filter);

    return () => {
      // No manual cleanup required. useToneTracker handles it.
    }
  }, [trackNode]);

  return <button onClick={() => Tone.start()}>Play</button>;
}
```

### 2. `useToneTimeout`
A React-safe wrapper for asynchronous audio scheduling. If the component unmounts, the timeouts are automatically cleared, preventing zombie callbacks from manipulating a destroyed audio graph.

```tsx
import { useToneTimeout } from 'react-tone-hooks';

export function EnvelopeComponent() {
  const { setSafeTimeout } = useToneTimeout();

  const triggerRelease = () => {
    // Allows the release envelope to play out, 
    // but safely cancels if the user navigates away mid-tail.
    setSafeTimeout(() => {
      console.log("Release envelope finished");
    }, 2000);
  };

  return <button onClick={triggerRelease}>Release Note</button>;
}
```

## License
MIT
```