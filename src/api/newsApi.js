const mockNews = [
  {
    id: '1',
    title: 'Thunder Strike Gianh Chien Thang Tai Vietnam Grand Prix 2026',
    slug: 'thunder-strike-gianh-chien-thang-vietnam-grand-prix-2026',
    shortDescription:
      'Thunder Strike da co man trinh dien xuat sac va ve dich dau tien tai giai dua Vietnam Grand Prix 2026 voi thanh tich an tuong.',
    content: `Thunder Strike da khang dinh vi the cua minh la mot trong nhung ngua dua hang dau Viet Nam khi gianh chien thang ap dao tai giai Vietnam Grand Prix 2026. Voi thanh tich 1 phut 58 giay tren duong dua 2000m, Thunder Strike da bo xa cac doi thu va mang ve giai thuong lon cho chu so huu.

Jockey Nguyen Van A da co mot chien thuat dua thong minh, giu ngua o vi tri thu 3 trong suot 3/4 chang dua dau tien, sau do tang toc manh me o khuc cua cuoi cung de vuot qua Golden Flash va Midnight Runner.

"Day la mot chien thang quan trong doi voi chung toi", Nguyen Van A chia se sau cuoc dua. "Thunder Strike da tap luyen rat cham chi cho giai dau nay va hom nay ngua da the hien duoc toan bo tiem nang cua minh."

Giai dau Vietnam Grand Prix 2026 da thu hut hang nghin khan gia den san dua, tao nen mot bau khong khi soi dong va day cam xuc.`,
    thumbnail:
      'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGpvY2tleSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzg5MTU1NzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Ket qua dua',
    author: 'Nguyen Thi Lan',
    createdAt: '2026-05-20T10:30:00Z',
    status: 'published',
    featured: true,
  },
  {
    id: '2',
    title: 'Championship Cup 2026: San Sang Cho Mua Giai Moi',
    slug: 'championship-cup-2026-san-sang-cho-mua-giai-moi',
    shortDescription:
      'Giai dau Championship Cup 2026 se chinh thuc khai mac vao ngay 22 thang 6 tai san dua Vung Tau voi su tham gia cua 20 ngua dua xuat sac nhat.',
    content: `Championship Cup 2026 hua hen se la mot trong nhung giai dau dua ngua hap dan nhat trong nam voi tong gia tri giai thuong lon.

Ban to chuc da cong bo danh sach 20 ngua dua duoc lua chon tham gia giai dau, trong do co nhieu cai ten quen thuoc nhu Golden Flash, Royal Destiny va Speed Demon. Dac biet, giai dau nam nay se co su tham gia cua hai ngua dua quoc te tu Uc va Nhat Ban.

San dua Vung Tau da duoc nang cap toan dien voi he thong chieu sang hien dai, khu vuc khan dai moi co suc chua lon va he thong camera 4K phuc vu truyen hinh truc tiep.

Le khai mac giai dau se dien ra vao luc 14:00 ngay 22/6 voi nhieu hoat dong dac sac nhu dieu hanh ngua, bieu dien nghe thuat va gioi thieu cac jockey tham gia.`,
    thumbnail:
      'https://images.unsplash.com/photo-1580831800257-f83135932664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGNoYW1waW9uc2hpcCUyMHRyb3BoeXxlbnwxfHx8fDE3Nzg5MTU1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Su kien',
    author: 'Tran Van Nam',
    createdAt: '2026-05-19T09:15:00Z',
    status: 'published',
    featured: true,
  },
  {
    id: '3',
    title: 'Golden Flash: Hanh Trinh Tu Ngua Non Den Nha Vo Dich',
    slug: 'golden-flash-hanh-trinh-tu-ngua-non-den-nha-vo-dich',
    shortDescription:
      'Cau chuyen day cam hung ve Golden Flash - tu mot chu ngua non duoc huan luyen o nong trai nho den ngoi sao sang gia cua dua ngua Viet Nam.',
    content: `Golden Flash khong phai la mot ngua dua binh thuong. Sinh ra tai mot nong trai nho o Binh Thuan, khong ai nghi rang chu ngua nay se tro thanh mot trong nhung ngua dua xuat sac nhat Viet Nam.

Chu so huu Tran Thi B ke lai: "Khi lan dau nhin thay Golden Flash, toi biet ngay day la mot chu ngua dac biet. Dang nguoi thanh manh nhung co bap san chac, doi mat luon tran day suc song."

Hanh trinh huan luyen Golden Flash khong he de dang. Phai mat 3 nam voi che do tap luyen khac nghiet, dinh duong khoa hoc va su tan tam cua huan luyen vien, Golden Flash moi co the tham gia cac giai dau chuyen nghiep.

Chien thang dau tien den vao nam 2024 tai giai dau Golden Stakes Classic. Ke tu do, Golden Flash da gianh duoc nhieu chien thang va tro thanh mot trong nhung ngua dua duoc yeu thich nhat.`,
    thumbnail:
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjBob3JzZSUyMHJhY2luZ3xlbnwxfHx8fDE3Nzg5MTU1NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Chan dung',
    author: 'Pham Thi Huong',
    createdAt: '2026-05-18T14:20:00Z',
    status: 'published',
    featured: false,
  },
  {
    id: '4',
    title: 'Cong Nghe AI Trong Huan Luyen Ngua Dua Hien Dai',
    slug: 'cong-nghe-ai-trong-huan-luyen-ngua-dua-hien-dai',
    shortDescription:
      'Cac trung tam huan luyen ngua dua dang ap dung cong nghe AI va phan tich du lieu de toi uu hoa hieu suat thi dau.',
    content: `Cong nghe tri tue nhan tao dang thay doi cach thuc huan luyen ngua dua. Cac trung tam huan luyen hang dau da bat dau su dung cac he thong phan tich du lieu tien tien de theo doi va cai thien hieu suat cua ngua.

He thong AI co the theo doi nhieu thong so nhu toc do, nhip do chay, nhip tim, ho hap, che do dinh duong va nghi ngoi. Tu do, doi ngu huan luyen co the xay dung giao an tap luyen phu hop cho tung ca the.

Mot so trung tam con su dung camera 3D va cam bien chuyen dong de phan tich tu the chay, phat hien nguy co chan thuong som va dieu chinh ky thuat huan luyen.

Mac du chi phi dau tu ban dau kha cao, ket qua dat duoc rat an tuong va mo ra huong di moi cho nganh dua ngua hien dai.`,
    thumbnail:
      'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaG9yc2UlMjB0cmFpbmluZ3xlbnwxfHx8fDE3Nzg5MTU1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Cong nghe',
    author: 'Hoang Van Tuan',
    createdAt: '2026-05-17T11:45:00Z',
    status: 'published',
    featured: false,
  },
  {
    id: '5',
    title: 'Quy Dinh Moi Ve An Toan Trong Dua Ngua 2026',
    slug: 'quy-dinh-moi-ve-an-toan-trong-dua-ngua-2026',
    shortDescription:
      'Hiep hoi Dua ngua Viet Nam cong bo cac quy dinh moi nham nang cao an toan cho ca ngua va jockey trong cac giai dau.',
    content: `Hiep hoi Dua ngua Viet Nam vua cong bo bo quy dinh moi ve an toan ap dung tu thang 6/2026, nham dam bao an toan toi da cho ca ngua dua va jockey.

Các quy định chinh bao gom trang thiet bi bao ho dat tieu chuan, kiem tra suc khoe dinh ky, kiem soat dieu kien duong dua va doi ngu y te truc san sang tai hien truong.

"An toan la uu tien hang dau", dai dien hiep hoi nhan manh. "Chung toi cam ket tao ra moi truong thi dau an toan nhat cho tat ca cac ben tham gia."

Bo quy dinh moi duoc ky vong se nang cao chat luong to chuc giai dau va giam thieu rui ro trong suot mua giai.`,
    thumbnail:
      'https://images.unsplash.com/photo-1560807707-8cc77767d783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWZldHklMjBlcXVpcG1lbnQlMjBob3JzZXxlbnwxfHx8fDE3Nzg5MTU1NzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Quy dinh',
    author: 'Vu Thi Mai',
    createdAt: '2026-05-16T08:30:00Z',
    status: 'published',
    featured: false,
  },
  {
    id: '6',
    title: 'Jockey Nguyen Van A: Toi Song Vi Dam Me Dua Ngua',
    slug: 'jockey-nguyen-van-a-toi-song-vi-dam-me-dua-ngua',
    shortDescription:
      'Phong van doc quyen voi jockey hang dau Viet Nam ve hanh trinh su nghiep va nhung ke hoach trong tuong lai.',
    content: `Voi nhieu chien thang trong mua giai nam nay, Nguyen Van A dang la jockey duoc chu y nhat tai Viet Nam. Anh chia se rang de duy tri phong do, anh phai tap luyen moi ngay va hieu rat ro tung chu ngua minh cuoi.

Theo anh, moi cuoc dua deu can su chuan bi ky luong: nghien cuu doi thu, nam ro dac diem duong dua va xay dung chien thuat cu the cho tung chang.

Trong tuong lai, anh muon dua nhung ngua dua Viet Nam ra dau truong quoc te dong thoi ho tro the he jockey tre phat trien su nghiep bai ban hon.

Dam me, ky luat va su kien tri van la ba yeu to lon nhat giup anh theo duoi nghe den hom nay.`,
    thumbnail:
      'https://images.unsplash.com/photo-1530034424313-2a7eae8c4334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2NrZXklMjBwb3J0cmFpdHxlbnwxfHx8fDE3Nzg5MTU1NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Phong van',
    author: 'Le Thi Hoa',
    createdAt: '2026-05-15T16:00:00Z',
    status: 'published',
    featured: true,
  },
]

