import { useEffect, useMemo, useState } from "react";
import agentGoLogo from "./assets/Logo/AgentGo_Logo.png";
import agentGoIcon from "./assets/Icon/AgentGo_Icon.png";
import demoAccounts from "./data/demoAccounts.json";
import agentsSeed from "./data/agents.json";

import itcencloitAnswers from "./data/answers/itcencloit.json";
import busaneconomyAnswers from "./data/answers/busaneconomy.json";
import pknuAnswers from "./data/answers/pknu.json";
import dongseoAnswers from "./data/answers/dongseo.json";

import LoginPage from "./pages/LoginPage";
import WorkspacePage from "./pages/WorkspacePage";

const SESSION_KEY = "agentgo-session";
const DEFAULT_BOT_MESSAGE = "해당 답변은 지금 학습중입니다.";
const TITLE_PREFIX = "AgentGo";

const ANSWER_MAP = {
  itcencloit: itcencloitAnswers,
  busaneconomy: busaneconomyAnswers,
  pknu: pknuAnswers,
  dongseo: dongseoAnswers,
};

const logoAssetModules = import.meta.glob("./assets/Logo/*.{png,jpg,jpeg,svg,webp}", {
  eager: true,
  import: "default",
});

const iconAssetModules = import.meta.glob("./assets/Icon/*.{png,jpg,jpeg,svg,webp}", {
  eager: true,
  import: "default",
});

function normalizeAssetKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/g, "")
    .replace(/[_-](logo|icon)$/g, "");
}

function buildAssetMap(modules) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, asset]) => {
      const fileName = path.split("/").pop() || "";
      return [normalizeAssetKey(fileName), asset];
    })
  );
}

const LOGO_ASSET_MAP = buildAssetMap(logoAssetModules);
const ICON_ASSET_MAP = buildAssetMap(iconAssetModules);

function getClientAssetKey(client) {
  return normalizeAssetKey(client.assetKey || client.clientId);
}

function resolveLogoAsset(client) {
  return LOGO_ASSET_MAP[getClientAssetKey(client)] || agentGoLogo;
}

function resolveIconAsset(client) {
  return ICON_ASSET_MAP[getClientAssetKey(client)] || agentGoIcon;
}

const normalizedDemoAccounts = demoAccounts.map((client) => ({
  ...client,
  logo: resolveLogoAsset(client),
  favicon: resolveIconAsset(client),
}));

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

function formatKoreanRelativeDate(dayBefore) {
  if (dayBefore === 0) return "오늘";
  if (dayBefore === -1) return "어제";
  if (dayBefore === -2) return "그저께";

  const date = new Date();
  date.setDate(date.getDate() + dayBefore);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function formatDateLabel(dayBefore) {
  const date = new Date();
  date.setDate(date.getDate() + dayBefore);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function renderMailSummaryTemplate(template, rows) {
  const templateHtml = Array.isArray(template) ? template.join("\n") : template;
  const rowHtml = rows
    .map((item) => {
      const dateLabel = formatDateLabel(item.daybefore);
      return `<tr><td style="padding: 10px 12px; border-bottom: 1px solid #e3e8f0; white-space: nowrap;">${dateLabel}</td><td style="padding: 10px 12px; border-bottom: 1px solid #e3e8f0; white-space: nowrap;">${item.sender}</td><td style="padding: 10px 12px; border-bottom: 1px solid #e3e8f0; font-weight: 600; white-space: nowrap; max-width: 240px; overflow: hidden; text-overflow: ellipsis;">${item.subject}</td><td style="padding: 10px 12px; border-bottom: 1px solid #e3e8f0; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.summary}</td></tr>`;
    })
    .join("");

  const mailListHtml = rows
    .map((item) => {
      const dateLabel = formatDateLabel(item.daybefore);
      const timeLabel = item.time ? ` ${item.time}` : "";
      return `<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border: 1px solid #e8eef5; border-radius: 16px; background: #ffffff; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(31, 52, 86, 0.05);"><div style="display: flex; align-items: center; gap: 12px; min-width: 0;"><div style="flex-shrink: 0; min-width: 102px; padding: 10px 12px; border-radius: 999px; background: #eef4ff; color: #2f6fff; font-weight: 700; font-size: 13px; text-align: center;">${dateLabel}${timeLabel}</div><div style="min-width: 0; display: flex; gap: 8px; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><div style="font-size: 14px; color: #17223b; font-weight: 700; overflow: hidden; text-overflow: ellipsis;">${item.sender}</div><span style="color: #c1c9db;">•</span><div style="font-size: 14px; color: #4f5c78; overflow: hidden; text-overflow: ellipsis;">${item.subject}</div></div></div><div style="flex-shrink: 0; color: #2f6fff; font-size: 15px;">↗</div></div>`;
    })
    .join("");

  return templateHtml
    .replace(/{{rowHtml}}/g, rowHtml)
    .replace(/{{mailListHtml}}/g, mailListHtml)
    .replace(/{{rowsLength}}/g, String(rows.length));
}

function buildWeeklyMailSummary(rows) {
  return renderMailSummaryTemplate(
    `<div style="font-size: 15px; color: #17223b; line-height: 1.6;"><p style="margin: 0 0 8px; font-weight: 700;">이번 주 수신한 메일 요약 결과입니다.</p><div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #17223b; text-align: left;"><thead><tr><th style="padding: 10px 12px; border-bottom: 2px solid #cbd5e1; font-weight: 700;">날짜</th><th style="padding: 10px 12px; border-bottom: 2px solid #cbd5e1; font-weight: 700;">발신자</th><th style="padding: 10px 12px; border-bottom: 2px solid #cbd5e1; font-weight: 700;">제목</th><th style="padding: 10px 12px; border-bottom: 2px solid #cbd5e1; font-weight: 700;">주요 내용 요약</th></tr></thead><tbody>{{rowHtml}}</tbody></table></div><div style="margin-top: 16px;"><div style="color: #17223b; font-weight: 700; font-size: 15px; margin-bottom: 12px;">📧 메일 목록 ({{rowsLength}}개)</div>{{mailListHtml}}</div></div>`,
    rows
  );
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
        visibleAgents: matched.visibleAgents || [],
      };
    }
  }

  return null;
}

