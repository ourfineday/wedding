// scripts/config.js — 여기 값만 고치면 청첩장이 바뀝니다.
window.WEDDING_CONFIG = {
  // ── 기본 정보 ──
  groom: { name: "탁성준", parents: "" }, // 신랑 (parents = 부모님 성함, 비우면 혼주 표기 생략)
  bride: { name: "김혜린", parents: "" }, // 신부
  wedding: {
    // 예식 일시: 오프셋 없는 로컬 표기(한국 시간 기준). 어느 기기에서 열어도 동일하게 표시됩니다.
    datetime: "2026-09-12T17:00:00",
    venue: "JW 메리어트 호텔 서울", // 예식장 이름 (층/홀 붙이려면 예: "JW 메리어트 호텔 서울 5층 그랜드볼룸")
    address: "서울 서초구 신반포로 176", // 주소
    lat: 37.5045, // 위도 (JW 메리어트 호텔 서울, 정밀 좌표 원하면 지도에서 확인해 교체)
    lng: 127.0046, // 경도
  },
  greeting:
    "저희 두 사람이 새로운 시작을 하게 되었습니다.\n\n가족들과 함께하는 작은 예식으로 진행하게 되어\n한 분 한 분 직접 모시지 못하게 되었습니다.\n\n멀리서 전해주시는 따뜻한 축하의 마음만으로도 큰 기쁨이 될 것 같습니다.\n행복하게 잘 살겠습니다.",
  photos: { main: "images/main.jpg", sub: "images/sub.jpg" }, // 파일 없으면 자동 플레이스홀더
  heroCaption: "새로운 시작, 우리.", // 메인 사진 아래 문구 (비우면 표시 안 함)

  // ── 선택 기능 ──
  kakaoJsKey: "9477d82b3524d31cc947a01f4c5303de", // 카카오 JS 키(공개용, 도메인 등록으로 보호)

  // ── 표시 설정 ──
  theme: "classic", // 확정 테마: minimal | fresh | classic | natural | reference (언제든 변경 가능)
  previewMode: false, // 배포용: 하객에겐 테마 바 숨김. 다시 비교하려면 true로.
};