function matchesSearch(news, search) {
  if (!search) return true

  const query = search.toLowerCase()
  return (
    news.title.toLowerCase().includes(query) ||
    news.shortDescription.toLowerCase().includes(query) ||
    news.category.toLowerCase().includes(query)
  )
}

export const newsApi = {
  async getAllNews(params = {}) {
    let filteredNews = [...mockNews].filter((item) => item.status === 'published')

    if (params.category) {
      filteredNews = filteredNews.filter((item) => item.category === params.category)
    }

    if (typeof params.featured === 'boolean') {
      filteredNews = filteredNews.filter((item) => item.featured === params.featured)
    }

    if (params.search) {
      filteredNews = filteredNews.filter((item) => matchesSearch(item, params.search))
    }

    return { data: filteredNews }
  },

  async getNewsById(id) {
    const news = mockNews.find((item) => item.id === id)

    if (!news) {
      throw new Error('News not found')
    }

    return { data: news }
  },

  async getFeaturedNews(limit = 3) {
    return {
      data: mockNews.filter((item) => item.status === 'published' && item.featured).slice(0, limit),
    }
  },

  async getRelatedNews(newsId, limit = 3) {
    const currentNews = mockNews.find((item) => item.id === newsId)

    if (!currentNews) {
      return { data: [] }
    }

    return {
      data: mockNews
        .filter(
          (item) =>
            item.id !== newsId &&
            item.status === 'published' &&
            item.category === currentNews.category,
        )
        .slice(0, limit),
    }
  },
}
