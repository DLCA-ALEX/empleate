import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export default function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      if (mounted) setOnline(!!state.isConnected && !!state.isInternetReachable);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return online;
}
