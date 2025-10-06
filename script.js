let watchSeconds = 0;
let attendanceGiven = false;
let watchInterval;
const attendanceTime = 4600; // 출석 인정 기준 시간 (초)
let studentName = "";

const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwhqxyf7UaLqlzw_2BxD5gDA1ePYgL26JhRkQwbeRyBkdP4JfkYmPMAVO5RSDrbX7yT/exec"; 

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

  const video = document.getElementById('lecture-video');

  video.addEventListener('play', () => {
    watchInterval = setInterval(() => {
      watchSeconds++;
      document.getElementById('watch-time').innerText = watchSeconds;

      if (watchSeconds >= attendanceTime && !attendanceGiven) {
        document.getElementById('attendance-status').innerText = '출석 완료';
        attendanceGiven = true;
        sendAttendance();
      }
    }, 1000);
  });

  video.addEventListener('pause', () => clearInterval(watchInterval));
  video.addEventListener('ended', () => clearInterval(watchInterval));
}

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