function findBotAnswer(clientId, questionText) {
  const normalized = normalizeQuestion(questionText);
  if (!normalized) {
    return {
      answer: DEFAULT_BOT_MESSAGE,
      delay: 3,
    };
  }

  const clientAnswers = ANSWER_MAP[clientId] || [];

  const clientMatched = clientAnswers.find(
    (item) => normalizeQuestion(item.question) === normalized
  );
  if (clientMatched) {
    const payload = {
      answer: clientMatched.answer,
      delay: typeof clientMatched.delay === "number" ? clientMatched.delay : 3,
      agentId: clientMatched.agentId || null,
    };

    if (clientMatched.mailSummaryRows) {
      if (clientMatched.mailSummaryTemplate) {
        payload.richHtml = renderMailSummaryTemplate(
          clientMatched.mailSummaryTemplate,
          clientMatched.mailSummaryRows
        );
      } else {
        payload.richHtml = buildWeeklyMailSummary(clientMatched.mailSummaryRows);
      }
    }

    return payload;
  }

  return {
    answer: DEFAULT_BOT_MESSAGE,
    delay: 3,
    agentId: null,
  };
}

function getChatStorageKey(session) {
  return `agentgo-chat:${session.clientId}:${session.username}`;
}

function getAgentStorageKey(session) {
  return `agentgo-agents:${session.clientId}:${session.username}`;
}

function getWorkSummaryData(clientId) {
  const clientAnswers = ANSWER_MAP[clientId] || [];
  const summaryEntry = clientAnswers.find(
    (item) => item && typeof item === "object" && item.workSummary
  );
  if (summaryEntry?.workSummary) {
    return summaryEntry.workSummary;
  }

  const defaultSummaryEntry = (ANSWER_MAP.itcencloit || []).find(
    (item) => item && typeof item === "object" && item.workSummary
  );

  return defaultSummaryEntry?.workSummary || null;
}

function getClientQuestions(clientId) {
  const clientAnswers = ANSWER_MAP[clientId] || [];
  const questions = clientAnswers
    .map((item) => item?.question)
    .filter((question) => typeof question === "string")
    .filter((question) => !question.startsWith("__"));

  return Array.from(new Set(questions));
}

export default function App() {
  const [session, setSession] = useState(() => readStorage(SESSION_KEY, null));

  const theme = lightTheme;

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const currentClient = useMemo(() => {
    if (!session) return null;
    return (
      normalizedDemoAccounts.find((client) => client.clientId === session.clientId) ||
      null
    );
  }, [session]);

  useEffect(() => {
    const activeClientName = currentClient?.clientName || session?.clientName;
    document.title = activeClientName
      ? `${TITLE_PREFIX}-${activeClientName}`
      : TITLE_PREFIX;

    let faviconLink = document.querySelector("link[rel='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.setAttribute("rel", "icon");
      document.head.appendChild(faviconLink);
    }

    const faviconHref = currentClient?.favicon || agentGoIcon;
    const faviconType = /\.jpe?g$/i.test(faviconHref)
      ? "image/jpeg"
      : "image/png";

    faviconLink.setAttribute("type", faviconType);
    faviconLink.setAttribute("href", faviconHref);
  }, [currentClient, session]);

  const handleLoginSuccess = (matchedAccount) => {
    setSession({
      clientId: matchedAccount.clientId,
      clientName: matchedAccount.clientName,
      username: matchedAccount.username,
      roleLabel: matchedAccount.roleLabel,
      visibleAgents: matchedAccount.visibleAgents || [],
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
          clients={normalizedDemoAccounts}
          onLoginSuccess={handleLoginSuccess}
          fallbackLogo={agentGoLogo}
          findMatchedAccount={findMatchedAccount}
        />
      ) : (
        <WorkspacePage
          theme={theme}
          session={session}
          currentClient={currentClient}
          fallbackLogo={agentGoLogo}
          onLogout={handleLogout}
          agentsSeed={agentsSeed}
          findBotAnswer={findBotAnswer}
          getChatStorageKey={getChatStorageKey}
          getAgentStorageKey={getAgentStorageKey}
          workSummaryData={getWorkSummaryData(session.clientId)}
          quickQuestionList={getClientQuestions(session.clientId)}
        />
      )}
    </div>
  );
}

const lightTheme = {
  pageBackground: "#ffffff",
  workspaceBackground: "#ffffff",
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