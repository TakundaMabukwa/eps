import React, { createContext, useContext, useState } from "react";
import { Appearance } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
    theme: "light",
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemTheme = Appearance.getColorScheme() || "light";
    const [theme, setTheme] = useState<Theme>(systemTheme);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
