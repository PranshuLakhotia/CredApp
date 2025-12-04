"use client";

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http, type Config } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// SSR-safe config with only injected connector
const ssrConfig = createConfig({
  chains: [polygonAmoy, polygon],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
  ssr: true,
});

// Client-side config with WalletConnect (created lazily)
let clientConfig: Config | null = null;

const getClientConfig = (): Config => {
  if (clientConfig) return clientConfig;
  
  const connectors = projectId
    ? [
        injected({ shimDisconnect: true }),
        walletConnect({
          projectId,
          showQrModal: true,
          metadata: {
            name: 'CredHub',
            description: 'Verifiable Credentials Platform',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://credhub.vercel.app',
            icons: [`${typeof window !== 'undefined' ? window.location.origin : 'https://credhub.vercel.app'}/logo.png`],
          },
        }),
      ]
    : [injected({ shimDisconnect: true })];

  clientConfig = createConfig({
    chains: [polygonAmoy, polygon],
    connectors,
    transports: {
      [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology'),
      [polygon.id]: http('https://polygon-rpc.com'),
    },
    ssr: true,
  });

  return clientConfig;
};

// Create react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export default function Web3Provider({ children }: Web3ProviderProps) {
  const [config, setConfig] = useState<Config>(ssrConfig);

  useEffect(() => {
    // Switch to client config with WalletConnect after mount
    setConfig(getClientConfig());
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
