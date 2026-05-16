import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/index.css";
import App from "./App";
import "./index.css";

if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(<App />);
