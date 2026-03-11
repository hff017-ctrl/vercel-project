// ===== 네이버 부동산 API 프록시 서버 (Vercel Serverless Function) =====
// Vercel Serverless Function으로 CORS 문제를 해결하고 네이버 부동산 데이터를 가져옵니다.

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 네이버 부동산 API 설정
const NAVER_API_BASE = 'https://m.land.naver.com/agency/info/list';
const REALTOR_ID = process.env.REALTOR_ID || '6441115'; // 삼성래미안부동산 중개사 ID

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET 요청만 허용
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const page = req.query.page || 1;
        const tradeType = req.query.tradeType || ''; // 매매(A1), 전세(B1), 월세(B2)

        let tradTpCd = '';
        if (tradeType === '매매') tradTpCd = 'A1';
        else if (tradeType === '전세') tradTpCd = 'B1';
        else if (tradeType === '월세') tradTpCd = 'B2';

        // tradTpCd 파라미터가 있으면 추가, 없으면 전체(또는 네이버 기본값)
        const url = `${NAVER_API_BASE}?rltrMbrId=${REALTOR_ID}&page=${page}${tradTpCd ? `&tradTpCd=${tradTpCd}` : ''}`;

        console.log(`📡 네이버 부동산 API 호출: ${url}`);

        const axios = require('axios');

        // 랜덤 User-Agent 목록 (네이버 차단 우회)
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
        ];
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

        // 재시도 로직 축소 (Vercel 타임아웃 방지)
        let response;
        let lastError;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                if (attempt > 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                response = await axios.get(url, {
                    headers: {
                        'User-Agent': randomUA,
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Referer': 'https://m.land.naver.com/',
                        'Origin': 'https://m.land.naver.com',
                        'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin'
                    },
                    timeout: 8000 // 8초로 단축
                });
                break;
            } catch (retryErr) {
                console.log(`⚠️ 시도 ${attempt}/2 실패: ${retryErr.message}`);
                lastError = retryErr;
                if (attempt === 2) throw lastError;
            }
        }

        if (response.data.code === '999') {
            throw new Error('네이버 API 접근이 차단되었습니다 (코드 999).');
        }

        const data = response.data;

        if (!data || !data.list) {
            console.log('⚠️ 데이터가 없습니다.');
            return res.json({
                success: true,
                totalCount: 0,
                currentPage: page,
                properties: []
            });
        }

        const properties = await transformNaverData(data.list);

        res.json({
            success: true,
            totalCount: data.totalCnt || data.list.length,
            currentPage: data.page || page,
            pageSize: data.pageSize || 20,
            properties: properties
        });

        console.log(`✅ ${properties.length}개 매물 전송 완료`);

    } catch (error) {
        console.error('❌ API 오류:', error.message);
        res.status(500).json({
            success: false,
            error: '매물 정보를 가져오는데 실패했습니다.',
            message: error.message
        });
    }
};

// 매물 데이터 변환 함수
async function transformNaverData(list) {
    if (!list || !Array.isArray(list)) return [];

    return list.map(item => {
        const hasImage = item.repImgUrl && item.repImgUrl.trim() !== '';

        // 매물 유형 확인
        const propertyType = item.atclRletTpNm || '';
        const isLand = propertyType.includes('토지');

        // 토지는 ㎡만, 나머지는 ㎡(전용) 표시
        const sizeDisplay = isLand ? `${item.spc1}㎡` : `${item.spc2}㎡(전용)`;

        return {
            id: item.atclNo,
            type: item.tradTpNm, // 매매, 전세, 월세
            propertyType: item.atclRletTpNm, // 매물 종류 (아파트, 상가 등) - 필터링용
            title: item.atclNm,
            location: item.bildNm || item.atclNm, // 동 정보만 표시 (호수 제외)
            price: formatPrice(item.prcInfo, item.tradTpCd, item.rentPrc), // rentPrc(월세) 추가
            size: sizeDisplay,
            rooms: extractRooms(item.tagList, item),
            bathrooms: extractBathrooms(item.tagList, item),
            image: hasImage ? `https://landthumb-phinf.pstatic.net${item.repImgUrl}` : getDefaultImage(),
            hasRealImage: hasImage, // 실제 이미지 여부
            badge: getBadge(item.tagList, item.atclCfmYmd),
            description: item.atclFetrDesc,
            floor: item.flrInfo,
            direction: item.direction,
            building: item.bildNm,
            tags: item.tagList || [],
            confirmed: item.atclCfmYmd,
            naverUrl: `https://m.land.naver.com/article/info/${item.atclNo}`
        };
    });
}

