// ===== Configuration =====
const CONFIG = {
    // YouTube API Configuration
    YOUTUBE_API_KEY: 'YOUR_YOUTUBE_API_KEY', // Replace with your YouTube API key
    YOUTUBE_CHANNEL_ID: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Example: Google Developers channel
    YOUTUBE_PLAYLIST_ID: '', // Optional: specific playlist ID

    // Naver Real Estate Configuration
    NAVER_API_ENABLED: true, // 실시간 연동 활성화
    NAVER_API_MODE: 'REALTIME', // 'REALTIME'으로 자동화
    NAVER_PROXY_URL: '/properties-data.json',
    NAVER_REALTIME_URL: '/api/proxy', // 신규 프록시 주소
    REALTOR_ID: '6441115', // 삼성래미안부동산 중개사 ID

    // Sample Properties (Replace with real API data)
    SAMPLE_PROPERTIES: [
        {
            id: 1,
            type: '매매',
            title: '역세권 신축 아파트',
            location: '서울시 강남구 역삼동',
            price: '8억 5천',
            size: '105㎡',
            rooms: '3',
            bathrooms: '2',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            badge: '신규',
            description: '역세권 도보 5분 거리의 신축 아파트입니다.'
        },
        {
            id: 2,
            type: '전세',
            title: '넓은 거실의 프리미엄 오피스텔',
            location: '서울시 서초구 서초동',
            price: '3억 2천',
            size: '84㎡',
            rooms: '2',
            bathrooms: '1',
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            badge: '인기',
            description: '넓은 거실과 채광이 좋은 프리미엄 오피스텔입니다.'
        },
        {
            id: 3,
            type: '월세',
            title: '풀옵션 원룸',
            location: '서울시 마포구 공덕동',
            price: '500/50',
            size: '33㎡',
            rooms: '1',
            bathrooms: '1',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            badge: '급매',
            description: '풀옵션으로 즉시 입주 가능한 원룸입니다.'
        },
        {
            id: 4,
            type: '매매',
            title: '한강뷰 고급 아파트',
            location: '서울시 용산구 이촌동',
            price: '15억',
            size: '148㎡',
            rooms: '4',
            bathrooms: '3',
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            badge: '프리미엄',
            description: '한강이 보이는 고급 아파트입니다.'
        },
        {
            id: 5,
            type: '전세',
            title: '신혼부부 추천 아파트',
            location: '경기도 성남시 분당구',
            price: '2억 5천',
            size: '59㎡',
            rooms: '3',
            bathrooms: '2',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
            badge: '추천',
            description: '신혼부부에게 적합한 깨끗한 아파트입니다.'
        },
        {
            id: 6,
            type: '매매',
            title: '투자가치 높은 상가주택',
            location: '서울시 송파구 잠실동',
            price: '12억',
            size: '165㎡',
            rooms: '5',
            bathrooms: '3',
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            badge: '투자',
            description: '1층 상가, 2-3층 주거용 복합 건물입니다.'
        }
    ],

    // YouTube Videos Configuration
    // [사용 설명서]
    // 1. 유튜브에서 원하는 영상을 켭니다.
    // 2. 주소창을 보면 'v=' 뒤에 있는 글자들이 있습니다. (예: youtube.com/watch?v=ABC12345678)
    // 3. 그 'ABC12345678' 부분이 바로 ID입니다. 아래 'id' 부분에 따옴표('') 안에 넣어주세요.
    YOUTUBE_VIDEOS: [
        {
            id: 'OwRk7TbJOpo'
        },
        {
            id: 'bsMaAf91UF0'
        },
        {
            id: 'CDNzvRe12uo'
        }
    ]
};

// ===== State Management =====
let currentProperties = []; // 빈 배열로 시작 (API에서 로드)
let allLoadedProperties = []; // 전체 로드된 매물 (필터링용)
let displayedProperties = [];
let propertiesPerPage = 6;
let currentPage = 0;
let currentFilter = {}; // 현재 적용된 필터 저장


