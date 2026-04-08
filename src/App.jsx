import { useEffect, useMemo, useState } from "react";
import agentGoLogo from "./assets/AgentGo_Logo.png";
import demoAccounts from "./data/demoAccounts.json";
import agentsSeed from "./data/agents.json";

import commonAnswers from "./data/answers/common.json";
import itcencloitAnswers from "./data/answers/itcencloit.json";
import busaneconomyAnswers from "./data/answers/busaneconomy.json";
import pknuAnswers from "./data/answers/pknu.json";
import dongseoAnswers from "./data/answers/dongseo.json";

import LoginPage from "./pages/LoginPage";
import WorkspacePage from "./pages/WorkspacePage";

const SESSION_KEY = "agentgo-session";
const THEME_KEY = "agentgo-theme";
const DEFAULT_BOT_MESSAGE = "해당 답변은 지금 학습중입니다.";

const ANSWER_MAP = {
  itcencloit: itcencloitAnswers,
  busaneconomy: busaneconomyAnswers,
  pknu: pknuAnswers,
  dongseo: dongseoAnswers,
};

function readStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function normalizeQuestion(text) {
  return text.replace(/\s+/g, " ").trim();
}

function findMatchedAccount(clients, username, password) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  for (const client of clients) {
    const matched = client.accounts.find(
      (account) =>
        account.username === trimmedUsername &&
        account.password === trimmedPassword
    );

    if (matched) {
      return {
        ...matched,
        clientId: client.clientId,
        clientName: client.clientName,
        logo: client.logo || "",
      };
    }
  }

  return null;
}

function findBotAnswer(clientId, questionText) {
  const normalized = normalizeQuestion(questionText);
  if (!normalized) return DEFAULT_BOT_MESSAGE;

  const clientAnswers = ANSWER_MAP[clientId] || [];

  const clientMatched = clientAnswers.find(
    (item) => normalizeQuestion(item.question) === normalized
  );
  if (clientMatched) return clientMatched.answer;

  const commonMatched = commonAnswers.find(
    (item) => normalizeQuestion(item.question) === normalized
  );
  if (commonMatched) return commonMatched.answer;

  return DEFAULT_BOT_MESSAGE;
}

function getChatStorageKey(session) {
  return `agentgo-chat:${session.clientId}:${session.username}`;
}