// 가격 포맷팅
function formatPrice(price, tradeTpCd, rentPrice) {
    // 월세 - 보증금 / 월세 형식
    if (tradeTpCd === 'B2') {
        // price(prcInfo)에 이미 슬래시가 있으면 그대로 사용
        if (String(price).includes('/')) {
            return price;
        }

        const priceNum = parseInt(price.replace(/,/g, ''));
        const rentNum = parseInt(rentPrice || 0);

        if (isNaN(priceNum)) return price;

        const toKoreanMoney = (num) => {
            if (num >= 10000) {
                const billions = Math.floor(num / 10000);
                const remainder = num % 10000;
                return remainder > 0 ? `${billions}억 ${remainder.toLocaleString()}` : `${billions}억`;
            }
            return num > 0 ? `${num.toLocaleString()}` : '0';
        };

        const formattedDeposit = toKoreanMoney(priceNum);
        return rentNum > 0 ? `${formattedDeposit}/${rentNum}` : formattedDeposit;
    }

    // 일반 가격 처리 (억/만)
    const priceNum = parseInt(price.replace(/,/g, ''));
    if (isNaN(priceNum)) return price;

    if (priceNum >= 10000) {
        const billions = Math.floor(priceNum / 10000);
        const remainder = priceNum % 10000;
        return remainder > 0 ? `${billions}억 ${remainder.toLocaleString()}` : `${billions}억`;
    }
    return priceNum.toLocaleString();
}

// 방 개수 추출
function extractRooms(tags, item) {
    if (item && item.roomCnt) return String(item.roomCnt);

    const desc = item && item.atclFetrDesc ? item.atclFetrDesc : '';
    const textToCheck = (tags || '') + ' ' + desc; // 태그와 설명 모두 검색

    // "방수/욕실수 3/2" 패턴 매칭 (네이버 상세정보 형식)
    const combinedMatch = textToCheck.match(/방수\/욕실수[:\s]*(\d+)\/(\d+)/);
    if (combinedMatch) return combinedMatch[1];

    // "3/2개" 패턴 매칭 (약식 표현) - 사용자가 요청한 형식
    const shortMatch = textToCheck.match(/(\d+)\/(\d+)개/);
    if (shortMatch) return shortMatch[1];

    // "방3", "방3개" 등 매칭
    const match = textToCheck.match(/방(\d+)개?/);
    if (match) return match[1];

    if (textToCheck.includes('방네개이상')) return '4';
    if (textToCheck.includes('방세개')) return '3';
    if (textToCheck.includes('방두개')) return '2';
    if (textToCheck.includes('방4')) return '4';
    if (textToCheck.includes('방3')) return '3';
    if (textToCheck.includes('방2')) return '2';

    return ''; // 정보가 없으면 표시 안 함
}

// 욕실 개수 추출
function extractBathrooms(tags, item) {
    if (item && item.bathCnt) return String(item.bathCnt);

    const desc = item && item.atclFetrDesc ? item.atclFetrDesc : '';
    const textToCheck = (tags || '') + ' ' + desc; // 태그와 설명 모두 검색

    // "방수/욕실수 3/2" 패턴 매칭 (네이버 상세정보 형식)
    const combinedMatch = textToCheck.match(/방수\/욕실수[:\s]*(\d+)\/(\d+)/);
    if (combinedMatch) return combinedMatch[2];

    // "3/2개" 패턴 매칭 (약식 표현) - 사용자가 요청한 형식
    const shortMatch = textToCheck.match(/(\d+)\/(\d+)개/);
    if (shortMatch) return shortMatch[2];

    // "욕실2", "욕실수2" 등 매칭 Regex
    const match = textToCheck.match(/(욕실|화장실|욕실수)[:\s]*(\d+)개?/);
    if (match) return match[2];

    if (textToCheck.includes('화장실두개') || textToCheck.includes('욕실두개') || textToCheck.includes('욕실2')) return '2';
    if (textToCheck.includes('화장실한개') || textToCheck.includes('욕실한개') || textToCheck.includes('욕실1')) return '1';
    if (textToCheck.includes('화장실세개') || textToCheck.includes('욕실세개') || textToCheck.includes('욕실3')) return '3';

    return ''; // 정보가 없으면 표시 안 함
}

// 뱃지 결정
function getBadge(tags, confirmDate) {
    if (!tags) return '신규';
    if (tags.includes('급매')) return '급매';
    if (tags.includes('올수리')) return '올수리';
    if (tags.includes('대형평수')) return '프리미엄';

    // 오늘 등록된 매물
    const today = new Date().toISOString().slice(2, 10).replace(/-/g, '.');
    if (confirmDate && confirmDate.includes(today.slice(0, 8))) {
        return '신규';
    }

    return '추천';
}

// 기본 이미지
function getDefaultImage() {
    const defaultImages = [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}