// ===== Navigation =====
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Smooth scroll and active link
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
            navMenu.classList.remove('active');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// ===== Hero Stats Animation =====
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');

    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateStat = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateStat);
            } else {
                stat.textContent = target;
            }
        };

        updateStat();
    });
}

// Trigger stats animation when in view
const observerOptions = {
    threshold: 0.5
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}


// ===== Filter Properties =====
const filterType = document.getElementById('filterType');
const filterPropertyType = document.getElementById('filterPropertyType'); // 매물 유형 필터 추가
const filterPrice = document.getElementById('filterPrice');
const filterSize = document.getElementById('filterSize');
const filterSearch = document.getElementById('filterSearch'); // 필터 섹션의 검색창
const applyFilterBtn = document.getElementById('applyFilter');

applyFilterBtn.addEventListener('click', async () => {
    const filters = {
        type: filterType.value,
        propertyType: filterPropertyType.value, // 매물 유형 값 추가
        price: filterPrice.value,
        size: filterSize.value,
        search: filterSearch ? filterSearch.value.trim() : '' // 필터 검색창 사용
    };
    await filterProperties(filters);
});

async function filterProperties(filters = {}) {
    propertiesLoading.style.display = 'block';

    // 현재 필터 저장
    currentFilter = filters;

    // API 페이지 번호 초기화
    apiCurrentPage = 1;

    // 거래 유형이 변경되었거나 데이터가 없는 경우 API 호출
    try {
        const tradeType = filters.type || '';
        console.log(`🔍 필터 적용: 거래유형=${tradeType || '전체'}, 매물유형=${filters.propertyType || '전체'}, 가격=${filters.price || '전체'}`);

        const result = await fetchNaverProperties(1, tradeType);
        allLoadedProperties = result.properties; // properties 배열만 추출
        apiTotalCount = result.totalCount; // 전체 개수 저장

        console.log(`📦 API에서 ${allLoadedProperties.length}개 매물 로드 완료 (전체: ${apiTotalCount}개)`);
    } catch (error) {
        console.error('필터링 중 데이터 로드 오류:', error);
        allLoadedProperties = [];
    }

    // 필터링할 데이터 (방금 가져온 데이터 사용)
    const propertiesToFilter = allLoadedProperties.length > 0 ? allLoadedProperties : CONFIG.SAMPLE_PROPERTIES;

    // 추가 필터 적용 (가격, 평수, 검색어)
    const filtered = propertiesToFilter.filter(property => {
        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase().replace(/\s+/g, ''); // 검색어에서 공백 제거

            // 검색 대상 필드들을 모두 합쳐서 검사 (공백 제거 후 비교)
            // title: 제목, location: 위치(동), description: 상세설명, building: 건물명, tags: 태그들
            const searchTargets = [
                property.title,
                property.location,
                property.description,
                property.building,
                ...(Array.isArray(property.tags) ? property.tags : []), // 태그 배열
                property.type, // 매매/전세/월세
                property.price,
                property.size
            ];

            // 하나라도 검색어를 포함하면 매칭
            const matchesSearch = searchTargets.some(target => {
                if (!target) return false;
                const text = String(target).toLowerCase().replace(/\s+/g, '');
                return text.includes(searchTerm);
            });

            if (!matchesSearch) return false;
        }

        // Type filter: 이미 API에서 필터링해서 가져왔으므로 여기서는 생략 가능하지만,
        // 혹시 모르니 한 번 더 체크 (API가 전체를 줄 수도 있으므로)
        if (filters.type && filters.type !== '') {
            if (property.type !== filters.type) {
                return false;
            }
        }

        // 매물 유형 필터 (아파트/오피스텔 등)
        if (filters.propertyType && filters.propertyType !== '') {
            const pType = property.propertyType || '';
            const filterVal = filters.propertyType;

            if (filterVal === '아파트/오피스텔') {
                if (!pType.includes('아파트') && !pType.includes('오피스텔') && !pType.includes('분양권')) return false;
            } else if (filterVal === '빌라/주택') {
                if (!pType.includes('빌라') && !pType.includes('연립') && !pType.includes('단독') && !pType.includes('다가구') && !pType.includes('주택') && !pType.includes('원룸') && !pType.includes('투룸')) return false;
            } else if (filterVal === '상가/사무실') {
                if (!pType.includes('상가') && !pType.includes('사무실') && !pType.includes('점포')) return false;
            } else if (filterVal === '공장/창고') {
                if (!pType.includes('공장') && !pType.includes('창고')) return false;
            } else if (filterVal === '토지') {
                if (!pType.includes('토지')) return false;
            }
        }

        // Price filter (빈 문자열이면 전체)
        if (filters.price && filters.price !== '') {
            const priceValue = parsePrice(property.price);
            const filterPrice = parseInt(filters.price);

            // 디버깅: 모든 매물 로그 출력 (임시)
            console.log(`💰 [${property.title}] "${property.price}" → ${priceValue}만원, 필터: ${filterPrice}번 (1억~2억 = 10000~20000)`);


            // 단위: 만원
            // value="1": 1억 이하 (<= 10000)
            // value="2": 1억 ~ 2억 (10000 < x <= 20000)
            // value="3": 2억 ~ 3억 (20000 < x <= 30000)
            // value="4": 3억 ~ 4억 (30000 < x <= 40000)
            // value="5": 4억 ~ 5억 (40000 < x <= 50000)
            // value="6": 5억 ~ 6억 (50000 < x <= 60000)
            // value="7": 6억 이상 (> 60000)

            if (filterPrice === 1 && priceValue > 10000) return false;
            if (filterPrice === 2 && (priceValue <= 10000 || priceValue > 20000)) return false;
            if (filterPrice === 3 && (priceValue <= 20000 || priceValue > 30000)) return false;
            if (filterPrice === 4 && (priceValue <= 30000 || priceValue > 40000)) return false;
            if (filterPrice === 5 && (priceValue <= 40000 || priceValue > 50000)) return false;
            if (filterPrice === 6 && (priceValue <= 50000 || priceValue > 60000)) return false;
            if (filterPrice === 7 && priceValue <= 60000) return false;
        }

        // Size filter (빈 문자열이면 전체)
        if (filters.size && filters.size !== '') {
            const propertySize = parseInt(property.size); // 숫자로 변환 (예: "84㎡" -> 84)
            const filterSizeValue = filters.size;

            // 면적 범위 체크 (㎡ 기준)
            if (filterSizeValue === 'S') { // 60㎡ 이하
                if (propertySize > 60) return false;
            } else if (filterSizeValue === 'M') { // 60㎡ ~ 85㎡
                if (propertySize <= 60 || propertySize > 85) return false;
            } else if (filterSizeValue === 'L') { // 85㎡ ~ 135㎡
                if (propertySize <= 85 || propertySize > 135) return false;
            } else if (filterSizeValue === 'XL') { // 135㎡ 이상
                if (propertySize <= 135) return false;
            }
        }

        return true;
    });

    console.log(`필터 적용 결과: ${filtered.length}개`);

    // 필터링된 결과를 현재 속성으로 설정
    currentProperties = filtered;
    currentPage = 0;
    displayedProperties = [];

    // 매물 다시 로드
    propertiesGrid.innerHTML = '';

    if (filtered.length === 0) {
        // 필터 조건에 맞는 매물이 첫 페이지에 없을 때
        const hasMorePages = allLoadedProperties.length >= apiPageSize;

        if (hasMorePages) {
            // 메시지 없이 버튼만 표시 (HTML에 고정 텍스트가 있음)
            loadMoreBtn.innerHTML = '매물 더보기 클릭';
            loadMoreBtn.style.display = 'block';
            console.log('💡 첫 페이지에 조건 맞는 매물 없음. "더 보기"로 추가 페이지 확인 가능');
        } else {
            propertiesGrid.innerHTML = '<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">조건에 맞는 매물이 없습니다.</div>';
            loadMoreBtn.style.display = 'none';
        }
        propertiesLoading.style.display = 'none';
    } else {
        // 필터링된 매물 표시
        filtered.forEach((property, index) => {
            setTimeout(() => {
                const propertyCard = createPropertyCard(property);
                propertiesGrid.appendChild(propertyCard);
                displayedProperties.push(property);
            }, index * 100);
        });

        // 로딩 숨기기
        setTimeout(() => {
            propertiesLoading.style.display = 'none';
        }, filtered.length * 100 + 100);

        // 다음 페이지 준비 (필터 적용 후 1페이지를 로드했으므로 다음은 2페이지)
        apiCurrentPage = 2;

        // "더 보기" 버튼 표시/숨김
        // filtered.length는 가격/면적 필터까지 적용된 결과이므로,
        // apiTotalCount와 비교하여 더 많은 데이터가 있는지 확인
        console.log(`📊 필터 후 표시: ${filtered.length}개 / API에서 받은 데이터: ${allLoadedProperties.length}개 / 전체: ${apiTotalCount}개`);

        const pageInfo = document.getElementById('pageInfo');
        const totalPages = Math.ceil(apiTotalCount / apiPageSize);
        const currentPageNum = 1; // 필터 적용 후 첫 페이지

        // 표시된 매물 수가 전체보다 적으면 더 보기 버튼 표시
        if (filtered.length < apiTotalCount) {
            loadMoreBtn.innerHTML = '매물 더보기 클릭'; // 버튼 텍스트 초기화
            loadMoreBtn.style.display = 'block';
            pageInfo.style.display = 'block';
            pageInfo.innerHTML = `📄 현재 ${currentPageNum} / ${totalPages} 페이지 (${filtered.length}개 / 전체 ${apiTotalCount}개 매물)`;
            console.log('🔽 필터 적용 후 더 보기 버튼 표시 (더 많은 매물 있음)');
        } else {
            loadMoreBtn.style.display = 'none';
            pageInfo.style.display = 'none';
            console.log('✅ 필터링된 모든 매물을 표시했습니다.');
        }
    }
}

