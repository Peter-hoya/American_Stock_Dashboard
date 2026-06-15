# 미국 주식 포트폴리오 대시보드 (American Stock Dashboard)

Toss Design System (TDS) 스타일을 적용한 모바일 반응형 미국 주식 포트폴리오 대시보드입니다. 보유하고 있는 미국 주식 포트폴리오를 증권사별 및 종목별로 한눈에 관리하고 분석할 수 있습니다.

## 주요 기능

1. **포트폴리오 요약 (Summary Cards)**
   - 총 평가 자산, 총 매입 금액, 총 평가 손익(P&L), 수익률(%), 일간 변동률 등 핵심 투자 지표를 상단에서 한눈에 보여줍니다.

2. **종목 관리 (My Holdings)**
   - 보유하고 있는 미국 주식의 티커, 종목명, 보유 수량, 매입 평균 단가, 현재가, 평가 금액, 수익률 등을 테이블로 제공합니다.
   - 종목 추가 모달을 통해 새로운 종목을 포트폴리오에 등록할 수 있으며, 티커 입력 시 종목명 및 매입 단가 등을 편리하게 입력할 수 있습니다.
   - 데이터는 브라우저의 `localStorage`에 안전하게 저장 및 유지됩니다.

3. **Finviz 스타일 실시간 히트맵 (Treemap Heatmap)**
   - 사용자의 실제 보유 종목(Holdings) 데이터를 기반으로 한 계층형 트리맵(Treemap) 레이아웃을 구현했습니다.
   - 섹터(Sector)별로 영역을 분할하고, 각 종목의 포트폴리오 내 비중(평가액)에 비례하여 타일 크기를 동적으로 계산합니다.
   - 일간 등락률(Daily Change %)을 기준으로 토스 디자인 시스템의 긍정/부정 색상(Green/Red)을 반영하고 가독성을 극대화했습니다.

4. **증권사별 관리 (Brokerage Management)**
   - 'Portfolio'와 'Brokerages' 탭 UI를 통해 전체 포트폴리오 뷰와 증권사별 뷰를 자유롭게 전환할 수 있습니다.
   - 미래에셋증권, 토스증권, 키움증권 등 국내 주요 증권사의 보유 종목 정보 및 개별 자산 평가액, 수익률, 비중 바(Progress Bar)를 분할 관리합니다.

5. **Toss Design System (TDS) 및 모바일 반응형 최적화**
   - 글래스모피즘에서 단정하고 깔끔한 Toss 스타일의 UI로 전면 개편했습니다.
   - 모바일 환경(768px 이하)에서 테이블 데이터를 쾌적하게 볼 수 있도록 첫 번째 열(티커/종목명) 고정(Sticky Column) 및 가로 스크롤을 적용했습니다.
   - 모바일 화면에 맞춰 카드 배치, 폰트 크기, 모달 입력 폼 레이아웃 및 터치 영역을 최적화했습니다.

6. **포트폴리오 1억원 달성 알림 시스템 (Option C)**
   - Neon PostgreSQL 및 Prisma ORM을 연동하여 보유 자산 및 알림 설정을 클라우드 데이터베이스에 동기화합니다.
   - Netlify Scheduled Functions(매시간 크론잡)을 활용해 백그라운드에서 실시간 주가를 추적하며, 사용자가 설정한 목표금액(예: 1억원)에 도달할 경우 Resend API를 통해 실시간으로 이메일 알림을 발송합니다.

## 기술 스택

- **Core**: React (Vite 기반)
- **Styling**: Vanilla CSS (TDS Design Tokens & Variables)
- **State & Data**: LocalStorage 기반 상태 관리, Yahoo Finance API 연동 (Mock 데이터 처리 포함)

## 시작하기

### 패키지 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```
