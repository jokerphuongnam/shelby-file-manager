import { Network } from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import type { ShelbyClientConfig } from "@shelby-protocol/sdk/node";
import { config } from "../config/env";

type ShelbyNetwork = Network.LOCAL | Network.TESTNET | Network.SHELBYNET;

function resolveNetwork(network: string): ShelbyNetwork {
  const map: Record<string, ShelbyNetwork> = {
    testnet: Network.TESTNET,
    local: Network.LOCAL,
    shelbynet: Network.SHELBYNET,
  };
  return map[network] ?? Network.TESTNET;
}

const shelbyConfig: ShelbyClientConfig = {
  network: resolveNetwork(config.aptos.network),
  apiKey: config.shelby.apiKey,
};

let _shelbyClient: ShelbyNodeClient | null = null;

export function getShelbyClient(): ShelbyNodeClient {
  if (!_shelbyClient) {
    _shelbyClient = new ShelbyNodeClient(shelbyConfig);
  }
  return _shelbyClient;
}

export function getShelbyConfig(): ShelbyClientConfig {
  return shelbyConfig;
}
