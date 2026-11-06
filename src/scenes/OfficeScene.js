import Phaser from 'phaser';
import { bus } from '../bus.js';
import { TILE, MAP_W, MAP_H, ROOMS, buildGrid, isFloorTile, DANCE_FLOOR } from '../world/map.js';
import { FURNITURE, WALL_DECOR, DESKS, SPARE_DESKS, deskSeat, MEETING_SEATS, LUNCH_SEATS } from '../world/office.js';
import { findPath } from '../world/pathfinding.js';
import { buildTileset, TILE_MARGIN, TILE_SPACING } from '../art/tiles.js';
import { FURNITURE_ART } from '../art/furniture.js';
import { buildCharacterSheet, FW, FH } from '../art/characters.js';
import { AGENTS, lookFor } from '../agents/roles.js';
import { Agent } from '../agents/Agent.js';
import { Director } from '../agents/Director.js';
import { globalEvent, nextEvent, fmtTime } from '../agents/schedule.js';

const MAP_PX_W = MAP_W * TILE;
const MAP_PX_H = MAP_H * TILE;

export class OfficeScene extends Phaser.Scene {
  constructor() {
    super('office');
    this.speed = 1;
  }

  create() {
    this.buildTextures();
    this.buildMap();
    this.buildFurniture();
    this.buildEffects();
    this.buildAgents();
    this.setupCamera();
    this.setupBus();
  }

  // ---------- Texture (vẽ bằng code) ----------
  addSheet(key, canvases) {
    const list = Array.isArray(canvases) ? canvases : [canvases];
    const w = list[0].width;
    const h = list[0].height;
    const sheet = document.createElement('canvas');
    sheet.width = w * list.length;
    sheet.height = h;
    const g = sheet.getContext('2d');
    list.forEach((c, i) => g.drawImage(c, i * w, 0));
    const tex = this.textures.addCanvas(key, sheet);
    list.forEach((_, i) => tex.add(i, 0, i * w, 0, w, h));
    return list.length;
  }

