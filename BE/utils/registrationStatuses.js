var ACTIVE_REGISTRATION_STATUSES = ["Chờ duyệt", "Đã duyệt", "Đang chạy"];

function isActiveRegistration(registration) {
  return ACTIVE_REGISTRATION_STATUSES.indexOf(registration && registration.status) !== -1;
}

module.exports = {
  ACTIVE_REGISTRATION_STATUSES: ACTIVE_REGISTRATION_STATUSES,
  isActiveRegistration: isActiveRegistration,
};
