// scripts/config.js — 여기 값만 고치면 청첩장이 바뀝니다.
window.WEDDING_CONFIG = {
  // ── 기본 정보 ──
  groom: { name: "김민준", parents: "" }, // 신랑 (parents 예: "김OO·박OO의 장남")
  bride: { name: "이서연", parents: "" }, // 신부
  wedding: {
    // 예식 일시: 오프셋 없는 로컬 표기(한국 시간 기준). 어느 기기에서 열어도 동일하게 표시됩니다.
    datetime: "2026-10-17T13:00:00",
    venue: "OO컨벤션 웨딩홀 3층 그랜드볼룸", // 예식장 이름
    address: "서울특별시 중구 세종대로 110", // 주소
    lat: 37.5665, // 위도 (임시 — 실제 예식장 좌표로 교체)
    lng: 126.9780, // 경도 (임시)
  },
  greeting: "저희 두 사람이 하나가 되는 자리에\n귀한 걸음으로 축복해 주세요.",
  photos: { main: "images/main.jpg", sub: "images/sub.jpg" }, // 파일 없으면 자동 플레이스홀더

  // ── 선택 기능 ──
  kakaoJsKey: "", // 카카오 JS 키(비우면 링크복사/버튼으로 동작, 지도는 이미지)

  // ── 표시 설정 ──
  theme: "minimal", // 확정 테마: minimal | classic | natural | reference
  previewMode: false, // true로 바꾸면 상단에 테마 미리보기 바가 다시 나타납니다.
};