function getAgentStorageKey(session) {
  return `agentgo-agents:${session.clientId}:${session.username}`;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) === "dark";
  });

  const [session, setSession] = useState(() => readStorage(SESSION_KEY, null));

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const currentClient = useMemo(() => {
    if (!session) return null;
    return demoAccounts.find((client) => client.clientId === session.clientId) || null;
  }, [session]);

  const handleLoginSuccess = (matchedAccount) => {
    setSession({
      clientId: matchedAccount.clientId,
      clientName: matchedAccount.clientName,
      username: matchedAccount.username,
      roleLabel: matchedAccount.roleLabel,
      logo: matchedAccount.logo || "",
    });
  };

  const handleLogout = () => {
    setSession(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.pageBackground,
        color: theme.primaryText,
        fontFamily: '"SUIT", Arial, sans-serif',
      }}
    >
      <style>{`
        @keyframes agentgoMicPulse {
          0% { box-shadow: 0 0 0 0 rgba(47, 111, 255, 0.45); transform: scale(1); }
          50% { box-shadow: 0 0 0 8px rgba(47, 111, 255, 0.10); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(47, 111, 255, 0); transform: scale(1); }
        }

        * {
          box-sizing: border-box;
        }

        textarea::placeholder,
        input::placeholder {
          color: ${theme.placeholderText};
        }

        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.scrollThumb};
          border-radius: 999px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      {!session ? (
        <LoginPage
          theme={theme}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          clients={demoAccounts}
          onLoginSuccess={handleLoginSuccess}
          fallbackLogo={agentGoLogo}
          findMatchedAccount={findMatchedAccount}
        />
      ) : (
        <WorkspacePage
          theme={theme}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          session={session}
          currentClient={currentClient}
          fallbackLogo={agentGoLogo}
          onLogout={handleLogout}
          agentsSeed={agentsSeed}
          findBotAnswer={findBotAnswer}
          getChatStorageKey={getChatStorageKey}
          getAgentStorageKey={getAgentStorageKey}
        />
      )}
    </div>
  );
}

const lightTheme = {
  pageBackground: "linear-gradient(180deg, #f6f8fc 0%, #f5f7fb 100%)",
  workspaceBackground: "#f7f8fb",
  sidebarBackground: "#eef2f7",
  sidebarBorder: "#d9e0ec",
  sidebarItemText: "#3f4b63",
  sidebarItemActiveText: "#2f6fff",
  sidebarItemActiveBackground: "#ffffff",
  sidebarItemActiveBorder: "#d5def0",
  sidebarAvatarBackground: "#edf3ff",
  surface: "#ffffff",
  cardSoft: "#f8fbff",
  primaryText: "#17223b",
  secondaryText: "#7b879d",
  label: "#4d5b76",
  title: "#17223b",
  border: "#dbe2ee",
  borderSoft: "#e8edf5",
  inputBorder: "#ced7e6",
  inputBackground: "#ffffff",
  buttonBackground: "#2f6fff",
  buttonText: "#ffffff",
  messageBackground: "#edf4ff",
  messageBorder: "#cddcff",
  messageText: "#1f4ec9",
  accent: "#2f6fff",
  softShadow: "0 6px 18px rgba(31, 52, 86, 0.08)",
  cardShadow: "0 12px 30px rgba(31, 52, 86, 0.08)",
  modalShadow: "0 18px 40px rgba(31, 52, 86, 0.16)",
  dropdownShadow: "0 12px 26px rgba(31, 52, 86, 0.12)",
  placeholderText: "#95a1b7",
  scrollThumb: "#c8d4ea",
  tabBackground: "#ffffff",
  tabActiveBackground: "#edf4ff",
  tabText: "#5b6882",
  tabActiveText: "#2f6fff",
  iconSoftBackground: "#edf4ff",
  fileChipBackground: "#f3f6fb",
  sendButtonBackground: "#2f6fff",
  sendButtonDisabled: "#eef2f8",
  sendButtonText: "#ffffff",
  sendButtonDisabledText: "#9ca9bf",
  micActiveBackground: "#eaf1ff",
  userBubbleBackground: "#eef4ff",
  userBubbleText: "#17223b",
  userBubbleBorder: "#cfdcff",
  assistantBubbleBackground: "#ffffff",
  assistantBubbleText: "#17223b",
  assistantBubbleBorder: "#dde4ef",
  userAttachmentBackground: "#f6f9ff",
  assistantAttachmentBackground: "#f7f9fc",
  toggleTrackLight: "#dbe7ff",
  toggleBorderLight: "#c5d7ff",
  toggleThumbLight: "#ffffff",
  toggleIconLight: "#2f6fff",
  toggleTrackDark: "#1b2740",
  toggleBorderDark: "#2d3c5a",
  toggleThumbDark: "#30415f",
  toggleIconDark: "#f8fafc",
  toggleMiniTrackActive: "#2f6fff",
  toggleMiniTrackInactive: "#cdd6e8",
  toggleMiniThumb: "#ffffff",
};

const darkTheme = {
  pageBackground: "linear-gradient(180deg, #0f1727 0%, #121b2e 100%)",
  workspaceBackground: "#0f1727",
  sidebarBackground: "#121b2e",
  sidebarBorder: "#23314a",
  sidebarItemText: "#c3cee3",
  sidebarItemActiveText: "#8ab2ff",
  sidebarItemActiveBackground: "#1a2640",
  sidebarItemActiveBorder: "#28406d",
  sidebarAvatarBackground: "#162540",
  surface: "#151f33",
  cardSoft: "#19253d",
  primaryText: "#f3f7ff",
  secondaryText: "#97a6c2",
  label: "#cfd8ea",
  title: "#f3f7ff",
  border: "#273650",
  borderSoft: "#223048",
  inputBorder: "#2b3a54",
  inputBackground: "#11192a",
  buttonBackground: "#3b78ff",
  buttonText: "#ffffff",
  messageBackground: "#182746",
  messageBorder: "#2a4b8e",
  messageText: "#dbe7ff",
  accent: "#72a1ff",
  softShadow: "0 6px 18px rgba(0, 0, 0, 0.24)",
  cardShadow: "0 14px 34px rgba(0, 0, 0, 0.24)",
  modalShadow: "0 18px 40px rgba(0, 0, 0, 0.35)",
  dropdownShadow: "0 14px 28px rgba(0, 0, 0, 0.32)",
  placeholderText: "#6e7f9e",
  scrollThumb: "#324261",
  tabBackground: "#151f33",
  tabActiveBackground: "#1b2c50",
  tabText: "#9badca",
  tabActiveText: "#8ab2ff",
  iconSoftBackground: "#1a2a46",
  fileChipBackground: "#1b2840",
  sendButtonBackground: "#3b78ff",
  sendButtonDisabled: "#253247",
  sendButtonText: "#ffffff",
  sendButtonDisabledText: "#7e8da8",
  micActiveBackground: "#1b2d53",
  userBubbleBackground: "#1b2d53",
  userBubbleText: "#eef4ff",
  userBubbleBorder: "#2a4b8e",
  assistantBubbleBackground: "#172239",
  assistantBubbleText: "#eef4ff",
  assistantBubbleBorder: "#293651",
  userAttachmentBackground: "#20345e",
  assistantAttachmentBackground: "#1d2942",
  toggleTrackLight: "#dbe7ff",
  toggleBorderLight: "#c5d7ff",
  toggleThumbLight: "#ffffff",
  toggleIconLight: "#2f6fff",
  toggleTrackDark: "#1a2640",
  toggleBorderDark: "#2d3c5a",
  toggleThumbDark: "#30415f",
  toggleIconDark: "#f8fafc",
  toggleMiniTrackActive: "#3b78ff",
  toggleMiniTrackInactive: "#30415f",
  toggleMiniThumb: "#ffffff",
};