// ===== Fetch Properties =====
async function fetchNaverProperties(page = 1, tradeType = '') {
    if (!CONFIG.NAVER_API_ENABLED) {
        console.log('📦 샘플 데이터 사용 중');
        const sampleData = CONFIG.SAMPLE_PROPERTIES.map(p => ({ ...p, isSample: true }));
        return { properties: sampleData, totalCount: sampleData.length };
    }

    try {
        // --- REALTIME 모드: 서버리스 함수(/api/index) 호출 ---
        if (CONFIG.NAVER_API_MODE === 'REALTIME') {
            console.log(`📡 실시간 API 호출 중... (페이지 ${page}, 유형: ${tradeType || '전체'})`);
            const url = `${CONFIG.NAVER_REALTIME_URL}?page=${page}&tradeType=${tradeType}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`실시간 API 응답 오류: ${response.status}`);
            
            const data = await response.json();
            if (data.success) {
                return {
                    properties: data.properties,
                    totalCount: data.totalCount
                };
            } else {
                throw new Error(data.error || '알 수 없는 API 오류');
            }
        }

        // --- STATIC 모드: 생성된 JSON 파일 로드 ---
        console.log(`📂 정적 데이터 파일에서 로드 중... (페이지 ${page}, 유형: ${tradeType || '전체'})`);

        if (typeof window.allApiProperties === 'undefined') {
            const response = await fetch(CONFIG.NAVER_PROXY_URL);
            if (!response.ok) throw new Error(`데이터 파일 로딩 실패: ${response.status}`);
            const data = await response.json();

            if (data.success && data.properties) {
                window.allApiProperties = data.properties;
                console.log(`✅ 총 ${window.allApiProperties.length}개 매물 로드 완료 (업데이트: ${data.lastUpdated})`);
            } else {
                throw new Error('올바르지 않은 데이터 형식');
            }
        }

        // 필터링 (거래 유형)
        let filtered = window.allApiProperties;
        if (tradeType) {
            filtered = filtered.filter(p => p.type === tradeType);
        }

        // 페이지네이션
        const pageSize = apiPageSize || 20;
        const startIndex = (page - 1) * pageSize;
        const pageProperties = filtered.slice(startIndex, startIndex + pageSize);

        return {
            properties: pageProperties,
            totalCount: filtered.length
        };

    } catch (error) {
        console.error('❌ 데이터 로드 오류:', error.message);
        
        // 실시간 모드 실패 시 정적 파일로 자동 폴백 시도
        if (CONFIG.NAVER_API_MODE === 'REALTIME') {
            console.log('⚠️ 실시간 API 실패로 정적 파일 폴백 시도...');
            CONFIG.NAVER_API_MODE = 'STATIC';
            return fetchNaverProperties(page, tradeType);
        }

        showApiErrorMessage(error.message);
        const sampleData = CONFIG.SAMPLE_PROPERTIES.map(p => ({ ...p, isSample: true }));
        return { properties: sampleData, totalCount: sampleData.length };
    }
}

// API 오류 메시지 표시
function showApiErrorMessage() {
    const propertiesGrid = document.getElementById('propertiesGrid');
    const errorBanner = document.createElement('div');
    errorBanner.style.cssText = `
        grid-column: 1 / -1;
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.5);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        color: var(--accent-color);
        margin-bottom: 1rem;
    `;
    errorBanner.innerHTML = `
        ⚠️ 실시간 매물 연동 서버에 연결할 수 없습니다. 샘플 데이터를 표시합니다.<br>
        <small>프록시 서버를 실행하려면: <code>node naver-api-proxy.js</code></small>
    `;

    // 기존 에러 배너 제거
    const existingBanner = propertiesGrid.querySelector('[data-error-banner]');
    if (existingBanner) {
        existingBanner.remove();
    }

    errorBanner.setAttribute('data-error-banner', 'true');
    propertiesGrid.insertBefore(errorBanner, propertiesGrid.firstChild);
}

// ===== Load Properties =====
const propertiesGrid = document.getElementById('propertiesGrid');
const propertiesLoading = document.getElementById('propertiesLoading');
const loadMoreBtn = document.getElementById('loadMoreBtn');

let apiCurrentPage = 1; // API 페이지 번호
let apiTotalCount = 0; // 전체 매물 수
let apiPageSize = 20; // 페이지당 매물 수

async function loadProperties() {
    propertiesLoading.style.display = 'block';

    try {
        // 현재 필터의 거래 유형 가져오기 (필터가 적용된 경우)
        const tradeType = currentFilter.type || '';

        // API에서 다음 페이지 데이터 가져오기 (필터 유지)
        const result = await fetchNaverProperties(apiCurrentPage, tradeType);
        const properties = result.properties;
        apiTotalCount = result.totalCount; // 전체 매물 수 저장

        if (apiCurrentPage === 1) {
            // 첫 페이지: 기존 데이터 초기화
            propertiesGrid.innerHTML = '';
            displayedProperties = [];
            allLoadedProperties = properties;
        } else {
            // 2페이지 이상: 기존 데이터에 추가
            allLoadedProperties = [...allLoadedProperties, ...properties];
        }

        // 매물 카드 생성 및 표시 (가격/면적 필터 적용)
        properties.forEach((property, index) => {
            // 가격 필터 적용
            if (currentFilter.price && currentFilter.price !== '') {
                const priceValue = parsePrice(property.price);
                const filterPrice = parseInt(currentFilter.price);

                // 가격 범위 체크
                if (filterPrice === 1 && priceValue > 10000) return;
                if (filterPrice === 2 && (priceValue <= 10000 || priceValue > 20000)) return;
                if (filterPrice === 3 && (priceValue <= 20000 || priceValue > 30000)) return;
                if (filterPrice === 4 && (priceValue <= 30000 || priceValue > 40000)) return;
                if (filterPrice === 5 && (priceValue <= 40000 || priceValue > 50000)) return;
                if (filterPrice === 6 && (priceValue <= 50000 || priceValue > 60000)) return;
                if (filterPrice === 7 && priceValue <= 60000) return;
            }

            // 매물 유형 필터 적용 (추가 로드 시)
            if (currentFilter.propertyType && currentFilter.propertyType !== '') {
                const pType = property.propertyType || '';
                const filterVal = currentFilter.propertyType;

                if (filterVal === '아파트/오피스텔') {
                    if (!pType.includes('아파트') && !pType.includes('오피스텔') && !pType.includes('분양권')) return;
                } else if (filterVal === '빌라/주택') {
                    if (!pType.includes('빌라') && !pType.includes('연립') && !pType.includes('단독') && !pType.includes('다가구') && !pType.includes('주택') && !pType.includes('원룸') && !pType.includes('투룸')) return;
                } else if (filterVal === '상가/사무실') {
                    if (!pType.includes('상가') && !pType.includes('사무실') && !pType.includes('점포')) return;
                } else if (filterVal === '공장/창고') {
                    if (!pType.includes('공장') && !pType.includes('창고')) return;
                } else if (filterVal === '토지') {
                    if (!pType.includes('토지')) return;
                }
            }

            // 면적 필터 적용
            if (currentFilter.size && currentFilter.size !== '') {
                const propertySize = parseInt(property.size);
                const filterSizeValue = currentFilter.size;

                if (filterSizeValue === 'S' && propertySize > 60) return;
                if (filterSizeValue === 'M' && (propertySize <= 60 || propertySize > 85)) return;
                if (filterSizeValue === 'L' && (propertySize <= 85 || propertySize > 135)) return;
                if (filterSizeValue === 'XL' && propertySize <= 135) return;
            }

            setTimeout(() => {
                const propertyCard = createPropertyCard(property);
                propertiesGrid.appendChild(propertyCard);
                displayedProperties.push(property);
            }, index * 100);
        });

        // 다음 페이지 준비
        apiCurrentPage++;

        // 로딩 숨기기 - 애니메이션 후
        setTimeout(() => {
            propertiesLoading.style.display = 'none';
        }, properties.length * 100 + 100);

        // "더 보기" 버튼 표시/숨김
        // displayedProperties.length < apiTotalCount이면 더 불러올 데이터가 있음
        console.log(`📊 표시된 매물: ${displayedProperties.length}개 / 전체: ${apiTotalCount}개`);

        const pageInfo = document.getElementById('pageInfo');
        const totalPages = Math.ceil(apiTotalCount / apiPageSize);
        const currentPageNum = Math.ceil(displayedProperties.length / apiPageSize);

        if (displayedProperties.length >= apiTotalCount || properties.length < apiPageSize) {
            loadMoreBtn.style.display = 'none';
            pageInfo.style.display = 'none';
            console.log('✅ 모든 매물을 표시했습니다.');
        } else {
            loadMoreBtn.style.display = 'block';
            pageInfo.style.display = 'block';
            pageInfo.innerHTML = `📄 현재 ${currentPageNum} / ${totalPages} 페이지 (${displayedProperties.length}개 / 전체 ${apiTotalCount}개 매물)`;
            console.log('🔽 더 보기 버튼 표시');
        }

    } catch (error) {
        console.error('매물 로드 오류:', error);
        propertiesLoading.style.display = 'none';
    }
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';

    // 샘플 매물인 경우 상단 빨간 띠 추가
    const sampleBanner = property.isSample ? `
        <div class="sample-property-banner">
            <span>⚠️ 현재는 샘플 매물로 테스트 중입니다</span>
        </div>
    ` : '';

    // 층수 정보만 생성 (호수는 제외)
    const floorInfo = property.floor ? `${property.floor}층` : '';

    // 주거용 매물 타입 정의 (방/욕실 표기가 필요한 타입)
    const residentialTypes = ['다가구', '오피스텔', '빌라', '아파트', '분양권', '전원주택', '다세대', '상가주택', '원룸', '투룸'];
    // title 대신 propertyType으로 체크
    const pType = property.propertyType || '';
    const isResidential = residentialTypes.some(type => pType.includes(type)); let roomBathroomInfo = '';

    // 방/욕실 정보 표기 제거 요청으로 인해 코드 주석 처리 또는 삭제
    /* 
    if (isResidential && property.rooms && property.bathrooms) {
       // ... (삭제됨)
    } 
    */

    // 주거용이 아닌 경우 건물명/단지명 표시 (상위 if문이 주석처리되었으므로 if로 변경)
    if (property.building) {
        // 주거용이 아닌 경우 건물명/단지명 표시
        roomBathroomInfo = `
                <div class="property-detail-item" style="flex-grow: 2; width: auto;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"></path>
                        <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"></path>
                        <path d="M12 3v5"></path>
                        <path d="M8 21v-4"></path>
                        <path d="M16 21v-4"></path>
                    </svg>
                    ${property.building}
                </div>`;
    }

    card.innerHTML = `
        ${sampleBanner}
        <div class="property-image-container">
            <img src="${property.image}" alt="${property.title}" class="property-image">
            <div class="property-badge">${property.badge}</div>
            ${property.hasRealImage ? `
                <div class="real-photo-badge">실사진</div>
            ` : `
                <div class="image-disclaimer-badge">
                    <div class="disclaimer-title">이미지 업데이트 예정</div>
                    <div class="disclaimer-subtitle">실제 매물 사진이 아님</div>
                </div>
            `}
        </div>
        <div class="property-content">
            <span class="property-type">${property.type}</span>
            <h3 class="property-title">${property.title}</h3>
            <div class="property-number" style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0.5rem 0;">매물번호: ${property.id} <span style="color: var(--accent-color);">클릭시 네이버 매물설명 이동</span></div>
            ${floorInfo ? `<div class="property-floor-badge">${floorInfo}</div>` : ''}
            <div class="property-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                ${property.size} &middot; ${property.location}
            </div>
            <div class="property-price">${property.price}</div>

        </div>
    `;

    // 매물 카드 클릭 시 네이버 부동산 페이지로 이동
    card.addEventListener('click', () => {
        const naverUrl = property.naverUrl || `https://m.land.naver.com/article/info/${property.id}`;
        window.open(naverUrl, '_blank'); // 새 탭에서 열기
    });

    return card;
}

