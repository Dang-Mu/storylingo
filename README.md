# Storylingo

**AI 기반 스토리텔링 학습 플랫폼**

Storylingo는 사용자가 입력한 주제에 대한 영어 스토리를 AI가 생성하고, 그 스토리를 기반으로 한 퀴즈를 통해 영어 학습을 돕는 서비스입니다.

## 기능

- 🎯 **주제별 스토리 생성**: 사용자가 원하는 주제로 AI가 영어 스토리 자동 생성
- 📝 **퀴즈 학습**: 생성된 스토리를 바탕으로 빈칸 채우기 퀴즈 진행
- 📊 **학습 통계**: 정답률과 학습 진행 상황 시각화
- ✅ **즉시 피드백**: 각 문제마다 정답 여부와 해설 제공
- 📖 **스토리 복습**: 완료한 스토리를 다시 읽고 검토 가능
- 📚 **샘플 스토리**: 기본 제공 스토리로 바로 시작 가능

## 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **AI**: Google Gemini API
- **UI**: Tailwind CSS

## 시작하기

### 필수 요구사항
- Node.js (v16 이상)
- Google Gemini API 키

### 설치 및 실행

1. 의존성 설치:
   ```bash
   npm install
   ```

2. 환경 변수 설정:

   루트 디렉토리에 `.env` 파일을 생성하고 Gemini API 키를 추가하세요:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

   API 키 발급: https://aistudio.google.com/app/apikey

   ⚠️ **중요**: `.env` 파일은 루트 디렉토리에 있어야 합니다 (`package.json`과 같은 레벨)

3. 개발 서버 실행:
   ```bash
   npm run dev
   ```

4. 브라우저에서 `http://localhost:5173` 접속

## 사용 방법

1. **홈 화면**에서 학습할 주제 입력
2. **"스토리 생성"** 버튼으로 AI가 스토리 생성
3. **퀴즈 풀이**로 생성된 스토리 학습
4. **결과 확인** 후 스토리 복습 또는 새로운 주제로 재학습

## 프로젝트 구조

```
storylingo/
├── components/          # React 컴포넌트
│   └── screens/        # 각 화면 (홈, 로딩, 퀴즈, 결과 등)
├── data/               # 샘플 스토리 데이터
├── hooks/              # Custom React Hooks
├── public/             # 정적 파일
├── App.tsx             # 메인 앱 컴포넌트
└── index.tsx           # 엔트리 포인트
```

## 문제 해결

### "스토리 생성 실패" 오류

1. **API 키 확인**:
   - `.env` 파일이 루트 디렉토리에 존재하는지 확인
   - 변수명이 정확히 `GEMINI_API_KEY`인지 확인 (대소문자 구분)
   - `.env` 파일 수정 후 개발 서버 재시작

2. **콘솔 로그 확인**:
   - 브라우저 개발자 도구 열기 (F12)
   - 콘솔에서 오류 메시지 확인
   - 터미널에서 `[geminiService]` 관련 메시지 확인

3. **일반적인 문제**:
   - `.env` 파일 누락
   - `.env` 변수명 오류 (`GEMINI_API_KEY` 아닌 다른 이름)
   - 서버 미재시작
   - 유효하지 않거나 만료된 API 키
