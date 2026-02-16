import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const params = new URLSearchParams(window.location.search);
const redirect = params.get("redirect");
const decodedRedirect = redirect ? decodeURIComponent(redirect) : null;

if (decodedRedirect) {
  window.history.replaceState(null, "", decodedRedirect);
}

createRoot(document.getElementById("root")!).render(<App />);
