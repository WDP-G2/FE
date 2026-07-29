# Mo - Horse Racing Tournament Mobile App

Mo la ung dung mobile Expo + React Native cho he thong quan ly giai dau dua ngua. Ung dung ho tro nhieu vai tro tham gia trong quy trinh to chuc giai dau: Horse Owner, Jockey, Race Referee, Spectator va Admin.

## Tech Stack

- Expo SDK 54
- React 19.1
- React Native 0.81
- npm

## Run Project

```powershell
cd B:\KY8\WDP\Mo
npm.cmd install
npm.cmd run start -- --host lan --port 8081
```

Mo ung dung tren may that bang Expo Go:

```text
exp://<IP_LAN_CUA_MAY>:8081
```

Vi du:

```text
exp://192.168.10.134:8081
```

## Product Scope

He thong tap trung vao 5 nhom nguoi dung chinh:

- Horse Owner: dang ky tai khoan, quan ly ngua, dang ky giai dau, thue/chon jockey, xac nhan tham gia cuoc dua va theo doi ket qua.
- Jockey: dang ky tai khoan jockey, nhan loi moi dieu khien ngua, xac nhan/tu choi cuoc dua, xem lich thi dau va thanh tich ca nhan.
- Race Referee: kiem tra thong tin ngua, theo doi cuoc dua, ghi nhan vi pham, xac nhan ket qua va lap bien ban thi dau.
- Spectator: xem thong tin giai, lich dua, ket qua truc tiep, bang xep hang, du doan ket qua va nhan thong bao thuong.
- Admin: quan ly nguoi dung, phan quyen, giai dau, lich thi dau, dang ky tham gia, ngua, jockey, trong tai, ket qua va du doan.

## Functional Requirements

### 1. Authentication & Authorization

- Dang ky tai khoan cho Horse Owner.
- Dang ky tai khoan cho Jockey.
- Dang nhap, dang xuat.
- Quan ly phien dang nhap.
- Phan quyen theo role: Horse Owner, Jockey, Race Referee, Spectator, Admin.
- Dieu huong man hinh theo role sau khi dang nhap.

### 2. Horse Owner

- Dang ky ngua tham gia giai dau.
- Quan ly thong tin ngua: ten, tuoi, giong, tinh trang suc khoe, thanh tich, hinh anh.
- Chon hoac thue jockey cho ngua.
- Quan ly danh sach jockey cua tung ngua.
- Gui loi moi jockey tham gia cuoc dua.
- Xac nhan jockey tham gia cuoc dua.
- Xem lich thi dau cua ngua.
- Xac nhan cho ngua tham gia cuoc dua.
- Xem thong tin chi tiet cuoc dua.
- Theo doi ket qua thi dau cua ngua.
- Theo doi bang xep hang va tien thuong cua ngua.

### 3. Jockey

- Dang ky tai khoan jockey.
- Cap nhat thong tin ca nhan va kinh nghiem thi dau.
- Nhan loi moi dieu khien ngua tu Horse Owner.
- Xac nhan hoac tu choi loi moi tham gia cuoc dua.
- Xem danh sach cuoc dua duoc phan cong.
- Xem thong tin ngua duoc dieu khien.
- Theo doi lich thi dau.
- Theo doi ket qua thi dau ca nhan.
- Theo doi bang xep hang va thanh tich ca nhan.

### 4. Race Referee

- Xem danh sach cuoc dua duoc phan cong.
- Kiem tra thong tin ngua truoc cuoc dua.
- Xac nhan dieu kien tham gia cua ngua va jockey.
- Theo doi dien bien cuoc dua.
- Ghi nhan vi pham.
- Xu ly vi pham theo quy dinh.
- Nhap va xac nhan ket qua cuoc dua.
- Lap bien ban thi dau.

### 5. Spectator

- Xem danh sach giai dau.
- Xem thong tin chi tiet giai dau.
- Xem lich dua.
- Theo doi ket qua thi dau truc tiep.
- Xem bang xep hang.
- Du doan ket qua cuoc dua.
- Theo doi ket qua du doan.
- Nhan thong bao khi co thuong du doan ket qua.

### 6. Admin

- Quan ly tai khoan nguoi dung.
- Kich hoat, khoa, cap nhat tai khoan.
- Phan quyen cho nguoi dung.
- Quan ly thong tin giai dau dua ngua.
- Lap lich thi dau.
- Sap xep cuoc dua va vong dua.
- Duyet dang ky tham gia giai dau.
- Quan ly danh sach ngua thi dau.
- Quan ly danh sach jockey.
- Phan cong trong tai.
- Cong bo ket qua thi dau.
- Quan ly du doan ket qua.

## Core Data Models

Du kien cac entity chinh:

