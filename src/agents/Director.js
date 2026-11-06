// "Bộ não" của văn phòng: giữ đồng hồ, giao việc cho từng nhân viên theo lịch và theo vai trò.
import { ENTRANCE, roomAt, ROOMS } from '../world/map.js';
import { DESKS, deskSeat, MEETING_SEATS, LUNCH_SEATS, SPOTS, PARTY_AREA } from '../world/office.js';
import { COMMON_LINES } from './roles.js';
import { DAY_START, DAY_END, MINUTES_PER_SECOND, EVENTS, activeEvent } from './schedule.js';

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const key = (x, y) => `${x},${y}`;
const HOME_START = EVENTS.find((e) => e.id === 'home').start;

// Tỉ lệ chọn việc lúc rảnh, theo vai trò
const FREE_WEIGHTS = {
  dev:      { work: 62, coffee: 12, visit: 10, water: 6, arcade: 4, wander: 6 },
  designer: { work: 60, coffee: 10, visit: 16, water: 6, books: 4, wander: 4 },
  tester:   { work: 58, coffee: 10, visit: 22, water: 6, wander: 4 },
  pm:       { work: 40, coffee: 10, visit: 32, printer: 10, wander: 8 },
  devops:   { work: 66, coffee: 14, visit: 10, water: 4, wander: 6 },
  ba:       { work: 50, coffee: 10, visit: 22, printer: 10, books: 4, wander: 4 },
};

function weighted(w) {
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  let r = Math.random() * total;
  for (const [k, v] of Object.entries(w)) if ((r -= v) < 0) return k;
  return 'work';
}

export class Director {
  constructor(scene, agents) {
    this.scene = scene;
    this.agents = agents;
    this.byId = Object.fromEntries(agents.map((a) => [a.id, a]));
    this.minutes = DAY_START;
    this.day = 1;
    this.reserved = new Map(); // "x,y" -> agent id
    agents.forEach((a) => {
      a.seat = deskSeat(DESKS[a.id]);
      a.wentHome = false;
      a.arriveAt = DAY_START + rand(2, 45);
    });
    // Ghế cố định cho họp và ăn trưa (mỗi người 1 chỗ)
    agents.forEach((a, i) => {
      a.meetSeat = MEETING_SEATS[i % MEETING_SEATS.length];
      a.lunchSeat = LUNCH_SEATS[i % LUNCH_SEATS.length];
    });
  }

  tick(dtGame) {
    this.minutes += (dtGame / 1000) * MINUTES_PER_SECOND;
    if (this.minutes >= DAY_END) this.newDay();
    for (const a of this.agents) {
      this.think(a);
      a.update(dtGame);
    }
  }

  newDay() {
    this.minutes = DAY_START;
    this.day++;
    this.reserved.clear();
    for (const a of this.agents) {
      if (a.present) a.disappear();
      a.wentHome = false;
      a.task = null;
      a.activity = 'Chưa đến công ty';
      a.arriveAt = DAY_START + rand(2, 45);
    }
  }

  // ---------- Quyết định mỗi frame ----------
  think(a) {
    const m = this.minutes;
    if (!a.present) {
      if (!a.wentHome && m >= a.arriveAt && m < HOME_START) {
        a.appear(ENTRANCE.x, ENTRANCE.y);
        if (Math.random() < 0.5) a.say(pick(COMMON_LINES.arrive));
        a.task = null;
      } else return;
    }

    const ev = activeEvent(m, a.roleId);
    if (ev) {
      if (a.task?.event !== ev.id) this.startEvent(a, ev);
    } else if (!a.task || a.task.event || (a.task.end != null && m >= a.task.end)) {
      this.startFree(a);
    }

    // Thỉnh thoảng nói 1 câu
    if (a.task?.arrived && m >= a.nextLineAt) {
      a.nextLineAt = m + rand(10, 26);
      if (Math.random() < 0.5 && !this.bubbleNearby(a)) {
        const line = this.lineFor(a);
        if (line) a.say(line);
      }
    }
  }

