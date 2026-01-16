import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";
// Initialize Prism language support (must be imported once)
import "./components/prismLanguages";

function App() {
  return (
    <Router>
      <div className="app">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
