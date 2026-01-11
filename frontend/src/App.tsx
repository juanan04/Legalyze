import AppRouter from "./router/AppRouter";
import CookieConsent from "./components/common/CookieConsent";

function App() {
  return (
    <>
      <AppRouter />
      <CookieConsent />
    </>
  );
}

export default App;
