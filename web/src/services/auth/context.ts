import { createContext } from "react";

import { AuthHook } from "./authHook";

export const AuthContext = createContext<AuthHook | null>(null);