  // Có ai gần đó đang nói không (tránh bong bóng đè nhau)
  bubbleNearby(a) {
    const s = a.sprite;
    return this.agents.some(
      (b) => b !== a && b.bubble && Math.abs(b.sprite.x - s.x) < 90 && Math.abs(b.sprite.y - s.y) < 40,
    );
  }

  // ---------- Giao việc ----------
  assign(a, task, target, pose, onArrive) {
    this.release(a);
    this.reserved.set(key(target.x, target.y), a.id);
    a.task = task;
    a.activity = task.going;
    const ok = a.walkTo(target, pose, () => {
      task.arrived = true;
      task.end = task.dur != null ? this.minutes + task.dur : null;
      a.activity = task.doing;
      a.nextLineAt = this.minutes + rand(2, 8);
      if (onArrive) onArrive();
    });
    if (!ok) {
      // không tìm được đường → đứng yên rồi thử lại sau
      task.arrived = true;
      task.end = this.minutes + 3;
      a.activity = task.doing;
    }
  }

  release(a) {
    for (const [k, id] of this.reserved) if (id === a.id) this.reserved.delete(k);
  }

  isFree(x, y) {
    return this.scene.walk[y]?.[x] && !this.reserved.has(key(x, y));
  }

  // Tìm ô trống gần (x, y) nhất
  nearbyFree(x, y, maxR = 4) {
    if (this.isFree(x, y)) return { x, y };
    for (let r = 1; r <= maxR; r++) {
      const ring = [];
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++)
          if (Math.max(Math.abs(dx), Math.abs(dy)) === r && this.isFree(x + dx, y + dy)) ring.push({ x: x + dx, y: y + dy });
      if (ring.length) return pick(ring);
    }
    return null;
  }

  startFree(a) {
    let type = weighted(FREE_WEIGHTS[a.roleId]);
    if (type === 'visit') {
      if (this.startVisit(a)) return;
      type = 'coffee';
    }
    if (type === 'wander') {
      const room = ROOMS[roomAt(a.tile.x, a.tile.y) || 'work'];
      const t = this.nearbyFree(Math.round(rand(room.x1, room.x2)), Math.round(rand(room.y1, room.y2)), 3);
      if (t) {
        this.assign(a, { type, going: 'Đi dạo một vòng', doing: 'Đứng nghỉ chân', dur: rand(2, 5) }, t, { face: pick(['down', 'left', 'right']) });
        return;
      }
      type = 'work';
    }
    if (type !== 'work') {
      const spot = SPOTS[type];
      const t = spot && this.nearbyFree(spot.x, spot.y, 2);
      const labels = {
        coffee: ['Đi pha cà phê', 'Đang pha cà phê'],
        water: ['Đi lấy nước', 'Uống nước'],
        printer: ['Ra máy in', 'Đang in tài liệu'],
        books: ['Ra kệ sách', 'Đọc sách'],
        arcade: ['Đi chơi arcade', 'Chơi arcade giải trí'],
      }[type];
      if (t && labels) {
        this.assign(a, { type, going: labels[0], doing: labels[1], dur: rand(6, 14) }, t, { face: spot.face });
        return;
      }
    }
    // Mặc định: về bàn làm việc
    const s = a.seat;
    this.assign(
      a,
      { type: 'work', going: 'Đi về bàn làm việc', doing: 'Đang làm việc', dur: rand(40, 110) },
      s,
      { px: s.px, py: s.py, face: s.face, mode: 'sit' },
    );
  }

  startVisit(a) {
    const targets = this.agents.filter(
      (b) => b !== a && b.present && a.role.visitTargets.includes(b.roleId) && b.task?.type === 'work' && b.task.arrived,
    );
    if (!targets.length) return false;
    const b = pick(targets);
    const s = b.seat;
    const spot = this.isFree(s.x + 1, s.y) ? { x: s.x + 1, y: s.y, face: 'left' } : this.isFree(s.x - 1, s.y) ? { x: s.x - 1, y: s.y, face: 'right' } : null;
    if (!spot) return false;
    this.assign(
      a,
      { type: 'visit', going: `Đi tìm ${b.name}`, doing: `Đang trao đổi với ${b.name}`, dur: rand(6, 12), with: b },
      spot,
      { face: spot.face },
      () => {
        a.say(pick(a.role.visit), 3000);
        this.scene.time.delayedCall(1500, () => b.present && b.say(pick(b.role.reply), 2500));
      },
    );
    return true;
  }

  startEvent(a, ev) {
    const task = { type: ev.place, event: ev.id, going: `Đi tới: ${ev.label}`, doing: ev.label, dur: null };
    if (ev.place === 'meeting') {
      const s = a.meetSeat;
      task.doing = `Đang họp: ${ev.label}`;
      this.assign(a, task, s, { px: s.px, py: s.py, face: s.face, mode: 'sit' }, () => {
        if (a.roleId === 'pm') a.say(pick(COMMON_LINES.standupLead));
      });
    } else if (ev.place === 'lunch') {
      const s = a.lunchSeat;
      task.doing = 'Đang ăn trưa';
      this.assign(a, task, s, { px: s.px, py: s.py, face: s.face, mode: 'sit' });
    } else if (ev.place === 'party') {
      task.doing = 'Đang quẩy ở party';
      if (a.id === 'dev4' && this.isFree(SPOTS.dj.x, SPOTS.dj.y)) {
        task.dj = true;
        task.doing = 'Làm DJ cho party';
        this.assign(a, task, SPOTS.dj, { face: 'down', mode: 'dance' });
        return;
      }
      const dance = Math.random() < 0.7;
      const t = dance
        ? this.nearbyFree(Math.round(rand(PARTY_AREA.x1, PARTY_AREA.x2)), Math.round(rand(PARTY_AREA.y1 + 1, PARTY_AREA.y2)), 3)
        : this.nearbyFree(SPOTS.buffet.x, SPOTS.buffet.y, 3);
      if (!dance) task.doing = 'Ăn bánh ở quầy buffet';
      if (t) this.assign(a, task, t, { face: dance ? 'down' : 'up', mode: dance ? 'dance' : 'stand' });
      else { task.arrived = true; a.task = task; a.activity = task.doing; }
    } else if (ev.place === 'home') {
      task.doing = 'Đang ra về';
      task.going = 'Đang ra về';
      this.release(a);
      a.task = task;
      a.activity = 'Đang ra về';
      if (Math.random() < 0.5) a.say(pick(COMMON_LINES.home));
      const ok = a.walkTo(ENTRANCE, { face: 'left' }, () => {
        a.wentHome = true;
        a.task = null;
        a.activity = 'Đã về nhà';
        a.disappear();
      });
      if (!ok) { a.wentHome = true; a.disappear(); }
    }
  }

  lineFor(a) {
    const t = a.task;
    if (!t) return null;
    const n = () => String(100 + ((Math.random() * 900) | 0));
    switch (t.type) {
      case 'work': return pick(a.role.work).replace('%n', n());
      case 'meeting': return pick(t.event === 'standup' ? COMMON_LINES.standup : COMMON_LINES.review);
      case 'lunch': return pick(COMMON_LINES.lunch);
      case 'party': return pick(t.dj ? COMMON_LINES.dj : COMMON_LINES.party);
      case 'coffee': return pick(COMMON_LINES.coffee);
      case 'water': return pick(COMMON_LINES.water);
      case 'printer': return pick(COMMON_LINES.printer);
      case 'arcade': return pick(COMMON_LINES.arcade);
      default: return null;
    }
  }
}
