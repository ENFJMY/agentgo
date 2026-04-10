import { useEffect, useMemo, useState } from "react";

function AccountRow({ label, value, theme }) {
  return (
    <div style={styles.accountInfoRow}>
      <span style={{ ...styles.accountInfoLabel, color: theme.label }}>
        {label}
      </span>
      <span style={{ ...styles.accountInfoValue, color: theme.primaryText }}>
        {value}
      </span>
    </div>
  );
}

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
    case "copy":
      return (
        <svg {...props}>
          <rect
            x="9"
            y="7"
            width="9"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M6 15V6a2 2 0 0 1 2-2h7"
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

export default function LoginPage({
  theme,
  clients,
  onLoginSuccess,
  fallbackLogo,
  findMatchedAccount,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [copiedUsername, setCopiedUsername] = useState("");

  const matchedAccount = useMemo(() => {
    return findMatchedAccount(clients, username, password);
  }, [clients, username, password, findMatchedAccount]);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setLoginMessage("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (!matchedAccount) {
      setLoginMessage("일치하는 계정이 없습니다.");
      return;
    }

    onLoginSuccess(matchedAccount);
  };

  const handleCopyUsername = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedUsername(value);
      setTimeout(() => setCopiedUsername(""), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginTopRight}>
        <button
          type="button"
          style={{
            ...styles.circleIconButton,
            backgroundColor: theme.surface,
            color: theme.primaryText,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.softShadow,
          }}
          onClick={() => setIsHelpOpen(true)}
          aria-label="계정 안내"
        >
          ?
        </button>
      </div>

      <div style={styles.loginCenter}>
        <div
          style={{
            ...styles.loginCard,
            backgroundColor: theme.surface,
            boxShadow: theme.cardShadow,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div style={styles.loginLogoWrap}>
            <img
              src={fallbackLogo}
              alt="AgentGo 로고"
              style={styles.loginLogo}
            />
          </div>

          <div style={{ ...styles.loginTitle, color: theme.title }}>
            AgentGo Demo
          </div>

          <p style={{ ...styles.loginSubText, color: theme.secondaryText }}>
            계정을 입력해서 데모 환경으로 진입하세요.
          </p>

          <div style={styles.fieldBlock}>
            <label style={{ ...styles.fieldLabel, color: theme.label }}>
              아이디
            </label>
            <input
              type="text"
              value={username}
              placeholder="아이디 입력"
              onChange={(event) => {
                setUsername(event.target.value);
                if (loginMessage) setLoginMessage("");
              }}
              style={{
                ...styles.textInput,
                backgroundColor: theme.inputBackground,
                color: theme.primaryText,
                border: `1px solid ${theme.inputBorder}`,
              }}
            />
          </div>

          <div style={styles.fieldBlock}>
            <label style={{ ...styles.fieldLabel, color: theme.label }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              placeholder="비밀번호 입력"
              onChange={(event) => {
                setPassword(event.target.value);
                if (loginMessage) setLoginMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleLogin();
                }
              }}
              style={{
                ...styles.textInput,
                backgroundColor: theme.inputBackground,
                color: theme.primaryText,
                border: `1px solid ${theme.inputBorder}`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            style={{
              ...styles.loginButton,
              backgroundColor: theme.buttonBackground,
              color: theme.buttonText,
            }}
          >
            로그인
          </button>

          {loginMessage ? (
            <div
              style={{
                ...styles.infoMessage,
                backgroundColor: theme.messageBackground,
                color: theme.messageText,
                border: `1px solid ${theme.messageBorder}`,
              }}
            >
              {loginMessage}
            </div>
          ) : null}
        </div>
      </div>

      {isHelpOpen ? (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsHelpOpen(false)}
        >
          <div
            style={{
              ...styles.modalCard,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.modalShadow,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={{ ...styles.modalTitle, color: theme.primaryText }}>
                계정 안내
              </h2>
              <button
                type="button"
                style={{ ...styles.closeButton, color: theme.secondaryText }}
                onClick={() => setIsHelpOpen(false)}
              >
                ×
              </button>
            </div>

            <p style={{ ...styles.modalDescription, color: theme.secondaryText }}>
              고객사별 계정과 기본 비밀번호를 여기서 확인할 수 있습니다.
            </p>

            <div style={styles.modalScrollArea}>
              <div style={styles.clientHelpGrid}>
                {clients.map((client) => (
                  <div
                    key={client.clientId}
                    style={{
                      ...styles.clientHelpCard,
                      backgroundColor: theme.cardSoft,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div
                      style={{
                        ...styles.clientHelpHeader,
                        borderBottom: `1px solid ${theme.border}`,
                      }}
                    >
                      <div style={styles.clientHelpHeaderLeft}>
                        <ClientLogo
                          src={client.logo}
                          fallbackSrc={fallbackLogo}
                          alt={`${client.clientName} 로고`}
                          style={mergeLogoStyle(
                            styles.clientHelpLogo,
                            client.logoSize?.help
                          )}
                        />
                        <div
                          style={{
                            ...styles.clientHelpTitle,
                            color: theme.primaryText,
                          }}
                        >
                          {client.clientName}
                        </div>
                      </div>
                    </div>

                    {client.accounts.map((account, index) => (
                      <div
                        key={`${client.clientId}-${account.username}`}
                        style={{
                          ...styles.clientHelpAccountSection,
                          borderBottom:
                            index !== client.accounts.length - 1
                              ? `1px solid ${theme.border}`
                              : "none",
                        }}
                      >
                        <AccountRow
                          label="계정 구분"
                          value={account.roleLabel}
                          theme={theme}
                        />

                        <div style={styles.accountInfoRow}>
                          <span
                            style={{
                              ...styles.accountInfoLabel,
                              color: theme.label,
                            }}
                          >
                            아이디
                          </span>

                          <div style={styles.accountValueActionWrap}>
                            <span
                              style={{
                                ...styles.accountInfoValue,
                                color: theme.primaryText,
                              }}
                            >
                              {account.username}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleCopyUsername(account.username)}
                              style={{
                                ...styles.smallIconButton,
                                backgroundColor: theme.surface,
                                color: theme.primaryText,
                                border: `1px solid ${theme.border}`,
                              }}
                              title="아이디 복사"
                            >
                              <Icon name="copy" size={16} />
                            </button>
                          </div>
                        </div>

                        <AccountRow
                          label="비밀번호"
                          value={account.password}
                          theme={theme}
                        />

                        {copiedUsername === account.username ? (
                          <div
                            style={{
                              ...styles.copiedText,
                              color: theme.accent,
                            }}
                          >
                            아이디가 복사되었습니다.
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                ...styles.modalFooter,
                color: theme.secondaryText,
                borderTop: `1px solid ${theme.border}`,
              }}
            >
              모든 기본 비밀번호는 123456으로 설정되어 있습니다.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  loginPage: {
    minHeight: "100vh",
    position: "relative",
  },
  loginTopRight: {
    position: "absolute",
    top: 24,
    right: 24,
    display: "flex",
    gap: 10,
    zIndex: 10,
  },
  loginCenter: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
  },
  loginCard: {
    width: "100%",
    maxWidth: "520px",
    borderRadius: "26px",
    padding: "40px 36px",
  },
  loginLogoWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "18px",
  },
  loginLogo: {
    width: "220px",
    height: "220px",
    objectFit: "contain",
  },
  loginTitle: {
    fontSize: "40px",
    fontWeight: 800,
    textAlign: "center",
    marginBottom: "10px",
  },
  loginSubText: {
    textAlign: "center",
    fontSize: "15px",
    marginTop: 0,
    marginBottom: "26px",
  },
  fieldBlock: {
    marginBottom: "16px",
  },
  fieldLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 700,
    textAlign: "left",
  },
  textInput: {
    width: "100%",
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "15px",
    outline: "none",
  },
  loginButton: {
    width: "100%",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    marginTop: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  infoMessage: {
    marginTop: "16px",
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  circleIconButton: {
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    fontSize: "22px",
    fontWeight: 700,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(9, 15, 27, 0.34)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 50,
  },
  modalCard: {
    width: "100%",
    maxWidth: "820px",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    maxHeight: "84vh",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    flexShrink: 0,
  },
  modalTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    cursor: "pointer",
    lineHeight: 1,
  },
  modalDescription: {
    marginTop: 0,
    marginBottom: "18px",
    fontSize: "15px",
    lineHeight: 1.6,
    flexShrink: 0,
  },
  modalScrollArea: {
    overflowY: "auto",
    paddingRight: "6px",
  },
  modalFooter: {
    marginTop: "16px",
    paddingTop: "14px",
    fontSize: "13px",
    flexShrink: 0,
  },
  clientHelpGrid: {
    display: "grid",
    gap: "14px",
  },
  clientHelpCard: {
    borderRadius: "18px",
    overflow: "hidden",
  },
  clientHelpHeader: {
    padding: "14px 16px",
  },
  clientHelpHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  clientHelpLogo: {
    width: "34px",
    height: "34px",
    objectFit: "contain",
    borderRadius: "8px",
    flexShrink: 0,
  },
  clientHelpTitle: {
    fontSize: "15px",
    fontWeight: 800,
  },
  clientHelpAccountSection: {
    padding: "14px 16px",
  },
  accountInfoRow: {
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    gap: "12px",
    alignItems: "start",
    marginBottom: "10px",
  },
  accountInfoLabel: {
    fontSize: "14px",
    fontWeight: 700,
    textAlign: "left",
  },
  accountInfoValue: {
    fontSize: "14px",
    textAlign: "left",
    wordBreak: "break-all",
  },
  accountValueActionWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },
  smallIconButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    cursor: "pointer",
    flexShrink: 0,
  },
  copiedText: {
    marginLeft: "122px",
    marginTop: "2px",
    fontSize: "13px",
    fontWeight: 700,
  },
};