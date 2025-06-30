# The Last Survivor: An Interactive Storybook Experience
This project is a product of my 2-week course in Storytelling at The Danish School of Media & Journalism (3rd Semester).

### Brief Creative Explanation
In this project I try to combine the experience of a storybooks with audio players, with the immersion of video games.

#### Story
Waking up in a dusty infirmary on a foreign planet, without any recollection of your identity. The rusty needle in your arm is evident that you're not supposed to be alive. An old helmet and a pair of boots are left at your disposal. You put them on, and open the door to the outside–the atmospheric vacuum immediately puuls out all that was left in the room.
As you walk through the rocky landscape you uncover hidden in artefacts from over-industrialization, and through the fog of amnesia you slowly reveal fragments of your own origin story.

#### How to Play
[Demo hosted on Netlify](#)

Click the link above to try the demo (not live yet).
The story is told in passages: pieces of audio that plays as you progress. Audio passages are represented by spheres and they are triggered by walking into them. When a sphere is **blue** it means that it's ready to be played; when it's **red** it means that this is the audio you want to trigger next but it's predecessor has not finished playing yet.

###### Controls
You'll control yourself in first-person, but you have to options:
1) **Using your hands and webcam**
    * Use your **right index finger** to control where you look.
    * Use the distance between your **left index finger and thumb** to control how fast the player moves forward (you'll always move in the direction you're looking).
        * When you're fingers are touching, you will not move.
        * When you're fingers are spaced far apart you move as full speed.
2) **Keyboard and mouse**
    * W-A-S-D to move the player
    * Cursor controls orientation

#### Tech-Stack
* TypeScript
* React 18 / NextJS 13
* react-three/fiber
* react-three/drei
* framer-motion-3D

***Project is still a work-in-progress.***
