// Vai trò và danh sách nhân viên.
// Muốn thêm người: thêm 1 dòng vào AGENTS + 1 bàn trong DESKS (src/world/office.js) với cùng id.

export const ROLES = {
  dev: {
    label: 'Developer',
    shirt: '#3b6fd1', pants: '#2d3550', accessory: 'headphones', accent: '#ff6fa8',
    work: ['Đang fix bug #%n...', 'Chạy được trên máy em mà!', 'Merge conflict rồi...', 'Refactor tí thôi', 'npm install mãi chưa xong', 'Viết unit test nè', 'Ai viết code này vậy?! À, mình...'],
    visit: ['Ông xem PR giúp tôi', 'API này trả 500 nè', 'Pair code tí không?'],
    reply: ['Để tôi xem', 'Ok, 5 phút nữa', 'Đang build...'],
    visitTargets: ['dev', 'devops'],
  },
  designer: {
    label: 'Designer',
    shirt: '#e2557a', pants: '#3a2d45', accessory: 'beret', accent: '#c23b5a',
    work: ['Lệch 1px rồi kìa!', 'Đổi màu primary nhé', 'Thêm chút bo góc', 'Figma lag quá', 'Font này đẹp ghê', 'Dark mode cũng phải đẹp'],
    visit: ['Chỗ này lệch so với design nè', 'Animation mượt hơn được không?', 'Spacing 8px chứ không phải 7px'],
    reply: ['Ok để chỉnh lại', 'Gửi link Figma nhé'],
    visitTargets: ['dev'],
  },
  tester: {
    label: 'Tester',
    shirt: '#3aa36b', pants: '#2d3a33', accessory: 'glasses',
    work: ['Test case #%n PASS', 'Tìm thấy bug rồi!', 'Repro được 100%', 'Viết test plan', 'Regression test...', 'Bấm 100 lần liên tục xem sao'],
    visit: ['Bug này repro được nè', 'Fix xong chưa để em test lại?', 'Bấm nút này app crash luôn'],
    reply: ['Hả, sao lại thế?', 'Feature đó, không phải bug!', 'Để anh fix'],
    visitTargets: ['dev'],
  },
  pm: {
    label: 'Project Manager',
    shirt: '#f2f2f2', pants: '#2b2f3a', accessory: 'tie', accent: '#c0392b',
    work: ['Deadline thứ 6 nhé', 'Cập nhật Jira giúp chị', 'Sprint này ổn không?', 'Viết báo cáo tiến độ', 'Khách hàng đang hỏi...', 'Lên kế hoạch sprint tới'],
    visit: ['Task này xong chưa em?', 'Có blocker gì không?', 'Ước lượng giúp chị nhé'],
    reply: ['Dạ sắp xong rồi', 'Còn 80% chị ơi', 'Hôm nay xong ạ'],
    visitTargets: ['dev', 'designer', 'tester', 'devops', 'ba'],
  },
  devops: {
    label: 'DevOps',
    shirt: '#3d3d4a', pants: '#24242e', accessory: 'beanie', accent: '#e67e22',
    work: ['Server CPU 99%!', 'Deploy xong rồi', 'Ai sửa config prod?!', 'Pipeline xanh rồi', 'docker compose up', 'Backup database...', 'Kubernetes lại dỗi'],
    visit: ['Đừng push thẳng lên main nữa', 'Log báo lỗi service của ông', 'Deploy giờ được không?'],
    reply: ['Ok đợi pipeline', 'Để tôi check log'],
    visitTargets: ['dev'],
  },
  ba: {
    label: 'Business Analyst',
    shirt: '#9b59b6', pants: '#2d2540', accessory: 'lanyard', accent: '#f1c40f',
    work: ['Requirement đổi rồi...', 'Viết user story', 'Khách muốn thêm tính năng', 'Vẽ flow nghiệp vụ', 'Họp với khách xong rồi'],
    visit: ['Luồng này khách muốn khác', 'Xem giúp acceptance criteria', 'Có câu hỏi về requirement'],
    reply: ['Lại đổi nữa à?', 'Ok để ghi lại'],
    visitTargets: ['pm', 'dev', 'designer'],
  },
};

