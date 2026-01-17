# StoryLingo 프로젝트 구조

## 프로젝트 개요

**StoryLingo**는 AI를 활용한 영어 학습 애플리케이션입니다. 사용자가 주제를 입력하면 AI가 영어 스토리를 생성하고, 빈칸 채우기 퀴즈를 제공하여 영어 학습을 돕습니다.

## 기술 스택

- **Frontend**: React 19.2.3
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini API (@google/genai 1.37.0)
- **Styling**: Tailwind CSS (CDN)
- **Fonts**: Nunito, Noto Sans KR

## 프로젝트 디렉토리 구조

```
storylingo/
├── App.tsx                  # 메인 애플리케이션 컴포넌트
├── index.tsx                # React 앱 진입점
├── index.html               # HTML 템플릿
├── types.ts                 # TypeScript 타입 정의
├── metadata.json            # 프로젝트 메타데이터
├── package.json             # 프로젝트 의존성 및 스크립트
├── tsconfig.json            # TypeScript 설정
├── vite.config.ts           # Vite 빌드 설정
│
├── components/              # 재사용 가능한 UI 컴포넌트
│   ├── Button.tsx           # 버튼 컴포넌트
│   └── ProgressBar.tsx      # 진행률 표시 바 컴포넌트
│
├── services/                # 외부 서비스 통신
│   └── geminiService.ts     # Google Gemini API 서비스
│
└── utils/                   # 유틸리티 함수
    └── quizUtils.ts         # 퀴즈 생성 유틸리티
```

## 주요 파일 상세

### 1. App.tsx
- **역할**: 애플리케이션의 메인 컴포넌트
- **기능**:
  - 애플리케이션 상태 관리 (HOME, LOADING, QUIZ, RESULT, REVIEW, ERROR)
  - 스토리 생성 및 퀴즈 진행 관리
  - 사용자 입력 검증 및 정답 확인
  - 통계 관리 (정답률, 연속 정답 등)
  - 각 상태별 화면 렌더링

### 2. index.tsx
- **역할**: React 앱의 진입점
- **기능**: ReactDOM을 사용하여 App 컴포넌트를 루트 요소에 렌더링

### 3. types.ts
- **역할**: TypeScript 타입 정의
- **주요 타입**:
  - `Sentence`: 영어/한국어 문장 및 목표 단어 정보
  - `Story`: 스토리 제목, 주제, 문장 배열
  - `QuizItem`: 퀴즈 항목 (문장, 숨김 단어, 문장 부분)
  - `AppState`: 애플리케이션 상태 열거형
  - `UserStats`: 사용자 통계 정보

### 4. components/Button.tsx
- **역할**: 재사용 가능한 버튼 컴포넌트
- **Props**:
  - `variant`: 'primary' | 'secondary' | 'outline' | 'danger'
  - `fullWidth`: 전체 너비 여부
  - 표준 HTML button 속성 지원

### 5. components/ProgressBar.tsx
- **역할**: 퀴즈 진행률 표시 컴포넌트
- **Props**:
  - `current`: 현재 진행 중인 문제 번호
  - `total`: 전체 문제 개수

### 6. services/geminiService.ts
- **역할**: Google Gemini API를 통한 스토리 생성
- **주요 함수**:
  - `generateStory(topic: string)`: 주제를 받아서 영어 스토리 생성
  - Gemini 3 Flash 모델 사용
  - JSON 스키마를 통한 구조화된 응답 생성

### 7. utils/quizUtils.ts
- **역할**: 문장을 퀴즈 항목으로 변환
- **주요 함수**:
  - `prepareQuizItem(sentence: Sentence)`: 문장에서 목표 단어를 찾아 빈칸 문제 생성
  - 정규식을 사용한 정확한 단어 매칭
  - 문장을 prefix, hidden, suffix로 분리

### 8. vite.config.ts
- **역할**: Vite 빌드 도구 설정
- **주요 설정**:
  - 개발 서버: 포트 3000, 호스트 0.0.0.0
  - React 플러그인
  - 환경 변수 정의 (GEMINI_API_KEY)
  - 경로 별칭 (@ -> 루트 디렉토리)

### 9. package.json
- **의존성**:
  - `react`, `react-dom`: ^19.2.3
  - `@google/genai`: ^1.37.0
- **개발 의존성**:
  - `typescript`: ~5.8.2
  - `vite`: ^6.2.0
  - `@vitejs/plugin-react`: ^5.0.0
  - `@types/node`: ^22.14.0
- **스크립트**:
  - `dev`: 개발 서버 실행
  - `build`: 프로덕션 빌드
  - `preview`: 빌드 결과 미리보기

### 10. tsconfig.json
- **주요 설정**:
  - 타겟: ES2022
  - JSX: react-jsx
  - 모듈 해석: bundler
  - 경로 별칭: @/* -> ./*

## 애플리케이션 흐름

1. **HOME 상태**: 사용자가 주제 입력 (기본값: "The Little Prince")
2. **LOADING 상태**: AI가 스토리 생성 중
3. **QUIZ 상태**: 빈칸 채우기 퀴즈 진행
   - 한국어 힌트 표시 (목표 단어 밑줄)
   - 영어 문장에 빈칸 표시
   - 사용자 입력 검증
   - 정답/오답 피드백
4. **RESULT 상태**: 퀴즈 완료 후 결과 표시
   - 총 문제 수, 정답 수, 정확도
5. **REVIEW 상태**: 생성된 스토리 전체 리뷰
6. **ERROR 상태**: 에러 발생 시 에러 메시지 표시

## 상태 관리

애플리케이션은 React의 `useState` 훅을 사용하여 다음과 같은 상태를 관리합니다:

- `appState`: 현재 애플리케이션 화면 상태
- `topic`: 사용자가 입력한 주제
- `story`: AI가 생성한 스토리 데이터
- `currentQuizItems`: 현재 퀴즈 항목 배열
- `currentIndex`: 현재 문제 인덱스
- `userInput`: 사용자 입력값
- `feedback`: 정답/오답 피드백 상태
- `stats`: 사용자 통계 (총 문제, 정답, 연속 정답)
- `errorMsg`: 에러 메시지

## 스타일링

- **Tailwind CSS**: CDN을 통해 로드
- **커스텀 폰트**: Google Fonts에서 Nunito, Noto Sans KR 로드
- **반응형 디자인**: 모바일 최적화된 레이아웃
- **색상 테마**: Indigo 계열의 주요 색상 사용

## 환경 변수

- `GEMINI_API_KEY`: Google Gemini API 키 (필수)

## 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 주요 기능

1. **AI 스토리 생성**: 주제 기반 영어 스토리 자동 생성
2. **빈칸 채우기 퀴즈**: 각 문장의 주요 단어를 숨겨 학습
3. **한국어 힌트**: 한국어 번역과 함께 목표 단어 강조
4. **실시간 피드백**: 즉시 정답/오답 확인
5. **통계 추적**: 정답률, 연속 정답 기록
6. **스토리 리뷰**: 완료된 스토리 전체 재검토

## 데이터 구조

### Story
```typescript
{
  title: string;
  topic: string;
  sentences: Sentence[];
}
```

### Sentence
```typescript
{
  english: string;
  korean: string;
  targetWordEnglish: string;
  targetWordKorean: string;
}
```

### QuizItem
```typescript
{
  sentence: Sentence;
  hiddenWord: string;
  parts: [prefix: string, hidden: string, suffix: string];
}
```
