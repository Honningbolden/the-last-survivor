'use client';

import { useState } from 'react';

export default function SplashScreen({ onStart }: { onStart: (useWebcam: boolean) => void }) {
  const [overlay, setOverlay] = useState(false);

  const toggleOverlay = () => {
    setOverlay(!overlay);
    console.log('test');
  };

  return (
    <div className={'flex flex-col h-screen justify-center items-center bg-white text-black'}>
      <h1 className={'text-8xl font-extrabold mb-2'}>The Last Survivor</h1>
      <h2 className={'text-xl font-normal'}>An Interactive Storybook Experience</h2>
      <button
        className='px-6 py-3 font-semibold text-base bg-green-300 rounded-lg my-12'
        onClick={toggleOverlay}>
        Start Experience 🚀
      </button>
      {overlay && (
        <div
          className={
            'absolute h-screen w-screen flex flex-col items-center justify-center p-12 border rounded-3xl bg-white'
          }>
          <h1 className={'text-4xl font-extrabold mb-4'}>Choose your controller setting</h1>
          <p className='text-sm font-normal text-pretty max-w-screen-md text-center mb-8'>
            This interactive experience offers two ways to control the player:
            <br />
            You can either use your keyboard and mouse, or you can use the orientation of your hands
            and distance between your fingers (requires webcam)
          </p>
          <div className={'flex flex-row gap-12 justify-center gap-4 w-full m-6'}>
            <span className='flex flex-col items-center text-xs group'>
              <button
                className='px-6 py-3 font-semibold text-base bg-gray-300 text-gray-600 rounded-lg'
                onClick={() => onStart(false)}>
                🎮 Keyboard & Cursor
              </button>
            </span>
            <button
              className='px-6 py-3 font-semibold text-base bg-green-300 rounded-lg'
              onClick={() => onStart(true)}>
              🤙 Hands & Webcam
            </button>
          </div>
        </div>
      )}
      <p className={'text-base font-normal'}>Created by Hannibal Marcellus Munk</p>
      <p className={'text-base font-bold mb-12'}>(Work in Progress)</p>
    </div>
  );
}