- User
- Role
- Horse
- JockeyProfile
- Tournament
- Race
- RaceRound
- RaceRegistration
- HorseJockeyAssignment
- RefereeAssignment
- RaceViolation
- RaceResult
- Ranking
- Prize
- Prediction
- PredictionReward
- Notification

## Suggested App Structure

```text
src/
  api/
  assets/
  components/
  constants/
  contexts/
  hooks/
  navigation/
  screens/
    auth/
    horse-owner/
    jockey/
    referee/
    spectator/
    admin/
  services/
  store/
  types/
  utils/
```

## Roadmap

### Phase 1 - Project Foundation

- Hoan thien cau truc thu muc `src`.
- Cai dat navigation.
- Cai dat theme, shared components va form components.
- Thiet lap API client.
- Thiet lap auth context va role-based navigation.
- Tao man hinh splash/loading, login, register.

### Phase 2 - Authentication & Role Flow

- Dang ky Horse Owner.
- Dang ky Jockey.
- Dang nhap/dang xuat.
- Luu token/session.
- Dieu huong dashboard theo role.
- Chan truy cap man hinh sai role.

### Phase 3 - Horse Owner MVP

- CRUD thong tin ngua.
- Dang ky ngua tham gia giai dau.
- Xem danh sach giai dau va cuoc dua.
- Chon/thue jockey.
- Xac nhan jockey tham gia cuoc dua.
- Xem lich thi dau cua ngua.

### Phase 4 - Jockey MVP

- Cap nhat ho so jockey.
- Xem loi moi tu Horse Owner.
- Chap nhan/tu choi loi moi.
- Xem lich thi dau.
- Xem ngua duoc phan cong.
- Xem ket qua va thanh tich ca nhan.

### Phase 5 - Tournament & Admin MVP

- Quan ly nguoi dung va role.
- Tao va cap nhat giai dau.
- Tao lich thi dau, cuoc dua, vong dua.
- Duyet dang ky tham gia.
- Quan ly ngua va jockey.
- Phan cong trong tai.

### Phase 6 - Referee Flow

- Xem cuoc dua duoc phan cong.
- Kiem tra ngua truoc cuoc dua.
- Ghi nhan vi pham.
- Nhap ket qua cuoc dua.
- Lap bien ban thi dau.
- Gui ket qua cho Admin xac nhan/cong bo.

### Phase 7 - Spectator & Prediction

- Xem giai dau, lich dua, thong tin cuoc dua.
- Xem ket qua truc tiep.
- Xem bang xep hang.
- Du doan ket qua.
- Xem lich su du doan.
- Nhan thong bao ket qua va thuong du doan.

### Phase 8 - Polish & Release

- Xu ly loading, empty state, error state.
- Validate form day du.
- Toi uu UI mobile.
- Kiem thu tren may that bang Expo Go.
- Viet test cho logic quan trong.
- Chuan bi build Android/iOS.

## MVP Priority

Nen uu tien lam theo thu tu:

1. Authentication va role-based navigation.
2. Admin tao giai dau, lich dua va cuoc dua.
3. Horse Owner quan ly ngua va dang ky tham gia.
4. Jockey nhan/xac nhan loi moi.
5. Referee nhap ket qua.
6. Spectator xem lich, ket qua, bang xep hang.
7. Prediction va reward.

## Acceptance Criteria

- Nguoi dung dang nhap xong chi thay dung chuc nang cua role minh.
- Horse Owner co the tao ngua, dang ky giai dau va gan jockey.
- Jockey co the chap nhan hoac tu choi loi moi.
- Admin co the tao giai dau, lap lich va cong bo ket qua.
- Race Referee co the ghi nhan vi pham va xac nhan ket qua.
- Spectator co the xem lich, ket qua, bang xep hang va du doan.
- Ket qua thi dau duoc cap nhat vao bang xep hang va tien thuong.
- Cac man hinh co loading, empty state va error state ro rang.

## Git Workflow

- `main`: branch on dinh, dung lam default branch.
- `feat/setup-expo`: branch setup Expo ban dau.
- Tao branch moi theo format:

```text
feat/auth
feat/horse-management
feat/jockey-assignment
feat/tournament-management
feat/referee-result
feat/spectator-prediction
```

Quy trinh de xuat:

1. Tao branch tu `main`.
2. Commit theo tung nhom chuc nang nho.
3. Push branch len GitHub.
4. Tao Pull Request vao `main`.
5. Review va merge.

## Notes

- Repo dung LF line endings thong qua `.gitattributes`.
- Project hien dang dung Expo SDK 54 de phu hop moi truong hien tai.
- Khi test tren may that, may tinh va dien thoai phai cung Wi-Fi.
