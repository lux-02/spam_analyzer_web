import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "../context/ThemeContext";
import { useEffect } from "react";
import { suppressConsoleErrors } from "../utils/errorHandler";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    suppressConsoleErrors();
  }, []);

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
