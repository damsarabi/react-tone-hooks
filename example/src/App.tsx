import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useToneTracker } from 'react-tone-hooks';

function AudioPlayer() {
  const { trackNode } = useToneTracker();
  const synthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    // 1. Create and track the nodes
    const synth = trackNode(new Tone.PolySynth().toDestination());
    const filter = trackNode(new Tone.Filter(800, 'lowpass').toDestination());
    synth.connect(filter);

    // 2. Save reference so the button can play it
    synthRef.current = synth;

    return () => {
      console.log("Component unmounted. react-tone-hooks just disposed the nodes!");
    };
  }, [trackNode]);

  return (
    <button
      onClick={async () => {
        await Tone.start();
        synthRef.current?.triggerAttackRelease(["C4", "E4", "G4"], "8n");
      }}
      style={{ padding: '10px 20px', fontSize: '16px', marginTop: '10px' }}
    >
      Play C Major Chord
    </button>
  );
}

export default function App() {
  const [isMounted, setIsMounted] = useState(true);

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>react-tone-hooks E2E Test</h1>

      <button onClick={() => setIsMounted(!isMounted)}>
        {isMounted ? "Destroy Audio Component" : "Mount Audio Component"}
      </button>

      <br /><br />

      {isMounted && <AudioPlayer />}
    </div>
  );
}