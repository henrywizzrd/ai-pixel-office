// Tìm đường BFS trên lưới 4 hướng. Bản đồ nhỏ (60x38) nên BFS là đủ nhanh.
// walk[y][x] = true nếu đi được.

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function findPath(walk, sx, sy, tx, ty) {
  const H = walk.length;
  const W = walk[0].length;
  if (tx < 0 || ty < 0 || tx >= W || ty >= H || !walk[ty][tx]) return null;
  if (sx === tx && sy === ty) return [];

  const prev = new Int32Array(W * H).fill(-1);
  const start = sy * W + sx;
  const goal = ty * W + tx;
  prev[start] = start;
  const queue = [start];

  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi];
    if (cur === goal) break;
    const cx = cur % W;
    const cy = (cur / W) | 0;
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = ny * W + nx;
      if (prev[ni] !== -1 || !walk[ny][nx]) continue;
      prev[ni] = cur;
      queue.push(ni);
    }
  }
  if (prev[goal] === -1) return null;

  const path = [];
  for (let c = goal; c !== start; c = prev[c]) path.push({ x: c % W, y: (c / W) | 0 });
  return path.reverse();
}
