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
  const isHowlerLoaded = React.useRef(false);
  const latestLoadId = React.useRef(0);
  const activeSoundRef = React.useRef<Howl | null>(null);
  const activeSpritePlaybackIds = React.useRef<Map<string, Set<number>>>(
    new Map()
  );
  const isMounted = React.useRef(false);
  const hasSprite = Boolean(delegated.sprite);

  const [duration, setDuration] = React.useState<number | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  const [sound, setSound] = React.useState<Howl | null>(null);

  // We want to lazy-load Howler, since sounds can't play on load anyway.
  useOnMount(() => {
    isMounted.current = true;

    import('howler').then(mod => {
      if (!isMounted.current) {
        return;
      }

      // Depending on the module system used, `mod` might hold
      // the export directly, or it might be under `default`.
      HowlConstructor.current = mod.Howl ?? mod.default.Howl;
      isHowlerLoaded.current = true;
      setIsReady(true);
    });

    return () => {
      isMounted.current = false;
      isHowlerLoaded.current = false;
      latestLoadId.current += 1;
      if (activeSoundRef.current) {
        activeSoundRef.current.stop();
        activeSoundRef.current.unload();
        activeSoundRef.current = null;
      }
      activeSpritePlaybackIds.current.clear();
    };
  });

  // When the `src` changes, we have to do a whole thing where we recreate
  // the Howl instance. This is because Howler doesn't expose a way to
  // tweak the sound
  React.useEffect(() => {
    if (!HowlConstructor.current || !isHowlerLoaded.current) {
      return;
    }

    const currentLoadId = latestLoadId.current + 1;
    latestLoadId.current = currentLoadId;

    const handleLoad = function(this: Howl) {
      if (typeof onload === 'function') {
        onload.call(this);
      }

      if (!isMounted.current || currentLoadId !== latestLoadId.current) {
        return;
      }

      setDuration(this.duration() * 1000);
    };

    const nextSound = new HowlConstructor.current({
      src: Array.isArray(src) ? src : [src],
      volume,
      rate: playbackRate,
      onload: handleLoad,
      ...delegated,
    });

    setSound(previousSound => {
      if (previousSound) {
        previousSound.stop();
        previousSound.unload();
      }
      return nextSound;
    });
    activeSoundRef.current = nextSound;

    // The linter wants to run this effect whenever ANYTHING changes,
    // but very specifically I only want to recreate the Howl instance
    // when the `src` changes. Other changes should have no effect.
    // Passing array to the useEffect dependencies list will result in
    // ifinite loop so we need to stringify it, for more details check
    // https://github.com/facebook/react/issues/14476#issuecomment-471199055
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(src), isReady]);

  // Whenever volume/playbackRate are changed, change those properties
  // on the sound instance.
  React.useEffect(() => {
    if (sound) {
      sound.volume(volume);

      // HACK: When a sprite is defined, `sound.rate()` throws an error, because Howler tries to reset the "_default" sprite, which doesn't exist. This is likely a bug within Howler, but I don’t have the bandwidth to investigate, so instead, we’re ignoring playbackRate changes when a sprite is defined.
      if (!hasSprite) {
        sound.rate(playbackRate);
      }
    }
  }, [sound, volume, playbackRate, hasSprite]);

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

      if (typeof options.playbackRate !== 'undefined' && !hasSprite) {
        sound.rate(options.playbackRate);
      }

      const spriteKey = options.id ?? id;
      const playbackId = sound.play(spriteKey);

      if (typeof spriteKey === 'string' && typeof playbackId === 'number') {
        const playbackIdsForKey =
          activeSpritePlaybackIds.current.get(spriteKey) ?? new Set<number>();

        playbackIdsForKey.add(playbackId);
        activeSpritePlaybackIds.current.set(spriteKey, playbackIdsForKey);

        sound.once(
          'end',
          () => {
            const ids = activeSpritePlaybackIds.current.get(spriteKey);
            if (!ids) {
              return;
            }
            ids.delete(playbackId);
            if (ids.size === 0) {
              activeSpritePlaybackIds.current.delete(spriteKey);
            }
          },
          playbackId
        );
      }
    },
    [sound, soundEnabled, interrupt, hasSprite, id]
  );

  const stop = React.useCallback(
    id => {
      if (!sound) {
        return;
      }

      if (typeof id === 'string') {
        const playbackIds = activeSpritePlaybackIds.current.get(id);
        if (playbackIds && playbackIds.size > 0) {
          playbackIds.forEach(playbackId => {
            sound.stop(playbackId);
          });
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
        const playbackIds = activeSpritePlaybackIds.current.get(id);
        if (playbackIds && playbackIds.size > 0) {
          playbackIds.forEach(playbackId => {
            sound.pause(playbackId);
          });
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
