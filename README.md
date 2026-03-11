# 🏠 삼성래미안부동산 웹사이트

네이버 부동산 API와 연동된 실시간 매물 정보 제공 웹사이트

## 📋 프로젝트 개요

- **사이트 URL**: https://jj-6441115.vercel.app
- **중개사 ID**: 6441115 (삼성래미안부동산)
- **배포 플랫폼**: Vercel
- **실시간 연동**: 네이버 부동산 API

## 🗂️ 프로젝트 구조

```
부동산 홈페이지 (2)/
├── index.html          # 메인 HTML 파일
├── styles.css          # 전체 스타일시트
├── script.js           # 프론트엔드 로직 (매물 표시, 필터링 등)
├── vercel.json         # Vercel 배포 설정
├── package.json        # Node.js 의존성 관리
└── api/
    └── index.js        # Vercel Serverless Function (네이버 API 프록시)
```

## 🔧 핵심 기술 스택

### 프론트엔드
- **HTML5**: 시맨틱 마크업
- **CSS3**: 
  - CSS Variables (다크 테마)
  - Flexbox & Grid 레이아웃
  - 반응형 디자인 (모바일 최적화)
  - 애니메이션 & 트랜지션
- **Vanilla JavaScript**: 
  - ES6+ 문법
  - Async/Await
  - Fetch API
  - DOM 조작

### 백엔드
- **Node.js**: 서버사이드 런타임
- **Vercel Serverless Functions**: API 엔드포인트
- **Axios**: HTTP 클라이언트

## 📡 API 구조

### 네이버 부동산 API 프록시 (`/api/index.js`)

**중요**: Vercel Serverless Function 형식으로 작성되어야 함

```javascript
// ✅ 올바른 형식 (Vercel Serverless Function)
module.exports = async (req, res) => {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // API 로직
    const response = await axios.get(NAVER_API_URL);
    res.json(response.data);
};

// ❌ 잘못된 형식 (Express App - Vercel에서 작동 안 함)
const app = express();
app.get('/api/properties', async (req, res) => { ... });
module.exports = app;
```

### API 엔드포인트

**GET** `/api/properties`

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `tradeType`: 거래 유형
  - `매매` → 네이버 코드: `A1`
  - `전세` → 네이버 코드: `B1`
  - `월세` → 네이버 코드: `B2`

**응답 형식**:
```json
{
  "success": true,
  "totalCount": 123,
  "currentPage": 1,
  "pageSize": 20,
  "properties": [
    {
      "id": "2606155266",
      "type": "매매",
      "title": "수목원삼성래미안",
      "location": "107동",
      "price": "2억 2,000",
      "size": "59㎡(전용)",
      "rooms": "3",
      "bathrooms": "1",
      "image": "https://...",
      "hasRealImage": true,
      "badge": "신규",
      "description": "...",
      "floor": "19/20",
      "naverUrl": "https://m.land.naver.com/article/info/2606155266"
    }
  ]
}
```

## 🎨 주요 기능

### 1. 실시간 매물 연동
- 네이버 부동산 API에서 실시간 데이터 가져오기
- 페이지네이션 (20개씩 로드)
- "더 보기" 버튼으로 추가 매물 로드

### 2. 필터링 시스템
- **거래 유형**: 매매, 전세, 월세
- **가격대**: 1억 단위 필터링
- **면적**: S(60㎡ 이하), M(60-85㎡), L(85-135㎡), XL(135㎡ 이상)
- **검색**: 제목, 위치, 건물명, 태그 등 통합 검색

### 3. 매물 카드 기능
- 클릭 시 네이버 매물 상세 페이지로 이동
- 매물번호 표시 + "클릭시 네이버 매물설명 이동" 안내
- 실제 사진 여부 표시
- 층수 정보 뱃지

### 4. 유튜브 영상 섹션
- 설정된 유튜브 영상 임베드
- 반응형 iframe

## ⚙️ 설정 파일

### `script.js` - CONFIG 객체

```javascript
const CONFIG = {
    // 네이버 API 설정
    NAVER_API_ENABLED: true,
    NAVER_PROXY_URL: '/api/properties',
    REALTOR_ID: '6441115',
    
    // 유튜브 영상 설정
    YOUTUBE_VIDEOS: [
        { id: 'OwRk7TbJOpo' },
        { id: 'bsMaAf91UF0' },
        { id: 'CDNzvRe12uo' }
    ]
};
```

**유튜브 영상 추가 방법**:
1. 유튜브에서 영상 URL 복사 (예: `youtube.com/watch?v=ABC12345678`)
2. `v=` 뒤의 ID만 추출 (`ABC12345678`)
3. `YOUTUBE_VIDEOS` 배열에 추가

## 🚀 배포 방법

### Vercel CLI 사용

