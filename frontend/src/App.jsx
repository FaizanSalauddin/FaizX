import { useState, useEffect } from "react";
import ChatBot from "./components/ChatBot";
import IntroScreen from "./components/IntroScreen";

const INTRO_KEY = "faizx_intro_shown";

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    // Don't replay on every refresh — show once per session
    return sessionStorage.getItem(INTRO_KEY) !== "1";
  });

  const handleIntroFinish = () => {
    sessionStorage.setItem(INTRO_KEY, "1");
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <IntroScreen onFinish={handleIntroFinish} />}
      <ChatBot />
    </>
  );
}

export default App;