// Kênh sự kiện nhỏ để Phaser scene và HUD (HTML) nói chuyện với nhau.
const target = new EventTarget();

export const bus = {
  emit(name, detail) { target.dispatchEvent(new CustomEvent(name, { detail })); },
  on(name, fn) { target.addEventListener(name, (e) => fn(e.detail)); },
};
