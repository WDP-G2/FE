var test = require("node:test");
var assert = require("node:assert/strict");
var registrationStatuses = require("../utils/registrationStatuses");

test("only active registration statuses lock horses and jockeys", function () {
  ["Chờ duyệt", "Đã duyệt", "Đang chạy"].forEach(function (status) {
    assert.equal(registrationStatuses.isActiveRegistration({ status: status }), true);
  });
  ["Từ chối", "Đã rút", "Hoàn thành", null].forEach(function (status) {
    assert.equal(registrationStatuses.isActiveRegistration({ status: status }), false);
  });
});
