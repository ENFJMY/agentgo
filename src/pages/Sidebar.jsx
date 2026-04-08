import { useState } from "react";

const MENU_ITEMS = [
  { id: "home", label: "Hi, AgentGo", icon: "home" },
  { id: "daily-summary", label: "오늘의 업무 요약", icon: "summary" },
  { id: "activity", label: "나의 활동", icon: "activity" },
  { id: "agent-settings", label: "나의 에이전트 설정", icon: "settings" },
];

function ClientLogo({ src, fallbackSrc, alt, style }) {
  const [hasError, setHasError] = useState(false);
  const finalSrc = !src || hasError ? fallbackSrc : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

function Icon({ name, size = 18 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path
            d="M4.5 11.5 12 5l7.5 6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 10.5v8h11v-8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "summary":
      return (
        <svg {...props}>
          <path
            d="M7 4.5h8l3 3v12H7z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M15 4.5v3h3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M10 12h5M10 15h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "activity":
      return (
        <svg {...props}>
          <path
            d="M5 18.5h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8 16V11M12 16V7M16 16V13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <path
            d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19 12a7 7 0 0 0-.08-1l1.72-1.34-1.5-2.6-2.05.54a7.2 7.2 0 0 0-1.72-1L15 4h-3l-.37 2.6a7.2 7.2 0 0 0-1.72 1l-2.05-.54-1.5 2.6L8.08 11a7 7 0 0 0 0 2l-1.72 1.34 1.5 2.6 2.05-.54c.53.42 1.1.76 1.72 1L12 20h3l.37-2.6c.62-.24 1.2-.58 1.72-1l2.05.54 1.5-2.6L18.92 13c.05-.33.08-.66.08-1Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "sidebar":
      return (
        <svg {...props}>
          <rect
            x="4"
            y="5"
            width="16"
            height="14"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M10 5v14" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle
            cx="12"
            cy="9"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M5.5 19a6.5 6.5 0 0 1 13 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle
            cx="12"
            cy="12"
            r="7"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
  }
}

export default function Sidebar({
  theme,
  session,
  currentClient,
  fallbackLogo,
  onLogout,
  activeMenu,
  setActiveMenu,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) {
  const currentClientLogo = currentClient?.logo || "";

  return (
    <aside
      style={{
        ...styles.sidebar,
        width: isSidebarCollapsed ? 76 : 206,
        backgroundColor: theme.sidebarBackground,
        borderRight: `1px solid ${theme.sidebarBorder}`,
      }}
    >
      <div style={styles.sidebarTop}>
        <div style={styles.sidebarBrandWrap}>
          <ClientLogo
            src={currentClientLogo}
            fallbackSrc={fallbackLogo}
            alt={`${session.clientName} 로고`}
            style={
              isSidebarCollapsed
                ? styles.sidebarBrandLogoCollapsed
                : styles.sidebarBrandLogo
            }
          />
        </div>

        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          style={{
            ...styles.sidebarToggleButton,
            color: theme.secondaryText,
          }}
          title="GNB 열기/닫기"
        >
          <Icon name="sidebar" size={18} />
        </button>
      </div>

      <nav style={styles.sidebarMenu}>
        {MENU_ITEMS.map((item) => {
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveMenu(item.id)}
              style={{
                ...styles.sidebarMenuItem,
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                backgroundColor: isActive
                  ? theme.sidebarItemActiveBackground
                  : "transparent",
                color: isActive
                  ? theme.sidebarItemActiveText
                  : theme.sidebarItemText,
                border: isActive
                  ? `1px solid ${theme.sidebarItemActiveBorder}`
                  : "1px solid transparent",
              }}
            >
              <span style={styles.sidebarMenuIconWrap}>
                <Icon name={item.icon} size={18} />
              </span>

              {!isSidebarCollapsed ? (
                <span style={styles.sidebarMenuLabel}>{item.label}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          ...styles.sidebarFooter,
          borderTop: `1px solid ${theme.sidebarBorder}`,
        }}
      >
        <div style={styles.sidebarProfile}>
          <div
            style={{
              ...styles.sidebarProfileAvatar,
              backgroundColor: theme.sidebarAvatarBackground,
              color: theme.accent,
            }}
          >
            <Icon name="user" size={18} />
          </div>

          {!isSidebarCollapsed ? (
            <div style={styles.sidebarProfileText}>
              <div
                style={{
                  ...styles.sidebarProfileName,
                  color: theme.primaryText,
                }}
              >
                {session.clientName}
              </div>
              <div
                style={{
                  ...styles.sidebarProfileSub,
                  color: theme.secondaryText,
                }}
              >
                {session.username}
              </div>
            </div>
          ) : null}
        </div>

        {!isSidebarCollapsed ? (
          <>
            <div
              style={{
                ...styles.poweredText,
                color: theme.secondaryText,
              }}
            >
              Powered by AgentGo
            </div>

            <button
              type="button"
              onClick={onLogout}
              style={{
                ...styles.logoutButton,
                color: theme.secondaryText,
                border: `1px solid ${theme.sidebarBorder}`,
                backgroundColor: "transparent",
              }}
            >
              로그아웃
            </button>
          </>
        ) : null}
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "12px 10px",
    transition: "width 0.2s ease",
  },
  sidebarTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "4px 4px 10px 4px",
  },
  sidebarBrandWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarBrandLogo: {
    width: "24px",
    height: "24px",
    objectFit: "contain",
    borderRadius: "6px",
  },
  sidebarBrandLogoCollapsed: {
    width: "24px",
    height: "24px",
    objectFit: "contain",
    borderRadius: "6px",
  },
  sidebarToggleButton: {
    width: "32px",
    height: "32px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingTop: "8px",
  },
  sidebarMenuItem: {
    width: "100%",
    minHeight: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 12px",
    cursor: "pointer",
  },
  sidebarMenuIconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "18px",
  },
  sidebarMenuLabel: {
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  sidebarFooter: {
    marginTop: "auto",
    padding: "14px 6px 0 6px",
  },
  sidebarProfile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  sidebarProfileAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sidebarProfileText: {
    minWidth: 0,
  },
  sidebarProfileName: {
    fontSize: "14px",
    fontWeight: 800,
    lineHeight: 1.2,
  },
  sidebarProfileSub: {
    fontSize: "12px",
    marginTop: "4px",
    wordBreak: "break-all",
  },
  poweredText: {
    marginTop: "14px",
    fontSize: "11px",
    textAlign: "center",
  },
  logoutButton: {
    width: "100%",
    marginTop: "10px",
    borderRadius: "10px",
    height: "34px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },
};