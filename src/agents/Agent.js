// Một nhân vật trong văn phòng: sprite, di chuyển theo đường, tư thế, bong bóng chat.
import { TILE } from '../world/map.js';
import { frameIndex } from '../art/characters.js';
import { ROLES } from './roles.js';

const WALK_SPEED = 60;      // pixel / giây (game time)
const STEP_MS = 110;        // thời gian mỗi bước chân
const UI_DEPTH = 20000;

export class Agent {
  constructor(scene, def) {
    this.scene = scene;
    this.def = def;
    this.id = def.id;
    this.name = def.name;
    this.roleId = def.role;
    this.role = ROLES[def.role];
    this.key = 'char-' + def.id;

    this.sprite = scene.add.sprite(0, 0, this.key, 0).setOrigin(0.5, 1).setVisible(false);
    this.sprite.setInteractive({ useHandCursor: true, pixelPerfect: false });
    this.sprite.agent = this;

    this.tag = scene.add
      .text(0, 0, def.name, { fontFamily: 'monospace', fontSize: '7px', color: '#ffffff', stroke: '#241b2e', strokeThickness: 2 })
      .setOrigin(0.5, 1).setResolution(4).setDepth(UI_DEPTH).setVisible(false);

    this.bubble = null;
    this.tile = { x: 0, y: 0 };
    this.path = [];
    this.dest = null;        // { px, py, face, mode }
    this.onArrive = null;
    this.mode = 'stand';     // walk | stand | sit | dance
    this.face = 'down';
    this.animT = 0;
    this.stepIdx = 0;
    this.present = false;

    // Do Director quản lý
    this.task = null;
    this.activity = 'Chưa đến công ty';
    this.nextLineAt = 0;
  }

  // ---------- Vị trí ----------
  placeAtTile(x, y) {
    this.tile = { x, y };
    this.sprite.setPosition(x * TILE + 8, y * TILE + 14);
  }

  appear(x, y) {
    this.placeAtTile(x, y);
    this.present = true;
    this.sprite.setVisible(true).setAlpha(0);
    this.tag.setVisible(true);
    this.scene.tweens.add({ targets: this.sprite, alpha: 1, duration: 400 });
  }

  disappear() {
    this.present = false;
    this.path = [];
    this.dest = null;
    this.scene.tweens.add({
      targets: this.sprite, alpha: 0, duration: 400,
      onComplete: () => { this.sprite.setVisible(false); this.tag.setVisible(false); },
    });
    this.clearBubble();
  }

  // ---------- Di chuyển ----------
  // target: { x, y } ô đích; pose: { px, py, face, mode }
  walkTo(target, pose, onArrive) {
    const path = this.scene.pathTo(this.tile.x, this.tile.y, target.x, target.y);
    if (!path) return false;
    // Nếu đang ngồi lệch khỏi tâm ô thì về lại tâm ô trước khi đi
    this.sprite.setPosition(this.tile.x * TILE + 8, this.tile.y * TILE + 14);
    this.path = path;
    this.dest = {
      px: pose?.px ?? target.x * TILE + 8,
      py: pose?.py ?? target.y * TILE + 14,
      face: pose?.face ?? 'down',
      mode: pose?.mode ?? 'stand',
    };
    this.onArrive = onArrive || null;
    this.mode = 'walk';
    return true;
  }

