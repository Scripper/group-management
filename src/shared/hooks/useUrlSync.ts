import {useEffect, useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
import {autorun, runInAction} from 'mobx';

export interface UrlSyncBinding {
  key: string;
  toUrl: () => string | null;
  fromUrl: (value: string) => void;
  defaultValue?: string;
}

/**
 * Bidirectional sync between MobX observables and URL search params.
 * On mount: hydrates store from URL. While mounted: autorun keeps URL in sync.
 */
export function useUrlSync(bindings: UrlSyncBinding[]): void {
  const [searchParams, setSearchParams] = useSearchParams();

  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  const setParamsRef = useRef(setSearchParams);
  setParamsRef.current = setSearchParams;

  // Hydrate: URL → Store (mount only)
  useEffect(() => {
    const b = bindingsRef.current;
    const hasUrlParams = b.some((p) => searchParams.has(p.key));
    if (!hasUrlParams) return;

    runInAction(() => {
      for (const p of b) {
        const val = searchParams.get(p.key);
        if (val !== null) {
          p.fromUrl(val);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autorun: Store → URL
  useEffect(() => {
    return autorun(() => {
      const b = bindingsRef.current;
      const next = new URLSearchParams();

      for (const p of b) {
        const val = p.toUrl();
        const def = p.defaultValue ?? null;
        if (val != null && val !== '' && val !== def) {
          next.set(p.key, val);
        }
      }

      setParamsRef.current(next, {replace: true});
    });
  }, []);
}