```powershell
# PowerShell에서 실행 (실행 정책 우회)
powershell -ExecutionPolicy Bypass -Command "vercel --prod"
```

### 배포 프로세스
1. 파일 업로드
2. 빌드 실행
3. Serverless Function 배포
4. 도메인 연결 (자동)

**배포 시간**: 약 10-15초

## 🔍 문제 해결

### API 500 에러
**원인**: Express 앱 구조 사용  
**해결**: Vercel Serverless Function 형식으로 변환

### CORS 에러
**해결**: API에서 CORS 헤더 설정
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
```

### 매물이 표시되지 않음
1. API 엔드포인트 확인: `https://jj-6441115.vercel.app/api/properties`
2. 브라우저 콘솔에서 에러 확인
3. Vercel 대시보드에서 로그 확인

## 📱 반응형 디자인

### 브레이크포인트
- **모바일**: < 768px
- **태블릿**: 768px - 1024px
- **데스크톱**: > 1024px

### 모바일 최적화
- 햄버거 메뉴
- 터치 친화적 버튼 크기
- 유동적인 그리드 레이아웃
- 최적화된 이미지 로딩

## 🎯 주요 함수 설명

### `fetchNaverProperties(page, tradeType)`
네이버 API에서 매물 데이터를 가져옵니다.

### `filterProperties(filters)`
필터 조건에 맞는 매물을 필터링합니다.

### `createPropertyCard(property)`
매물 카드 HTML을 생성합니다.

### `parsePrice(priceStr)`
가격 문자열을 숫자로 변환합니다 (필터링용).

### `transformNaverData(list)`
네이버 API 응답을 웹사이트 형식으로 변환합니다.

## 📊 데이터 흐름

```
사용자 → 필터 선택
    ↓
script.js (filterProperties)
    ↓
Fetch API 호출
    ↓
/api/properties (Vercel Serverless Function)
    ↓
네이버 부동산 API
    ↓
데이터 변환 (transformNaverData)
    ↓
JSON 응답
    ↓
매물 카드 생성 (createPropertyCard)
    ↓
화면에 표시
```

## 🔐 환경 변수

Vercel 대시보드에서 설정 가능:
- `REALTOR_ID`: 중개사 ID (기본값: 6441115)

## 📝 코드 스타일

- **들여쓰기**: 4 스페이스
- **문자열**: 작은따옴표 (`'`) 사용
- **세미콜론**: 사용
- **주석**: 한글로 명확하게 작성
- **함수명**: camelCase
- **상수**: UPPER_SNAKE_CASE

## 🎨 디자인 시스템

### CSS Variables
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #ec4899;
    --accent-color: #f59e0b;
    --bg-primary: #0f172a;
    --text-primary: #f1f5f9;
}
```

### 그라디언트
- Primary: `linear-gradient(135deg, #6366f1 0%, #ec4899 100%)`
- Secondary: `linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)`

## 🔄 업데이트 이력

### 2026-01-31
- ✅ 매물번호 옆 "클릭시 네이버 매물설명 이동" 텍스트 추가
- ✅ API 500 에러 수정 (Serverless Function 변환)
- ✅ 123개 매물 정상 연동 확인

### 3. 매물 유형 필터링 (2026-02-02 업데이트)
매물의 `atclRletTpNm` (매물종류명) 데이터를 기반으로 다음과 같이 자동 분류합니다:

| 필터 메뉴 | 포함되는 키워드 (데이터 기준) |
| :--- | :--- |
| **아파트/오피스텔** | `아파트`, `오피스텔`, `분양권` |
| **빌라/주택** | `빌라`, `연립`, `단독`, `다가구`, `주택`, `원룸`, `투룸` |
| **상가/사무실** | `상가`, `사무실`, `점포` |
| **공장/창고** | `공장`, `창고` |
| **토지** | `토지` |

## 🔄 업데이트 이력

### 2026-02-02
- ✅ **매물 유형(Property Type) 필터 추가**: 아파트, 상가, 토지 등 유형별 정렬 기능 구현
- ✅ **필터 세분화**: 공장/창고와 토지 필터 분리
- ✅ **상가/토지 매물 표시 개선**: 방/욕실 수 대신 건물명 표시 로직 적용
- ✅ **매물 카드 UI 정리**: 방/욕실 정보 표시 영역 전체 삭제 (사용자 요청)
- ✅ **API 로직 수정**: 방/욕실 수 데이터가 없을 경우 표시하지 않도록 개선 (데이터 추출 로직 강화)

### 2026-01-31

## 📞 연락처

중개사: 삼성래미안부동산  
ID: 6441115  
네이버 부동산: https://fin.land.naver.com/realtor/6441115

---

**참고**: 이 프로젝트는 Vercel Serverless Functions를 사용하므로, 로컬에서 테스트할 때는 `vercel dev` 명령어를 사용하세요.