loadMoreBtn.addEventListener('click', loadProperties);

// ===== Property Detail Modal =====
const propertyModal = document.getElementById('propertyModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

function showPropertyDetail(property) {
    // 주거용 매물 타입 정의 (방/욕실 표기가 필요한 타입)
    const residentialTypes = ['다가구', '오피스텔', '빌라', '아파트', '분양권', '전원주택', '다세대', '상가주택', '원룸', '투룸'];
    // title 대신 propertyType으로 체크
    const pType = property.propertyType || '';
    const isResidential = residentialTypes.some(type => pType.includes(type)); let roomBathroomInfo = '';

    // 방/욕실 정보 표기 제거 요청으로 인해 코드 주석 처리 또는 삭제
    /*
    if (isResidential && property.rooms && property.bathrooms) {
        // ... (삭제됨)
    }
    */

    // 주거용이 아닌 경우 건물명/단지명 표시 (상위 if문이 주석처리되었으므로 if로 변경)
    if (property.building) {
        // 주거용이 아닌 경우 건물명/단지명 표시
        roomBathroomInfo = `
            <div class="property-detail-item" style="font-size: 1.1rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"></path>
                    <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"></path>
                    <path d="M12 3v5"></path>
                    <path d="M8 21v-4"></path>
                    <path d="M16 21v-4"></path>
                </svg>
                ${property.building}
            </div>`;
    }

    modalBody.innerHTML = `
        <img src="${property.image}" alt="${property.title}" style="width: 100%; border-radius: 12px; margin-bottom: 2rem;">
        <span class="property-type">${property.type}</span>
        <h2 style="font-size: 2rem; margin: 1rem 0;">${property.title}</h2>
        <div class="property-location" style="font-size: 1.1rem; margin-bottom: 2rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${property.location}
        </div>
        <div class="property-price" style="font-size: 2.5rem; margin-bottom: 2rem;">${property.price}</div>
        <div class="property-details" style="margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-tertiary); border-radius: 12px;">
            <div class="property-detail-item" style="font-size: 1.1rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                면적: ${property.size}
            </div>

        </div>
        <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem;">매물 설명</h3>
            <p style="color: var(--text-muted); line-height: 1.8;">${property.description}</p>
        </div>
        <button class="submit-btn" style="width: 100%;">
            <span>문의하기</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
        </button>
    `;

    propertyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    propertyModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// ===== Load YouTube Videos =====
const videosGrid = document.getElementById('videosGrid');

function loadYouTubeVideos() {
    CONFIG.YOUTUBE_VIDEOS.forEach((video, index) => {
        setTimeout(() => {
            const videoCard = createVideoCard(video);
            videosGrid.appendChild(videoCard);
        }, index * 100);
    });
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
        <div class="video-thumbnail">
            <iframe 
                src="https://www.youtube.com/embed/${video.id}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
    `;

    return card;
}

// ===== Contact Form =====
const contactForm = document.getElementById('contactForm');

// 문의하기 폼은 HTML의 action 속성을 통해 처리됩니다.
// contactForm.addEventListener('submit', ... ) 코드는 제거됨

// ===== Intersection Observer for Animations =====
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

// Observe sections for animation
document.querySelectorAll('.section-header, .service-card, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    animateOnScroll.observe(el);
});

// 가격 문자열 파싱 (예: "1억 5,000" -> 15000, "500/50" -> 500)
function parsePrice(priceStr) {
    if (!priceStr) return 0;

    const originalPrice = priceStr; // 디버깅용

    // 월세의 경우 보증금만 추출 (예: "500 / 50" -> "500")
    if (priceStr.includes('/')) {
        priceStr = priceStr.split('/')[0].trim();
    }

    // 쉼표와 공백 먼저 제거
    let cleanStr = priceStr.replace(/,/g, '').replace(/\s+/g, '');

    let amount = 0;

    // "억"이 포함된 경우
    if (cleanStr.includes('억')) {
        const parts = cleanStr.split('억');
        const billions = parseInt(parts[0]) || 0;

        // 억 뒤의 숫자 처리 (예: "1억5000" -> 5000만)
        let remainder = 0;
        if (parts[1]) {
            const remainderStr = parts[1].replace('만', '');
            remainder = parseInt(remainderStr) || 0;
        }

        amount = (billions * 10000) + remainder;
    }
    // "만"만 있는 경우 (예: "5000만")
    else if (cleanStr.includes('만')) {
        const numStr = cleanStr.replace('만', '');
        amount = parseInt(numStr) || 0;
    }
    // 숫자만 있는 경우 (만원 단위로 가정)
    else {
        amount = parseInt(cleanStr) || 0;
    }

    // 디버깅: 1억 근처 가격만 로그
    if (amount >= 9000 && amount <= 11000) {
        console.log(`🔍 가격 파싱: "${originalPrice}" → cleanStr: "${cleanStr}" → ${amount}만원`);
    }

    return amount;
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
    loadYouTubeVideos();

    console.log('🏠 삼성래미안부동산 웹사이트가 로드되었습니다!');
    console.log('💡 팁: CONFIG 객체에서 YouTube API 키와 매물 데이터를 설정하세요.');

    // 문의하기 폼은 FormSubmit.co를 통해 자동으로 처리됩니다

    // 4시간(14,400,000ms)마다 자동 새로고침
    setInterval(() => {
        console.log('🔄 4시간이 경과하여 매물 데이터를 새로고침합니다...');
        apiCurrentPage = 1; // 페이지 번호 초기화
        loadProperties(); // 첫 페이지부터 다시 로드
    }, 14400000); // 4시간 = 4 * 60 * 60 * 1000 = 14,400,000ms
});
