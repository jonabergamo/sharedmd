import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Landing from "./pages/Landing"
import Editor from "./pages/Editor"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/d/:id" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
