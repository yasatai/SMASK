/* 共通CSSは App より先に読み込む（= 各ページ／コンポーネントのCSSが後勝ちになる順序を担保） */
import "./styles/tokens.css";
import "./styles/base.css";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

/* StrictMode は意図的に外している：
   オープニング等のタイマー演出が dev で二重再生されるのを避け、
   元サイトと同一の挙動を保つため。 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>
);