  buildTextures() {
    this.textures.addCanvas('tiles', buildTileset());
    for (const [key, fn] of Object.entries(FURNITURE_ART)) {
      const frames = this.addSheet(key, fn());
      if (frames > 1)
        this.anims.create({
          key: key + '-anim',
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: frames - 1 }),
          frameRate: key === 'rack' ? 2 : 6,
          repeat: -1,
        });
    }
    for (const def of AGENTS) {
      const sheet = buildCharacterSheet(lookFor(def));
      const tex = this.textures.addCanvas('char-' + def.id, sheet);
      for (let i = 0; i < 9; i++) tex.add(i, 0, i * FW, 0, FW, FH);
    }
  }

  // ---------- Bản đồ ----------
  buildMap() {
    this.grid = buildGrid();
    const map = this.make.tilemap({ data: this.grid, tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, TILE_MARGIN, TILE_SPACING);
    map.createLayer(0, tileset, 0, 0).setDepth(0);

    this.walk = this.grid.map((row) => row.map((t) => isFloorTile(t)));

    // Tên phòng mờ trên sàn
    for (const r of Object.values(ROOMS)) {
      this.add
        .text(((r.x1 + r.x2 + 1) / 2) * TILE, (r.y2 + 1) * TILE - 4, r.name.toUpperCase(), {
          fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
        })
        .setOrigin(0.5, 1).setAlpha(0.35).setResolution(4).setDepth(2);
    }
  }

  block(tx, ty, w, h) {
    for (let y = ty; y < ty + h; y++) for (let x = tx; x < tx + w; x++) if (this.walk[y]) this.walk[y][x] = false;
  }

  placeItem(key, tx, ty, w, h, { flat = false, anim = false } = {}) {
    const s = this.add.sprite(tx * TILE - 1, (ty + h) * TILE + 1, key, 0).setOrigin(0, 1);
    s.setDepth(flat ? 1 : (ty + h) * TILE);
    if (anim) s.play({ key: key + '-anim', delay: Math.random() * 1500 });
    return s;
  }

  buildFurniture() {
    for (const f of FURNITURE) {
      this.placeItem(f.key, f.tx, f.ty, f.w, f.h, f);
      if (f.block !== false) this.block(f.tx, f.ty, f.w, f.h);
    }
    // Bàn làm việc + ghế
    const desks = [...Object.values(DESKS), ...SPARE_DESKS];
    for (const d of desks) {
      this.placeItem('desk-' + d.screen, d.tx, d.ty, 2, 1);
      this.block(d.tx, d.ty, 2, 1);
      this.placeChair(deskSeat(d));
    }
    MEETING_SEATS.forEach((s) => this.placeChair(s));
    LUNCH_SEATS.forEach((s) => this.placeChair(s));
    // Đồ treo tường
    for (const w of WALL_DECOR) this.add.image(w.px, w.py, w.key).setOrigin(0, 0).setDepth(3);
  }

  placeChair(s) {
    if (s.chair === 'desk') this.add.image(s.px, s.py + 3, 'chair-desk').setOrigin(0.5, 1).setDepth(s.py + 1);
    else if (s.chair === 'meet') this.add.image(s.px, s.py + 3, 'chair-meet').setOrigin(0.5, 1).setDepth(s.py + 1);
    else if (s.chair === 'meet-back') this.add.image(s.px, s.py - 8, 'chair-meet-back').setOrigin(0.5, 1).setDepth(s.py - 1);
    else if (s.chair === 'stool') this.add.image(s.px, s.py + 2, 'chair-stool').setOrigin(0.5, 1).setDepth(s.py - 1);
  }

  // ---------- Hiệu ứng: ngày/đêm, đèn disco ----------
  buildEffects() {
    this.night = this.add.rectangle(0, 0, MAP_PX_W, MAP_PX_H, 0x0b0b2a, 0).setOrigin(0, 0).setDepth(15000);

    const ballX = ((DANCE_FLOOR.x1 + DANCE_FLOOR.x2 + 1) / 2) * TILE;
    this.add.rectangle(ballX, 24 * TILE + 8, 1, 2 * TILE + 2, 0x9aa0ad).setOrigin(0.5, 0).setDepth(15002);
    this.disco = this.add.sprite(ballX, 27 * TILE + 4, 'disco-ball').setDepth(15003);
    this.disco.play('disco-ball-anim');

    this.lights = [0xff6fa8, 0x6fd3ff, 0xffe06f, 0x8cff8a, 0xc39bff].map((c, i) =>
      this.add.circle(0, 0, 14, c, 0.0).setDepth(15001).setBlendMode(Phaser.BlendModes.ADD).setData('phase', i * 1.3),
    );
  }

  updateEffects(minutes, time) {
    // tối dần sau 17:00, sáng dần lúc sáng sớm
    let a = 0;
    if (minutes > 17 * 60) a = Math.min(0.42, ((minutes - 17 * 60) / 90) * 0.42);
    else if (minutes < 8 * 60 + 20) a = 0.25 * (1 - (minutes - (7 * 60 + 50)) / 30);
    this.night.setAlpha(Math.max(0, a));

    const party = globalEvent(minutes)?.id === 'party';
    const cx = ((DANCE_FLOOR.x1 + DANCE_FLOOR.x2 + 1) / 2) * TILE;
    const cy = ((DANCE_FLOOR.y1 + DANCE_FLOOR.y2 + 1) / 2) * TILE;
    const t = time / 700;
    this.lights.forEach((l) => {
      const p = l.getData('phase');
      l.setPosition(cx + Math.cos(t + p) * 80, cy + Math.sin(t * 1.3 + p) * 40);
      l.setFillStyle(l.fillColor, party ? 0.35 : 0);
    });
    this.disco.anims.timeScale = party ? 1 : 0;
  }

  // ---------- Nhân viên ----------
  buildAgents() {
    this.agents = AGENTS.map((def) => new Agent(this, def));
    this.director = new Director(this, this.agents);

    this.marker = this.add.triangle(0, 0, 0, 0, 6, 0, 3, 4, 0xffd166).setOrigin(0.5, 1).setDepth(20002).setVisible(false);
    this.tweens.add({ targets: this.marker, scaleY: 0.6, yoyo: true, repeat: -1, duration: 350 });
  }

  pathTo(sx, sy, tx, ty) {
    return findPath(this.walk, sx, sy, tx, ty);
  }

  // ---------- Camera ----------
  fitZoom() {
    const { width, height } = this.scale;
    return Math.min(width / MAP_PX_W, (height - 90) / MAP_PX_H);
  }

  // Zoom mặc định: màn hình dọc (điện thoại) thì lấp đầy chiều cao rồi vuốt ngang
  startZoom() {
    const { width, height } = this.scale;
    if (width < height) return Math.max(this.fitZoom(), (height - 150) / MAP_PX_H);
    return this.fitZoom();
  }

  // Khi bản đồ nhỏ hơn màn hình thì nới biên để bản đồ nằm giữa
  updateBounds() {
    const cam = this.cameras.main;
    const vw = this.scale.width / cam.zoom;
    const vh = this.scale.height / cam.zoom;
    const px = Math.max(0, (vw - MAP_PX_W) / 2);
    const py = Math.max(0, (vh - MAP_PX_H) / 2);
    cam.setBounds(-px, -py, MAP_PX_W + px * 2, MAP_PX_H + py * 2);
  }

  setupCamera() {
    const cam = this.cameras.main;
    cam.setZoom(this.startZoom());
    this.updateBounds();
    cam.centerOn(MAP_PX_W / 2, MAP_PX_H / 2);
    if (this.scale.width < this.scale.height) cam.centerOn(ROOMS.work.x2 * TILE * 0.5, MAP_PX_H / 2);
    this.scale.on('resize', () => {
      cam.setZoom(Math.max(cam.zoom, this.fitZoom()));
      this.updateBounds();
    });

    const clampZoom = (z) => Phaser.Math.Clamp(z, this.fitZoom(), 6);

    this.input.on('wheel', (p, objs, dx, dy) => {
      cam.setZoom(clampZoom(cam.zoom * (1 - dy * 0.0015)));
    });

    this.input.on('pointermove', (p) => {
      const p1 = this.input.pointer1;
      const p2 = this.input.pointer2;
      if (p1.isDown && p2.isDown) {
        const d = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        if (this.pinch) cam.setZoom(clampZoom(cam.zoom * (d / this.pinch)));
        this.pinch = d;
        return;
      }
      this.pinch = null;
      if (!p.isDown) return;
      if (p.getDistance() > 4 && this.followed) this.setFollow(false);
      cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
      cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
    });
    this.input.on('pointerup', () => { this.pinch = null; });

    this.input.on('gameobjectup', (p, obj) => {
      if (obj.agent && p.getDistance() < 8) this.select(obj.agent);
    });

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,Q,E');
  }

  moveCameraByKeys(delta) {
    const k = this.keys;
    const cam = this.cameras.main;
    const v = (delta * 0.4) / cam.zoom;
    if (k.A.isDown || k.LEFT.isDown) cam.scrollX -= v;
    if (k.D.isDown || k.RIGHT.isDown) cam.scrollX += v;
    if (k.W.isDown || k.UP.isDown) cam.scrollY -= v;
    if (k.S.isDown || k.DOWN.isDown) cam.scrollY += v;
    if (k.Q.isDown) cam.setZoom(Math.max(this.fitZoom(), cam.zoom * 0.98));
    if (k.E.isDown) cam.setZoom(Math.min(6, cam.zoom * 1.02));
  }

  gotoRoom(id) {
    const cam = this.cameras.main;
    this.setFollow(false);
    if (id === 'all') {
      cam.zoomTo(this.fitZoom(), 500);
      cam.pan(MAP_PX_W / 2, MAP_PX_H / 2, 500, 'Sine.easeInOut');
      return;
    }
    const r = ROOMS[id];
    const w = (r.x2 - r.x1 + 3) * TILE;
    const h = (r.y2 - r.y1 + 5) * TILE;
    const z = Math.min(6, Math.min(this.scale.width / w, (this.scale.height - 90) / h));
    cam.pan(((r.x1 + r.x2 + 1) / 2) * TILE, ((r.y1 + r.y2 + 1) / 2 - 1) * TILE, 500, 'Sine.easeInOut');
    cam.zoomTo(Math.max(z, this.fitZoom()), 500);
  }

  // ---------- Chọn nhân vật ----------
  select(agent) {
    this.selected = agent;
    this.marker.setVisible(!!agent);
    if (!agent) { bus.emit('select', null); this.setFollow(false); return; }
    bus.emit('select', {
      name: agent.name,
      role: agent.role.label,
      activity: agent.activity,
      sheet: this.textures.get(agent.key).getSourceImage(),
      following: this.followed === agent,
    });
  }

  setFollow(on) {
    const cam = this.cameras.main;
    if (on && this.selected) {
      this.followed = this.selected;
      cam.startFollow(this.selected.sprite, true, 0.12, 0.12);
      if (cam.zoom < 3) cam.zoomTo(3, 400);
    } else {
      if (this.followed) bus.emit('follow-stopped');
      this.followed = null;
      cam.stopFollow();
    }
  }

  setupBus() {
    bus.on('speed', (s) => { this.speed = s; });
    bus.on('goto-room', (id) => this.gotoRoom(id));
    bus.on('deselect', () => this.select(null));
    bus.on('follow', (on) => this.setFollow(on));
  }

  // ---------- Vòng lặp ----------
  update(time, delta) {
    const dt = Math.min(delta, 100) * this.speed;
    this.director.tick(dt);
    const m = this.director.minutes;
    this.updateEffects(m, time);
    this.moveCameraByKeys(delta);
    this.updateBounds();

    // Chỉ hiện tên khi zoom đủ gần (hoặc nhân vật đang được chọn) để đỡ rối
    const showTags = this.cameras.main.zoom >= 2.2;
    for (const a of this.agents) a.tag.setVisible(a.present && a.sprite.visible && (showTags || a === this.selected));

    const minuteKey = Math.floor(m);
    if (minuteKey !== this.lastMinute) {
      this.lastMinute = minuteKey;
      const ev = globalEvent(m);
      const nx = nextEvent(m);
      bus.emit('clock', {
        clock: `Ngày ${this.director.day} · ${fmtTime(m)}`,
        event: ev ? `Đang diễn ra: ${ev.label}` : nx ? `Tiếp theo: ${nx.label} lúc ${fmtTime(nx.start)}` : 'Hết giờ làm',
      });
      if (this.selected) bus.emit('activity', this.selected.activity);
    }

    if (this.selected) {
      const s = this.selected.sprite;
      this.marker.setVisible(s.visible).setPosition(s.x, s.y - 32);
    }
  }
}
