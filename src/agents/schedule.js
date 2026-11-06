// Lịch sinh hoạt trong ngày. Thời gian tính bằng phút kể từ 00:00.
// roles: 'all' hoặc mảng vai trò tham gia.

export const DAY_START = 7 * 60 + 50;   // 07:50
export const DAY_END = 19 * 60 + 20;    // 19:20 → sang ngày mới
export const MINUTES_PER_SECOND = 1;    // 1 giây thực = 1 phút trong game (ở tốc độ 1x)
export const LEAD_MINUTES = 10;         // nhân viên rời chỗ trước sự kiện 10 phút để kịp đi tới

export const EVENTS = [
  { id: 'standup', label: 'Daily standup',   start: 9 * 60,       end: 9 * 60 + 20,  roles: 'all', place: 'meeting' },
  { id: 'lunch',   label: 'Nghỉ trưa',       start: 12 * 60,      end: 13 * 60,      roles: 'all', place: 'lunch' },
  { id: 'review',  label: 'Sprint review',   start: 15 * 60,      end: 15 * 60 + 45, roles: ['pm', 'dev', 'tester', 'ba', 'designer'], place: 'meeting' },
  { id: 'party',   label: 'Happy hour 🎉',   start: 17 * 60 + 30, end: 18 * 60 + 40, roles: 'all', place: 'party' },
  { id: 'home',    label: 'Tan làm',         start: 18 * 60 + 40, end: DAY_END,      roles: 'all', place: 'home' },
];

// Sự kiện mà nhân viên này nên tham gia (tính cả thời gian đi tới trước)
export function activeEvent(minutes, role) {
  return EVENTS.find(
    (e) => minutes >= e.start - (e.id === 'home' ? 0 : LEAD_MINUTES) && minutes < e.end && (e.roles === 'all' || e.roles.includes(role)),
  ) || null;
}

export function globalEvent(minutes) {
  return EVENTS.find((e) => minutes >= e.start && minutes < e.end) || null;
}

export function nextEvent(minutes) {
  return EVENTS.find((e) => e.start > minutes) || null;
}

export function fmtTime(minutes) {
  const m = Math.floor(minutes);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
