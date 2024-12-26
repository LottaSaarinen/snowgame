// MusicPlayer.js
import React, { useEffect } from 'react';
import { Howl } from 'howler';

const MusicPlayer = ({ src }) => {
  useEffect(() => {
    const sound = new Howl({
      src: [src],
      autoplay: true,
      loop: true,
      volume: 0.5
    });

    sound.play();

    return () => {
      sound.unload();
    };
  }, [src]);

  return null;
};

export default MusicPlayer;