  update(dt) {
    if (!this.present) return;
    const s = this.sprite;

    if (this.mode === 'walk') {
      let budget = (WALK_SPEED * dt) / 1000;
      while (budget > 0) {
        const next = this.path[0];
        const tx = next ? next.x * TILE + 8 : this.dest.px;
        const ty = next ? next.y * TILE + 14 : this.dest.py;
        const dx = tx - s.x;
        const dy = ty - s.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.01) {
          if (Math.abs(dx) > Math.abs(dy)) this.face = dx > 0 ? 'right' : 'left';
          else this.face = dy > 0 ? 'down' : 'up';
        }
        if (dist <= budget) {
          s.setPosition(tx, ty);
          budget -= dist;
          if (next) { this.tile = { x: next.x, y: next.y }; this.path.shift(); }
          else { this.arrive(); break; }
        } else {
          s.setPosition(s.x + (dx / dist) * budget, s.y + (dy / dist) * budget);
          budget = 0;
        }
      }
      this.animT += dt;
      if (this.animT > STEP_MS) { this.animT = 0; this.stepIdx = (this.stepIdx + 1) % 4; }
      this.setFrame(this.face, [1, 0, 2, 0][this.stepIdx]);
    } else if (this.mode === 'dance') {
      this.animT += dt;
      if (this.animT > 260) {
        this.animT = 0;
        this.stepIdx = (this.stepIdx + 1) % 4;
        const f = ['down', 'side', 'down', 'side'][this.stepIdx];
        this.face = f === 'side' ? (this.stepIdx === 1 ? 'right' : 'left') : 'down';
        this.setFrame(this.face, this.stepIdx % 2 ? 1 : 2);
      }
      s.y = this.dest.py - (this.stepIdx % 2 ? 2 : 0);
    } else if (this.mode === 'sit' && this.face === 'up') {
      // gõ phím: nhún nhẹ
      this.animT += dt;
      if (this.animT > 500) { this.animT = 0; this.stepIdx = (this.stepIdx + 1) % 2; }
      this.setFrame('up', this.stepIdx ? 1 : 0);
    }

    s.setDepth(s.y);
    this.tag.setPosition(Math.round(s.x), Math.round(s.y - 25));
    if (this.bubble) this.bubble.setPosition(Math.round(s.x), Math.round(s.y - 33));
  }

  arrive() {
    const d = this.dest;
    this.mode = d.mode;
    this.face = d.face;
    this.sprite.setPosition(d.px, d.py);
    this.stepIdx = 0;
    this.setFrame(this.face, 0);
    const cb = this.onArrive;
    this.onArrive = null;
    if (cb) cb();
  }

  setFrame(face, step) {
    const dir = face === 'left' || face === 'right' ? 'side' : face;
    this.sprite.setFrame(frameIndex(dir, step));
    this.sprite.setFlipX(face === 'left');
  }

  get isWalking() { return this.mode === 'walk'; }

  // ---------- Bong bóng chat ----------
  say(text, ms = 2600) {
    if (!this.present) return;
    this.clearBubble();
    const sc = this.scene;
    const t = sc.add.text(0, 0, text, { fontFamily: 'monospace', fontSize: '7px', color: '#241b2e' }).setResolution(4).setOrigin(0.5, 0.5);
    const w = Math.ceil(t.width) + 8;
    const h = Math.ceil(t.height) + 4;
    const g = sc.add.graphics();
    g.fillStyle(0x241b2e, 1).fillRect(-w / 2 - 1, -h - 1, w + 2, h + 2);
    g.fillStyle(0xffffff, 1).fillRect(-w / 2, -h, w, h);
    g.fillStyle(0x241b2e, 1).fillRect(-2, 1, 4, 2);
    g.fillStyle(0xffffff, 1).fillRect(-1, 0, 2, 2);
    t.setPosition(0, -h / 2);
    const c = sc.add.container(this.sprite.x, this.sprite.y - 33, [g, t]).setDepth(UI_DEPTH + 1);
    this.bubble = c;
    c.setScale(0.6);
    sc.tweens.add({ targets: c, scale: 1, duration: 120 });
    this.bubbleTimer = sc.time.delayedCall(ms, () => this.clearBubble());
  }

  clearBubble() {
    if (this.bubbleTimer) this.bubbleTimer.remove(false);
    if (this.bubble) this.bubble.destroy();
    this.bubble = null;
    this.bubbleTimer = null;
  }
}
