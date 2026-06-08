import { NpmClientProvider } from '@api-hooks/npm';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

const NPM_TOKEN_KEY = 'mynpmlens:npm_token';

export function persistNpmToken(token: string): void {
  localStorage.setItem(NPM_TOKEN_KEY, token);
}

export function clearNpmToken(): void {
  localStorage.removeItem(NPM_TOKEN_KEY);
}

function readNpmToken(): string {
  return localStorage.getItem(NPM_TOKEN_KEY) ?? '';
}

interface NpmAuthContextValue {
  npmToken: string;
  hasNpmToken: boolean;
  setNpmToken: (token: string) => void;
  clearNpmToken: () => void;
}

const NpmAuthContext = createContext<NpmAuthContextValue>({
  npmToken: '',
  hasNpmToken: false,
  setNpmToken: () => {},
  clearNpmToken: () => {},
});

export const NpmAuthProvider = ({ children }: { children: ReactNode }) => {
  const [npmToken, setStoredNpmToken] = useState(readNpmToken);
  const npmClientOptions = useMemo(() => (npmToken ? { token: npmToken } : undefined), [npmToken]);

  function setNpmToken(token: string) {
    persistNpmToken(token);
    setStoredNpmToken(token);
  }

  function handleClearNpmToken() {
    clearNpmToken();
    setStoredNpmToken('');
  }

  return (
    <NpmAuthContext.Provider
      value={{
        npmToken,
        hasNpmToken: npmToken.length > 0,
        setNpmToken,
        clearNpmToken: handleClearNpmToken,
      }}
    >
      <NpmClientProvider options={npmClientOptions}>{children}</NpmClientProvider>
    </NpmAuthContext.Provider>
  );
};

export function useNpmAuth(): NpmAuthContextValue {
  return useContext(NpmAuthContext);
}
