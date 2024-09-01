import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import ResetButton from "./components/reset.tsx"
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResetButton />
    <App />
  </StrictMode>,
)
