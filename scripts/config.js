// scripts/config.js — 여기 값만 고치면 청첩장이 바뀝니다.
window.WEDDING_CONFIG = {
  // ── 기본 정보 ──
  groom: { name: "탁성준", given: "성준", parents: "탁치민 · 조향운", rel: "장남" }, // 신랑 (given=성 뺀 이름=혼주줄용, rel=서열)
  bride: { name: "김혜린", given: "혜린", parents: "김화성 · 조애리", rel: "장녀" }, // 신부
  wedding: {
    // 예식 일시: 오프셋 없는 로컬 표기(한국 시간 기준). 어느 기기에서 열어도 동일하게 표시됩니다.
    datetime: "2026-09-12T17:00:00",
    venue: "JW 메리어트 호텔 서울 7층 더 마고 그릴", // 화면 표시용 이름
    venueSearch: "JW 메리어트 호텔 서울", // 지도 길찾기 검색용 이름 (지도에서 검색되는 상호)
    address: "서울 서초구 신반포로 176", // 주소
    lat: 37.5045, // 위도 (JW 메리어트 호텔 서울, 정밀 좌표 원하면 지도에서 확인해 교체)
    lng: 127.0046, // 경도
  },
  greeting:
    "소중한 인연을 맺은 두 사람이\n이제 평생을 함께 걸어가려 합니다.\n\n가족들과 함께하는 작은 예식으로 진행하게 되어\n한 분 한 분 직접 모시지 못하는 점 너른 양해 부탁드립니다.\n\n멀리서 전해주시는 따뜻한 축하의 마음만으로도\n저희에겐 큰 기쁨이 될 것 같습니다.\n\n행복하게 잘 살겠습니다.",
  photos: { main: "images/main.jpg", sub: "images/sub.jpg" }, // 파일 없으면 자동 플레이스홀더
  heroCaption: "", // 메인 사진 아래 문구 (비우면 표시 안 함)

  // ── 선택 기능 ──
  kakaoJsKey: "9477d82b3524d31cc947a01f4c5303de", // 카카오 JS 키(공개용, 도메인 등록으로 보호)

  // ── 표시 설정 ──
  theme: "classic", // 확정 테마: minimal | fresh | classic | natural | reference (언제든 변경 가능)
  previewMode: false, // 배포용: 하객에겐 테마 바 숨김. 다시 비교하려면 true로.
};
