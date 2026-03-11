// ===== 네이버 부동산 매물 데이터 수집 스크립트 =====
// GitHub Actions에서 주기적으로 실행되어 properties-data.json 파일을 생성합니다.

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 설정
const REALTOR_ID = process.env.REALTOR_ID || '6441115';
const NAVER_API_BASE = 'https://m.land.naver.com/agency/info/list';
const OUTPUT_FILE = path.resolve(__dirname, 'properties-data.json');

// 랜덤 User-Agent
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
];

function getRandomUA() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// 네이버 API에서 한 페이지 가져오기
async function fetchPage(page, tradTpCd = '') {
    const url = `${NAVER_API_BASE}?rltrMbrId=${REALTOR_ID}&page=${page}${tradTpCd ? `&tradTpCd=${tradTpCd}` : ''}`;
    console.log(`📡 페이지 ${page} 요청 중: ${url}`);

    const response = await axios.get(url, {
        headers: {
            'User-Agent': getRandomUA(),
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://m.land.naver.com/',
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin'
        },
        timeout: 15000
    });

    return response.data;
}

// 가격 포맷팅
function formatPrice(price, tradeTpCd, rentPrice) {
    if (tradeTpCd === 'B2') {
        if (String(price).includes('/')) return price;
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
    const textToCheck = (tags || '') + ' ' + desc;
    const combinedMatch = textToCheck.match(/방수\/욕실수[:\s]*(\d+)\/(\d+)/);
    if (combinedMatch) return combinedMatch[1];
    const shortMatch = textToCheck.match(/(\d+)\/(\d+)개/);
    if (shortMatch) return shortMatch[1];
    const match = textToCheck.match(/방(\d+)개?/);
    if (match) return match[1];
    if (textToCheck.includes('방네개이상')) return '4';
    if (textToCheck.includes('방세개')) return '3';
    if (textToCheck.includes('방두개')) return '2';
    if (textToCheck.includes('방4')) return '4';
    if (textToCheck.includes('방3')) return '3';
    if (textToCheck.includes('방2')) return '2';
    return '';
}

// 욕실 개수 추출
function extractBathrooms(tags, item) {
    if (item && item.bathCnt) return String(item.bathCnt);
    const desc = item && item.atclFetrDesc ? item.atclFetrDesc : '';
    const textToCheck = (tags || '') + ' ' + desc;
    const combinedMatch = textToCheck.match(/방수\/욕실수[:\s]*(\d+)\/(\d+)/);
    if (combinedMatch) return combinedMatch[2];
    const shortMatch = textToCheck.match(/(\d+)\/(\d+)개/);
    if (shortMatch) return shortMatch[2];
    const match = textToCheck.match(/(욕실|화장실|욕실수)[:\s]*(\d+)개?/);
    if (match) return match[2];
    if (textToCheck.includes('화장실두개') || textToCheck.includes('욕실두개') || textToCheck.includes('욕실2')) return '2';
    if (textToCheck.includes('화장실한개') || textToCheck.includes('욕실한개') || textToCheck.includes('욕실1')) return '1';
    if (textToCheck.includes('화장실세개') || textToCheck.includes('욕실세개') || textToCheck.includes('욕실3')) return '3';
    return '';
}

// 뱃지 결정
function getBadge(tags, confirmDate) {
    if (!tags) return '신규';
    if (tags.includes('급매')) return '급매';
    if (tags.includes('올수리')) return '올수리';
    if (tags.includes('대형평수')) return '프리미엄';
    const today = new Date().toISOString().slice(2, 10).replace(/-/g, '.');
    if (confirmDate && confirmDate.includes(today.slice(0, 8))) return '신규';
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

// 매물 데이터 변환
function transformNaverData(list) {
    if (!list || !Array.isArray(list)) return [];
    return list.map(item => {
        const hasImage = item.repImgUrl && item.repImgUrl.trim() !== '';
        const propertyType = item.atclRletTpNm || '';
        const isLand = propertyType.includes('토지');
        const sizeDisplay = isLand ? `${item.spc1}㎡` : `${item.spc2}㎡(전용)`;

        return {
            id: item.atclNo,
            type: item.tradTpNm,
            propertyType: item.atclRletTpNm,
            title: item.atclNm,
            location: item.bildNm || item.atclNm,
            price: formatPrice(item.prcInfo, item.tradTpCd, item.rentPrc),
            size: sizeDisplay,
            rooms: extractRooms(item.tagList, item),
            bathrooms: extractBathrooms(item.tagList, item),
            image: hasImage ? `https://landthumb-phinf.pstatic.net${item.repImgUrl}` : getDefaultImage(),
            hasRealImage: hasImage,
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

// 메인 실행
async function main() {
    console.log('🏠 네이버 부동산 매물 데이터 수집 시작...');
    console.log(`📋 중개사 ID: ${REALTOR_ID}`);

    const allProperties = [];
    let page = 1;
    let totalCount = 0;
    const pageSize = 20;

    try {
        // 모든 페이지 순회
        while (true) {
            const data = await fetchPage(page);

            if (data.code === '999') {
                throw new Error('네이버 API 접근이 차단되었습니다 (코드 999).');
            }

            if (!data || !data.list || data.list.length === 0) {
                console.log(`📭 페이지 ${page}: 데이터 없음 - 수집 완료`);
                break;
            }

            totalCount = data.totalCnt || totalCount;
            const properties = transformNaverData(data.list);
            allProperties.push(...properties);
            console.log(`✅ 페이지 ${page}: ${properties.length}개 매물 수집 (누적: ${allProperties.length}개)`);

            // 마지막 페이지 확인
            if (data.list.length < pageSize || allProperties.length >= totalCount) {
                break;
            }

            page++;

            // 페이지 간 1초 대기 (네이버 차단 방지)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 결과 저장
        const result = {
            success: true,
            totalCount: allProperties.length,
            lastUpdated: new Date().toISOString(),
            properties: allProperties
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');
        console.log(`\n🎉 완료! ${allProperties.length}개 매물 데이터를 ${OUTPUT_FILE}에 저장했습니다.`);
        console.log(`📅 업데이트 시각: ${result.lastUpdated}`);

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);

        // 기존 파일이 있으면 유지, 없으면 빈 데이터 생성
        if (!fs.existsSync(OUTPUT_FILE)) {
            const emptyResult = {
                success: false,
                totalCount: 0,
                lastUpdated: new Date().toISOString(),
                error: error.message,
                properties: []
            };
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(emptyResult, null, 2), 'utf-8');
            console.log('⚠️ 빈 데이터 파일을 생성했습니다.');
        } else {
            console.log('ℹ️ 기존 데이터 파일을 유지합니다.');
        }

        process.exit(1);
    }
}

main();
