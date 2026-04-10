# AgentGo Demo

AgentGo Demo는 고객사별 로그인, 로고, 파비콘, 탭 타이틀을 분기해서 보여주는 React + Vite 기반 데모 앱입니다.
## 실행

```bash
npm install
npm run dev
```
프로덕션 빌드는 아래 명령으로 확인합니다.

```bash
npm run build
```
## 브랜딩 자산 규칙

고객사별 브랜딩 자산은 아래 규칙으로 관리합니다.

- 로고 경로: `src/assets/Logo`
- 아이콘 경로: `src/assets/Icon`
- 로고 파일명: `{clientId}_Logo`
- 아이콘 파일명: `{clientId}_Icon`

예시:

- `busaneconomy_Logo.jpg`
- `busaneconomy_Icon.jpg`
- `itcencloit_Logo.png`

확장자는 `png`, `jpg`, `jpeg`, `svg`, `webp`를 사용할 수 있습니다.

앱은 파일명을 소문자 기준으로 정규화해서 찾기 때문에 `_Logo`, `_Icon` 접미사를 기준으로 고객사 자산을 매핑합니다.
## 기본 fallback 규칙

고객사 전용 자산이 없으면 아래 기본 자산을 사용합니다.

- 기본 로고: `src/assets/Logo/AgentGo_Logo.png`
- 기본 아이콘: `src/assets/Icon/AgentGo_Icon.png`
## 고객사 설정

고객사 정보는 `src/data/demoAccounts.json`에서 관리합니다.

주요 필드:

- `clientName`: 탭 타이틀과 UI 표시명
- `clientId`: 브랜딩 자산 매핑 키
- `logoSize.sidebar`: 좌측 GNB 확장 상태 로고 크기
- `logoSize.collapsed`: 좌측 GNB 축소 상태 로고 크기
- `logoSize.help`: 로그인 화면 도움말 로고 크기

예시:

```json
{
	"clientName": "부산경제진흥원",
	"clientId": "busaneconomy",
	"logoSize": {
		"sidebar": { "width": 150, "height": 30 },
		"collapsed": { "width": 24, "height": 24 },
		"help": { "width": 34, "height": 34 }
	}
}
```
## 탭 타이틀 / 파비콘 동작

- 로그인 전: `AgentGo`
- 로그인 후: `AgentGo-{고객사명}`
- 파비콘: 고객사 아이콘이 있으면 해당 아이콘, 없으면 `AgentGo_Icon`
## 배포

GitHub Pages 배포는 `.github/workflows/deploy-github-pages.yml`에서 처리합니다.

- `main` 브랜치에 push되면 자동 배포
- 필요 시 GitHub Actions에서 수동 실행 가능
- Vite `base`는 GitHub Actions 환경에서 저장소 이름 기준으로 자동 설정됩니다
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
