import Image from 'next/image';

export default function Splashscreen({ onStart }: { onStart: () => void }) {
  return (
    <div className={'flex flex-col h-screen justify-center bg-slate-800 text-white'}>
      <h1 className={'text-4xl font-extrabold mb-6'}>The Last Survivor</h1>
      <h2 className={'text-xl font-normal mb-12'}>An Interactive Storybook Experience</h2>
      <caption className={'text-base font-normal mb-12'}>Created by Hannibal Marcellus Munk</caption>
      <main>
        <button onClick={openOverlay()}>Start Experience</button>
        <div className={'absolute w-full max-w-screen-md flex flex-col justify-center bg-black'}>
          <h1 className={'text-2xl font-extrabold'}>Choose your Controller Setting</h1>
          <p>
            This interactive experience offers two ways to control the player: You can either use your keyboard and mouse, or you can use the orientation of your hands and distance between your
            fingers (requires webcam)
          </p>
          <div className={'flex flex-row gap-4 w-full m-6'}>
            <span>
              <Image />
            </span>
            <span></span>
          </div>
        </div>
      </main>
      <caption className={'text-base font-bold mb-12'}>(Work in Progress)</caption>
    </div>
  );
}
