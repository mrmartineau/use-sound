import React from 'react';

import useOnMount from './use-on-mount';

import { HookOptions, PlayOptions, PlayFunction, ReturnedValue } from './types';

export default function useSound<T = any>(
  src: string | string[],
  {
    id,
    volume = 1,
    playbackRate = 1,
    soundEnabled = true,
    interrupt = false,
    onload,
    ...delegated
  }: HookOptions<T> = {} as HookOptions
) {
  const HowlConstructor = React.useRef<HowlStatic | null>(null);
  const activeSpritePlaybackIds = React.useRef<Map<string, number>>(new Map());
  const isMounted = React.useRef(false);

  const [duration, setDuration] = React.useState<number | null>(null);

  const [sound, setSound] = React.useState<Howl | null>(null);

  const handleLoad = function() {
    if (typeof onload === 'function') {
      // @ts-ignore
      onload.call(this);
    }

    if (isMounted.current) {
      // @ts-ignore
      setDuration(this.duration() * 1000);
    }

    // @ts-ignore
    setSound(this);
  };

  // We want to lazy-load Howler, since sounds can't play on load anyway.
  useOnMount(() => {
    import('howler').then(mod => {
      if (!isMounted.current) {
        // Depending on the module system used, `mod` might hold
        // the export directly, or it might be under `default`.
        HowlConstructor.current = mod.Howl ?? mod.default.Howl;

        isMounted.current = true;

        new HowlConstructor.current({
          src: Array.isArray(src) ? src : [src],
          volume,
          rate: playbackRate,
          onload: handleLoad,
          ...delegated,
        });
      }
    });

    return () => {
      isMounted.current = false;
      activeSpritePlaybackIds.current.clear();
    };
  });

  // When the `src` changes, we have to do a whole thing where we recreate
  // the Howl instance. This is because Howler doesn't expose a way to
  // tweak the sound
  React.useEffect(() => {
    if (HowlConstructor.current && sound) {
      setSound(
        new HowlConstructor.current({
          src: Array.isArray(src) ? src : [src],
          volume,
          onload: handleLoad,
          ...delegated,
        })
      );
    }
    // The linter wants to run this effect whenever ANYTHING changes,
    // but very specifically I only want to recreate the Howl instance
    // when the `src` changes. Other changes should have no effect.
    // Passing array to the useEffect dependencies list will result in
    // ifinite loop so we need to stringify it, for more details check
    // https://github.com/facebook/react/issues/14476#issuecomment-471199055
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(src)]);

  // Whenever volume/playbackRate are changed, change those properties
  // on the sound instance.
  React.useEffect(() => {
    if (sound) {
      sound.volume(volume);

      // HACK: When a sprite is defined, `sound.rate()` throws an error, because Howler tries to reset the "_default" sprite, which doesn't exist. This is likely a bug within Howler, but I don’t have the bandwidth to investigate, so instead, we’re ignoring playbackRate changes when a sprite is defined.
      if (!delegated.sprite) {
        sound.rate(playbackRate);
      }
    }
  }, [sound, volume, playbackRate, delegated.sprite]);

  const play: PlayFunction = React.useCallback(
    (options?: PlayOptions) => {
      if (typeof options === 'undefined') {
        options = {};
      }

      if (!sound || (!soundEnabled && !options.forceSoundEnabled)) {
        return;
      }

      if (interrupt) {
        sound.stop();
        activeSpritePlaybackIds.current.clear();
      }

      if (typeof options.playbackRate !== 'undefined' && !delegated.sprite) {
        sound.rate(options.playbackRate);
      }

      const spriteKey = options.id ?? id;
      const playbackId = sound.play(spriteKey);

      if (typeof spriteKey === 'string' && typeof playbackId === 'number') {
        activeSpritePlaybackIds.current.set(spriteKey, playbackId);
      }
    },
    [sound, soundEnabled, interrupt, delegated.sprite, id]
  );

  const stop = React.useCallback(
    id => {
      if (!sound) {
        return;
      }

      if (typeof id === 'string') {
        const playbackId = activeSpritePlaybackIds.current.get(id);
        if (typeof playbackId === 'number') {
          sound.stop(playbackId);
          activeSpritePlaybackIds.current.delete(id);
          return;
        }
      }

      sound.stop(id as number | string | undefined);

      if (typeof id === 'undefined') {
        activeSpritePlaybackIds.current.clear();
      }
    },
    [sound]
  );

  const pause = React.useCallback(
    id => {
      if (!sound) {
        return;
      }

      if (typeof id === 'string') {
        const playbackId = activeSpritePlaybackIds.current.get(id);
        if (typeof playbackId === 'number') {
          sound.pause(playbackId);
          return;
        }
      }

      sound.pause(id as number | string | undefined);
    },
    [sound]
  );

  const returnedValue: ReturnedValue = [
    play,
    {
      sound,
      stop,
      pause,
      duration,
    },
  ];

  return returnedValue;
}

export { useSound };
