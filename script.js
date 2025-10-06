let player;
let watchSeconds = 0;
let attendanceGiven = false;
let watchInterval;
const attendanceTime = 10; // 4600 출석 기준 (초)
let studentName = "";

const SHEET_WEBHOOK_URL = "AKfycbwXptSa8x2tfk40AS2DDI_zw2V8TgxyPul0wK36yHxdC8OUqvn8qiz3lU1sBoTD-o-W"; // <- Apps Script URL

// 1. 로그인
function login() {
  const nameInput = document.getElementById('student-id');
  studentName = nameInput.value.trim();

  if (studentName === "") {
    alert("이름을 입력하세요.");
    return;
  }

  document.getElementById('login-section').style.display = 'none';
  document.getElementById('lecture-section').style.display = 'block';
  document.getElementById('welcome-msg').innerText = `${studentName}님, 강의를 시청해 주세요.`;

  // YouTube API 로딩 → player 생성
  loadYouTubePlayer();
}

// 2. YouTube API가 iframe ready 되면 호출됨
function onYouTubeIframeAPIReady() {
  // nothing here — we'll call it after login
}

// 3. 플레이어 생성
function loadYouTubePlayer() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: 'zOiRQD_i6kc', // <-- YouTube
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. 재생 상태 감지 → 시청 시간 측정
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    // 재생 시작 → 시청 시간 측정 시작
    if (!watchInterval) {
      watchInterval = setInterval(() => {
        watchSeconds++;
        document.getElementById('watch-time').innerText = watchSeconds;

        if (watchSeconds >= attendanceTime && !attendanceGiven) {
          attendanceGiven = true;
          document.getElementById('attendance-status').innerText = '출석 완료';
          sendAttendance();
        }
      }, 1000);
    }
  } else {
    // 일시정지나 정지 → 시간 측정 중지
    clearInterval(watchInterval);
    watchInterval = null;
  }
}

// 5. 출석 정보 전송
function sendAttendance() {
  fetch(SHEET_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({
      name: studentName,
      watchTime: watchSeconds,
      status: "출석 완료"
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.text())
  .then(msg => console.log("✅ 출석 처리됨:", msg))
  .catch(err => console.error("❌ 출석 전송 실패:", err));
}
