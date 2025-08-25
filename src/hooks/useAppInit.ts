// src/hooks/useAppInit.ts
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function useAppInit() {
  const initAuthListener = useStore((s) => s.initAuthListener);

  useEffect(() => {
    // inicia el listener una vez
    initAuthListener();
    // si devuelves una función de unsubscribe en el store,
    // aquí podrías llamarla en el return.
  }, [initAuthListener]);
}