const SKIN = ['#f1c9a0', '#e8b48a', '#d9a066', '#c68a5a', '#f5d5b8'];
const HAIR = { black: '#231a16', brown: '#5a3a24', dark: '#3a2a20', red: '#a8442a', blonde: '#d9b45a', blue: '#3b5bdb', pink: '#e86fa8' };

export const AGENTS = [
  { id: 'dev1',  name: 'Minh',  role: 'dev',      skin: SKIN[0], hair: HAIR.black, hairStyle: 'spiky' },
  { id: 'dev2',  name: 'Khoa',  role: 'dev',      skin: SKIN[2], hair: HAIR.dark,  hairStyle: 'short' },
  { id: 'dev3',  name: 'Huy',   role: 'dev',      skin: SKIN[1], hair: HAIR.blue,  hairStyle: 'fringe' },
  { id: 'dev4',  name: 'Tuấn',  role: 'dev',      skin: SKIN[3], hair: HAIR.black, hairStyle: 'short' },
  { id: 'des1',  name: 'Linh',  role: 'designer', skin: SKIN[4], hair: HAIR.pink,  hairStyle: 'long' },
  { id: 'des2',  name: 'Vy',    role: 'designer', skin: SKIN[0], hair: HAIR.brown, hairStyle: 'bun' },
  { id: 'test1', name: 'Nam',   role: 'tester',   skin: SKIN[2], hair: HAIR.black, hairStyle: 'short' },
  { id: 'test2', name: 'Thảo',  role: 'tester',   skin: SKIN[1], hair: HAIR.red,   hairStyle: 'long' },
  { id: 'pm',    name: 'Hằng',  role: 'pm',       skin: SKIN[0], hair: HAIR.dark,  hairStyle: 'bun' },
  { id: 'ba',    name: 'Trang', role: 'ba',       skin: SKIN[4], hair: HAIR.blonde, hairStyle: 'long' },
  { id: 'ops1',  name: 'Quân',  role: 'devops',   skin: SKIN[3], hair: HAIR.black, hairStyle: 'short' },
  { id: 'ops2',  name: 'Phúc',  role: 'devops',   skin: SKIN[1], hair: HAIR.brown, hairStyle: 'spiky' },
];

export function lookFor(agent) {
  const role = ROLES[agent.role];
  return {
    skin: agent.skin, hair: agent.hair, hairStyle: agent.hairStyle,
    shirt: role.shirt, pants: role.pants, accessory: role.accessory, accent: role.accent,
  };
}

export const COMMON_LINES = {
  standup: ['Hôm qua em làm xong login', 'Hôm nay em làm tiếp API', 'Không có blocker ạ', 'Em đang bị block bởi BE', 'Em review PR hôm qua rồi'],
  standupLead: ['Bắt đầu standup nhé!', 'Từng người update nào'],
  review: ['Demo tính năng mới nè', 'Sprint này xong 21 point', 'Còn 3 bug tồn', 'Retro: cần test sớm hơn'],
  lunch: ['Cơm tấm ngon ghê', 'Chiều uống trà sữa không?', 'Ăn xong ngủ trưa thôi', 'Bún bò hôm nay cay quá'],
  coffee: ['Cần cà phê gấp...', 'Cà phê sữa đá!', 'Ly thứ 3 trong ngày rồi'],
  water: ['Uống nước cho tỉnh', 'Hôm nay nóng ghê'],
  printer: ['Máy in lại kẹt giấy!', 'In tài liệu họp'],
  arcade: ['Phá kỷ lục rồi!', 'Chơi 1 ván thôi'],
  party: ['Yeahhh!', 'Một hai ba dô!', 'Nhạc hay quá!', 'Cuối tuần rồi!', 'Release thành công!', 'Zô zô zô!'],
  dj: ['Drop the beat!', 'Bài tiếp theo nè'],
  home: ['Về thôi mọi người!', 'Mai gặp lại nhé', 'Bye bye!'],
  arrive: ['Chào buổi sáng!', 'Kẹt xe quá trời', 'Hello mọi người'],
};
