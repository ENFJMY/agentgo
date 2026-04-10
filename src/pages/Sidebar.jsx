import { useEffect, useRef, useState } from "react";

const MENU_ITEMS = [
  { id: "home", label: "Hi, AgentGo", icon: "home" },
  { id: "daily-summary", label: "오늘의 업무 요약", icon: "summary" },
  { id: "activity", label: "나의 활동", icon: "activity" },
  { id: "agent-settings", label: "나의 에이전트 설정", icon: "settings" },
];

function ClientLogo({ src, fallbackSrc, alt, style }) {
  const [hasError, setHasError] = useState(false);
  const finalSrc = !src || hasError ? fallbackSrc : src;

  useEffect(() => {
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <img
      src={finalSrc}
      alt={alt}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

function mergeLogoStyle(baseStyle, overrideStyle) {
  if (!overrideStyle) return baseStyle;

  return {
    ...baseStyle,
    ...Object.fromEntries(
      Object.entries(overrideStyle).filter(([, value]) => value !== undefined)
    ),
  };
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
    case "inquiry":
      return (
        <svg {...props}>
          <path
            d="M5.5 6.5h13v8h-6l-3.5 3v-3h-3.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "mode":
      return (
        <svg {...props}>
          <path
            d="M7.2 8.2a5.2 5.2 0 0 1 7.9-1.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="m15.4 4.5-.3 2.7-2.7-.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.8 15.8a5.2 5.2 0 0 1-7.9 1.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="m8.6 19.5.3-2.7 2.7.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "logout":
      return (
        <svg {...props}>
          <path
            d="M11 5.5h-4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m13.5 9.5 3 2.5-3 2.5M16.5 12H9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...props}>
          <path
            d="m10 7 5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "moon":
      return (
        <svg {...props}>
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
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
  const expandedLogoStyle = mergeLogoStyle(
    styles.sidebarBrandLogo,
    currentClient?.logoSize?.sidebar
  );
  const collapsedLogoStyle = mergeLogoStyle(
    styles.sidebarBrandLogoCollapsed,
    currentClient?.logoSize?.collapsed
  );
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isModeSubMenuOpen, setIsModeSubMenuOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isInquiryCompleteOpen, setIsInquiryCompleteOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState("");
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryDetail, setInquiryDetail] = useState("");
  const accountMenuRef = useRef(null);

  const resetInquiryForm = () => {
    setInquiryType("");
    setInquiryTitle("");
    setInquiryDetail("");
  };

  const closeInquiryModal = () => {
    setIsInquiryModalOpen(false);
    resetInquiryForm();
  };

  const isInquiryFormValid =
    inquiryType.trim() && inquiryTitle.trim() && inquiryDetail.trim();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
        setIsModeSubMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
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
            style={isSidebarCollapsed ? collapsedLogoStyle : expandedLogoStyle}
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
                boxShadow: isActive
                  ? "0 6px 14px rgba(28, 56, 105, 0.08)"
                  : "none",
              }}
            >
              {!isSidebarCollapsed && isActive ? (
                <span style={{ ...styles.sidebarMenuAccent, backgroundColor: theme.accent }} />
              ) : null}

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
        <div style={styles.accountMenuWrap} ref={accountMenuRef}>
          {isAccountMenuOpen ? (
            <div
              style={{
                ...styles.accountDropdown,
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.dropdownShadow,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  setIsInquiryModalOpen(true);
                }}
                style={{ ...styles.accountDropdownButton, color: theme.primaryText }}
              >
                <span style={styles.accountDropdownButtonLeft}>
                  <Icon name="inquiry" size={15} />
                  문의하기
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsModeSubMenuOpen((prev) => !prev)}
                style={{ ...styles.accountDropdownButton, color: theme.primaryText, width: "100%" }}
              >
                <span style={styles.accountDropdownButtonLeft}>
                  <Icon name="mode" size={15} />
                  모드 변경
                </span>
                <Icon name="chevron-right" size={14} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  onLogout();
                }}
                style={{ ...styles.accountDropdownButton, color: theme.primaryText }}
              >
                <span style={styles.accountDropdownButtonLeft}>
                  <Icon name="logout" size={15} />
                  로그아웃
                </span>
              </button>
            </div>
          ) : null}

          {isAccountMenuOpen && isModeSubMenuOpen && (
            <div
              style={{
                ...styles.modeSubMenu,
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.dropdownShadow,
              }}
            >
              <button
                type="button"
                style={{ ...styles.modeSubMenuItem, color: theme.primaryText }}
              >
                <Icon name="sun" size={15} />
                Light 모드
              </button>
              <button
                type="button"
                style={{ ...styles.modeSubMenuItem, color: theme.primaryText }}
              >
                <Icon name="moon" size={15} />
                Dark 모드
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
            style={{
              ...styles.accountTrigger,
              justifyContent: isSidebarCollapsed ? "center" : "flex-start",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.surface,
            }}
          >
            <span
              style={{
                ...styles.sidebarProfileAvatar,
                backgroundColor: theme.sidebarAvatarBackground,
                color: theme.accent,
              }}
            >
              <Icon name="user" size={18} />
            </span>

            {!isSidebarCollapsed ? (
              <span style={styles.sidebarProfileText}>
                <span
                  style={{
                    ...styles.sidebarProfileName,
                    color: theme.primaryText,
                  }}
                >
                  {session.clientName}
                </span>
                <span
                  style={{
                    ...styles.sidebarProfileSub,
                    color: theme.secondaryText,
                  }}
                >
                  {session.username}
                </span>
              </span>
            ) : null}
          </button>
        </div>

        {!isSidebarCollapsed ? (
          <div
            style={{
              ...styles.poweredText,
              color: theme.secondaryText,
            }}
          >
            Powered by AgentGo
          </div>
        ) : null}
      </div>
    </aside>
    {isInquiryModalOpen ? (
      <div style={styles.modalBackdrop}>
        <div
          style={{
            ...styles.inquiryModal,
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.modalShadow,
          }}
        >
          <div style={{ ...styles.inquiryHeader, borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ ...styles.inquiryTitle, color: theme.primaryText }}>문의하기</div>
            <div style={{ ...styles.inquirySub, color: theme.secondaryText }}>
              시스템 관련 문의, 개선 의견, 오류 신고 등을 접수할 수 있습니다.
            </div>
          </div>

          <div
            style={{
              ...styles.inquiryBody,
              backgroundColor: theme.cardSoft,
              border: `1px solid ${theme.borderSoft}`,
            }}
          >
            <label style={styles.inquiryFieldLabel}>유형 <span style={styles.requiredMark}>*</span></label>
            <select
              value={inquiryType}
              onChange={(event) => setInquiryType(event.target.value)}
              style={{
                ...styles.inquirySelect,
                color: inquiryType ? theme.primaryText : theme.placeholderText,
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
              }}
            >
              <option value="">유형 선택</option>
              <option value="문의사항">문의사항</option>
              <option value="오류">오류</option>
            </select>

            <label style={styles.inquiryFieldLabel}>제목 <span style={styles.requiredMark}>*</span></label>
            <input
              type="text"
              value={inquiryTitle}
              onChange={(event) => setInquiryTitle(event.target.value)}
              placeholder="문의 제목을 간단히 입력해주세요"
              style={{
                ...styles.inquiryInput,
                color: theme.primaryText,
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
              }}
            />

            <label style={styles.inquiryFieldLabel}>상세 내용 <span style={styles.requiredMark}>*</span></label>
            <textarea
              value={inquiryDetail}
              onChange={(event) => setInquiryDetail(event.target.value.slice(0, 100))}
              placeholder="문의하고 싶은 내용, 개선하고 싶은 기능 등을 구체적으로 설명해주세요"
              style={{
                ...styles.inquiryTextarea,
                color: theme.primaryText,
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
              }}
            />
            <div style={{ ...styles.inquiryCounter, color: theme.secondaryText }}>
              {inquiryDetail.length}/100
            </div>
          </div>

          <div style={styles.inquiryFooter}>
            <button
              type="button"
              onClick={closeInquiryModal}
              style={{
                ...styles.modalGhostButton,
                color: theme.primaryText,
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: "transparent",
              }}
            >
              취소
            </button>
            <button
              type="button"
              disabled={!isInquiryFormValid}
              onClick={() => {
                setIsInquiryModalOpen(false);
                setIsInquiryCompleteOpen(true);
              }}
              style={{
                ...styles.modalPrimaryButton,
                backgroundColor: isInquiryFormValid
                  ? theme.buttonBackground
                  : theme.sendButtonDisabled,
                color: isInquiryFormValid
                  ? theme.buttonText
                  : theme.sendButtonDisabledText,
                cursor: isInquiryFormValid ? "pointer" : "not-allowed",
              }}
            >
              문의 접수
            </button>
          </div>
        </div>
      </div>
    ) : null}

    {isInquiryCompleteOpen ? (
      <div style={styles.modalBackdrop}>
        <div
          style={{
            ...styles.completeModal,
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.modalShadow,
          }}
        >
          <div style={{ ...styles.completeMessage, color: theme.primaryText }}>
            해당 문의 접수가 정상적으로 완료되었습니다.
          </div>
          <button
            type="button"
            onClick={() => {
              setIsInquiryCompleteOpen(false);
              resetInquiryForm();
            }}
            style={{
              ...styles.modalPrimaryButton,
              backgroundColor: theme.buttonBackground,
              color: theme.buttonText,
              minWidth: "86px",
            }}
          >
            확인
          </button>
        </div>
      </div>
    ) : null}
    </>
  );
}

const styles = {
  sidebar: {
    minHeight: "100vh",
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    display: "flex",
    flexDirection: "column",
    padding: "10px 8px",
    transition: "width 0.2s ease",
  },
  sidebarTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "4px 4px 12px 4px",
  },
  sidebarBrandWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarBrandLogo: {
    width: "150px",
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
    gap: "10px",
    paddingTop: "10px",
  },
  sidebarMenuItem: {
    width: "100%",
    minHeight: "48px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "0 12px 0 10px",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.16s ease",
  },
  sidebarMenuAccent: {
    position: "absolute",
    left: "1px",
    top: "9px",
    width: "3px",
    height: "28px",
    borderRadius: "999px",
  },
  sidebarMenuIconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "18px",
    opacity: 0.92,
  },
  sidebarMenuLabel: {
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    letterSpacing: "-0.1px",
  },
  sidebarFooter: {
    marginTop: "auto",
    padding: "14px 6px 0 6px",
  },
  accountMenuWrap: {
    position: "relative",
  },
  accountDropdown: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    width: "100%",
    borderRadius: "8px",
    zIndex: 12,
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  accountDropdownButton: {
    height: "34px",
    border: "none",
    background: "transparent",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px",
    fontSize: "14px",
    cursor: "pointer",
  },
  accountDropdownButtonLeft: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
  modeSubMenu: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: "calc(100% + 4px)",
    borderRadius: "8px",
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    zIndex: 13,
    minWidth: "130px",
  },
  modeSubMenuItem: {
    height: "34px",
    border: "none",
    background: "transparent",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 10px",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  accountTrigger: {
    width: "100%",
    minHeight: "56px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    cursor: "pointer",
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
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  sidebarProfileName: {
    fontSize: "14px",
    fontWeight: 800,
    lineHeight: 1.2,
  },
  sidebarProfileSub: {
    fontSize: "12px",
    marginTop: "3px",
    wordBreak: "break-all",
  },
  poweredText: {
    marginTop: "14px",
    fontSize: "11px",
    textAlign: "center",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(18, 26, 40, 0.34)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  inquiryModal: {
    width: "100%",
    maxWidth: "640px",
    borderRadius: "10px",
    overflow: "hidden",
  },
  inquiryHeader: {
    padding: "18px 20px 14px",
  },
  inquiryTitle: {
    fontSize: "30px",
    fontWeight: 800,
    lineHeight: 1.2,
  },
  inquirySub: {
    marginTop: "10px",
    fontSize: "14px",
  },
  inquiryBody: {
    margin: "16px 20px 0",
    padding: "14px",
    borderRadius: "8px",
    textAlign: "left",
  },
  inquiryFieldLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    margin: "8px 0 8px",
    color: "#17223b",
    textAlign: "left",
  },
  requiredMark: {
    color: "#ef4444",
  },
  inquirySelect: {
    width: "220px",
    height: "38px",
    borderRadius: "6px",
    padding: "0 10px",
    fontSize: "14px",
    outline: "none",
    display: "block",
    marginLeft: 0,
    textAlign: "left",
  },
  inquiryInput: {
    width: "100%",
    height: "38px",
    borderRadius: "6px",
    padding: "0 10px",
    fontSize: "14px",
    outline: "none",
  },
  inquiryTextarea: {
    width: "100%",
    minHeight: "116px",
    borderRadius: "6px",
    padding: "10px",
    fontSize: "14px",
    lineHeight: 1.45,
    resize: "none",
    outline: "none",
    fontFamily: '"SUIT", Arial, sans-serif',
  },
  inquiryCounter: {
    marginTop: "4px",
    fontSize: "12px",
    textAlign: "right",
  },
  inquiryFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    padding: "14px 20px 18px",
  },
  modalGhostButton: {
    minWidth: "70px",
    height: "36px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  modalPrimaryButton: {
    minWidth: "84px",
    height: "36px",
    borderRadius: "6px",
    border: "none",
    fontSize: "14px",
    fontWeight: 700,
  },
  completeModal: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "10px",
    padding: "24px 22px 18px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
  },
  completeMessage: {
    fontSize: "16px",
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.5,
  },
};