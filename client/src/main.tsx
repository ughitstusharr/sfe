import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const meta = document.createElement('meta');
meta.name = 'description';
meta.content = 'Secure File Encryption - Safely encrypt and decrypt your sensitive files with industry-standard encryption. Files never leave your browser.';
document.head.appendChild(meta);

const title = document.createElement('title');
title.textContent = 'Secure File Encryption';
document.head.appendChild(title);

createRoot(document.getElementById("root")!).render(<App />);
