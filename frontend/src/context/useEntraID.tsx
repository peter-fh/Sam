import {
  PublicClientApplication,
  Configuration,
} from "@azure/msal-browser";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface EntraIDConfig {
  tenant_id: string;
  client_id: string;
  redirect_uri: string;
  authority: string;
}

export interface EntraIDUser {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
}

interface EntraIDContextType {
  isAuthenticated: boolean;
  user: EntraIDUser | null;
  loading: boolean;
  accessToken: string | null;
  idToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  acquireToken: () => Promise<string | null>;
  refreshToken: () => Promise<boolean>;
  error: string | null;
}

const EntraIDContext = createContext<EntraIDContextType | undefined>(undefined);

interface EntraIDProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function EntraIDProvider({ children, enabled = true }: EntraIDProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<EntraIDUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pca, setPca] = useState<PublicClientApplication | null>(null);

  // Initialize Entra ID configuration and MSAL
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const initializeEntraID = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/entra/config");
        if (!response.ok) {
          throw new Error("Failed to load Entra ID configuration");
        }
        const entraConfig = await response.json();

        const msalConfig: Configuration = {
          auth: {
            clientId: entraConfig.client_id,
            authority: entraConfig.authority,
            redirectUri: window.location.origin + "/auth/callback",
          },
          cache: {
            cacheLocation: "sessionStorage",
            storeAuthStateInCookie: false,
          },
          system: {
            loggerOptions: {
              loggerCallback: (_level, message) => {
                if (import.meta.env.DEV) {
                  console.debug("[MSAL]", message);
                }
              },
            },
          },
        };

        const publicClientApp = new PublicClientApplication(msalConfig);
        await publicClientApp.initialize();
        setPca(publicClientApp);

        // Check if user is already authenticated
        const accounts = publicClientApp.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          publicClientApp.setActiveAccount(account);
          try {
            const tokenResponse = await publicClientApp.acquireTokenSilent({
              scopes: ["openid", "profile", "email"],
              account,
            });
            setAccessToken(tokenResponse.accessToken);
            setIdToken(tokenResponse.idToken);
            sessionStorage.setItem("entra_id_token", tokenResponse.idToken);
            setIsAuthenticated(true);
            setUser({
              id: account.homeAccountId,
              email: account.username,
              name: account.name,
            });
          } catch (silentError) {
            console.debug("Silent token acquisition failed", silentError);
            // User might need to login again
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize Entra ID";
        setError(errorMessage);
        console.error("Failed to initialize Entra ID:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeEntraID();
  }, [enabled]);

  const login = async () => {
    if (!pca) {
      setError("MSAL not initialized");
      return;
    }

    try {
      setError(null);
      const loginResponse = await pca.loginPopup({
        scopes: ["openid", "profile", "email"],
      });

      setAccessToken(loginResponse.accessToken);
      setIdToken(loginResponse.idToken);
      setIsAuthenticated(true);
      if (loginResponse.account) {
        pca.setActiveAccount(loginResponse.account);
      }

      const userInfo: EntraIDUser = {
        id: loginResponse.account?.homeAccountId || "",
        email: loginResponse.account?.username || "",
        name: loginResponse.account?.name,
      };
      setUser(userInfo);

      // Store token in sessionStorage for API calls
      sessionStorage.setItem("entra_id_token", loginResponse.idToken);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error("Login failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    if (!pca) {
      return;
    }

    try {
      setError(null);

      // Call backend logout endpoint
      try {
        await fetch("/api/auth/entra/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            redirect_uri: window.location.origin,
          }),
        });
      } catch (err) {
        console.warn("Backend logout failed, proceeding with client logout", err);
      }

      // Logout from MSAL
      await pca.logout();

      // Clear state
      setIsAuthenticated(false);
      setUser(null);
      setAccessToken(null);
      setIdToken(null);
      sessionStorage.removeItem("entra_id_token");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      console.error("Logout failed:", err);
    }
  };

  const acquireToken = async (): Promise<string | null> => {
    if (!pca) {
      return null;
    }

    try {
      const account = pca.getActiveAccount();
      if (!account) {
        return null;
      }

      const tokenResponse = await pca.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account,
      });

      setAccessToken(tokenResponse.accessToken);
      setIdToken(tokenResponse.idToken);
      sessionStorage.setItem("entra_id_token", tokenResponse.idToken);
      return tokenResponse.accessToken;
    } catch (err) {
      console.error("Failed to acquire token:", err);
      return null;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = await acquireToken();
      return token !== null;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return false;
    }
  };

  const value: EntraIDContextType = {
    isAuthenticated,
    user,
    loading,
    accessToken,
    idToken,
    login,
    logout,
    acquireToken,
    refreshToken,
    error,
  };

  return (
    <EntraIDContext.Provider value={value}>
      {children}
    </EntraIDContext.Provider>
  );
}

export function useEntraID(): EntraIDContextType {
  const context = useContext(EntraIDContext);
  if (context === undefined) {
    throw new Error("useEntraID must be used within an EntraIDProvider");
  }
  return context;
}
