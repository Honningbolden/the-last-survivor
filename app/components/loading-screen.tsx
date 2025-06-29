'use client';

import { Html, useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className='w-64 p-4 bg-gray-800 text-white'>
        <div className='mb-2'>Loading: {progress.toFixed(0)}%</div>
        <div className='w-full bg-green-600 h-2 rounded overflow-hidden'>
          <div className='bg-green-400 h-full' style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Html>
  );
}
