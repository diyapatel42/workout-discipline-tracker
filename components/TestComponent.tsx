"use client";

// Import example for using shared imports 
// Use relative paths for reliable imports
import { useState, useEffect, useRouter } from '../utils/sharedImports';

export default function TestComponent() {
  const [count, setCount] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    console.log('Component mounted');
  }, []);
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => router.push('/')}>Go Home</button>
    </div>
  );
}
