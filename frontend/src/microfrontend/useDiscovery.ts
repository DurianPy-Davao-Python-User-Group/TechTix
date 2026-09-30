import type { DiscoveryManifest } from './RemoteLoader';
import discovery from './discovery.json';

export const useDiscovery = (): DiscoveryManifest => {
  return discovery as unknown as DiscoveryManifest;
};

export default useDiscovery;
