// Gắn HUD (HTML) với game qua bus.
import { bus } from '../bus.js';

export function initHud() {
  const $ = (id) => document.getElementById(id);

  // Tốc độ
  const speedBtns = document.querySelectorAll('#speed-box button');
  speedBtns.forEach((b) =>
    b.addEventListener('click', () => {
      speedBtns.forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      bus.emit('speed', Number(b.dataset.speed));
    }),
  );

  // Chuyển phòng
  document.querySelectorAll('#hud-bottom button').forEach((b) =>
    b.addEventListener('click', () => bus.emit('goto-room', b.dataset.room)),
  );

  // Đồng hồ
  bus.on('clock', ({ clock, event }) => {
    $('clock').textContent = clock;
    $('event').textContent = event;
  });

  // Thông tin nhân vật
  const info = $('info');
  const avatar = $('info-avatar').getContext('2d');
  let following = false;
  bus.on('select', (a) => {
    if (!a) { info.classList.add('hidden'); return; }
    info.classList.remove('hidden');
    $('info-name').textContent = a.name;
    $('info-role').textContent = a.role;
    $('info-activity').textContent = a.activity;
    avatar.clearRect(0, 0, 16, 24);
    avatar.imageSmoothingEnabled = false;
    avatar.drawImage(a.sheet, 0, 0, 16, 24, 0, 0, 16, 24);
    following = a.following;
    $('info-follow').textContent = following ? 'Bỏ theo dõi' : 'Theo dõi';
  });
  bus.on('activity', (text) => { $('info-activity').textContent = text; });
  $('info-close').addEventListener('click', () => bus.emit('deselect'));
  $('info-follow').addEventListener('click', () => {
    following = !following;
    $('info-follow').textContent = following ? 'Bỏ theo dõi' : 'Theo dõi';
    bus.emit('follow', following);
  });
  bus.on('follow-stopped', () => {
    following = false;
    $('info-follow').textContent = 'Theo dõi';
  });
}
