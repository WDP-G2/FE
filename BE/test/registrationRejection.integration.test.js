var test = require("node:test");
var assert = require("node:assert/strict");

var testUri = process.env.MONGODB_TEST_URI || "";
var skipReason = testUri ? false : "Set MONGODB_TEST_URI to a MongoDB replica-set test database";

test("reject registration releases jockey, refunds reward, notifies both users and is idempotent", { skip: skipReason }, async function () {
  if (!/test/i.test(testUri)) throw new Error("MONGODB_TEST_URI database name must contain 'test'");
  process.env.MONGODB_URI = testUri;

  var mongoose = require("../db");
  await mongoose.connectPromise;
  var User = require("../models/user");
  var Tournament = require("../models/tournament");
  var JockeyInvitation = require("../models/jockeyInvitation");
  var Notification = require("../models/notification");
  var walletModels = require("../models/wallet");
  var rejectionService = require("../services/registrationFinancialService");

  var prefix = "registration-rejection-" + new mongoose.Types.ObjectId();
  var owner;
  var jockey;
  var admin;
  var tournament;
  var invitation;

  try {
    var users = await User.create([
      { email: prefix + "-owner@test.local", password: "test", role: "HORSE_OWNER", username: "owner" },
      { email: prefix + "-jockey@test.local", password: "test", role: "JOCKEY", username: "jockey" },
      { email: prefix + "-admin@test.local", password: "test", role: "ADMIN", username: "admin" },
    ]);
    owner = users[0];
    jockey = users[1];
    admin = users[2];

    tournament = await Tournament.create({
      name: "Integration Test Tournament",
      slug: prefix,
      location: "Test Track",
      status: "Đang mở đăng ký",
      races: [{
        raceNumber: 1,
        name: "Integration Test Race",
        distance: "1000m",
        status: "Đang mở đăng ký",
      }],
    });
    var race = tournament.races[0];

    invitation = await JockeyInvitation.create({
      ownerId: owner._id,
      ownerName: "owner",
      jockeyId: jockey._id,
      jockeyName: "jockey",
      horseId: new mongoose.Types.ObjectId(),
      horseName: "Test Horse",
      tournamentId: tournament._id,
      tournamentName: tournament.name,
      raceId: race._id,
      raceLabel: race.name,
      reward: 100000,
      rewardStatus: "HELD",
      status: "Đã chấp nhận",
    });

    tournament.registrations.push({
      tournamentId: tournament._id,
      fullName: "owner",
      ownerId: owner._id,
      ownerName: "owner",
      horseId: invitation.horseId,
      horseName: invitation.horseName,
      jockeyId: jockey._id,
      jockeyName: "jockey",
      jockeyInvitationId: invitation._id,
      raceId: race._id,
      status: "Chờ duyệt",
      paymentStatus: "UNCHARGED",
    });
    await tournament.save();
    var registrationId = tournament.registrations[0]._id;

    await walletModels.Wallet.create({
      ownerType: "USER",
      userId: owner._id,
      availableBalance: 400000,
      holdBalance: 100000,
    });

    var first = await rejectionService.reject({
      registrationId: registrationId,
      adminId: admin._id,
      note: "Không đạt kiểm tra sức khỏe",
    });
    assert.equal(first.registration.status, "Từ chối");
    assert.equal(first.registration.reviewNote, "Không đạt kiểm tra sức khỏe");

    invitation = await JockeyInvitation.findById(invitation._id);
    assert.equal(invitation.status, "Đã hủy");
    assert.equal(invitation.rewardStatus, "REFUNDED");
    assert.match(invitation.responseNote, /Không đạt kiểm tra sức khỏe/);
    assert.ok(invitation.rewardSettlementOperationId);

    var wallet = await walletModels.Wallet.findOne({ ownerType: "USER", userId: owner._id });
    assert.equal(wallet.availableBalance, 500000);
    assert.equal(wallet.holdBalance, 0);

    var notifications = await Notification.find({
      type: { $in: ["REGISTRATION_REJECTED", "JOCKEY_ASSIGNMENT_CANCELLED"] },
      "metadata.registrationId": String(registrationId),
    });
    assert.equal(notifications.length, 2);
    assert.deepEqual(
      notifications.map(function (item) { return String(item.userId); }).sort(),
      [String(owner._id), String(jockey._id)].sort(),
    );

    var second = await rejectionService.reject({
      registrationId: registrationId,
      adminId: admin._id,
      note: "Không đạt kiểm tra sức khỏe",
    });
    assert.equal(second.registration.status, "Từ chối");
    wallet = await walletModels.Wallet.findOne({ ownerType: "USER", userId: owner._id });
    assert.equal(wallet.availableBalance, 500000);
    assert.equal(wallet.holdBalance, 0);
    assert.equal(await Notification.countDocuments({
      type: { $in: ["REGISTRATION_REJECTED", "JOCKEY_ASSIGNMENT_CANCELLED"] },
      "metadata.registrationId": String(registrationId),
    }), 2);
    assert.equal(await walletModels.WalletOperation.countDocuments({
      idempotencyKey: "registration:reject:" + registrationId,
    }), 1);
  } finally {
    var userIds = [owner, jockey, admin].filter(Boolean).map(function (user) { return user._id; });
    var operationIds = await walletModels.WalletOperation.find({
      idempotencyKey: { $regex: "^registration:reject:" },
      actorId: admin ? admin._id : null,
    }).distinct("_id");
    await walletModels.WalletTransaction.deleteMany({ operationId: { $in: operationIds } });
    await walletModels.TreasuryAlert.deleteMany({ operationId: { $in: operationIds } });
    await walletModels.WalletOperation.deleteMany({ _id: { $in: operationIds } });
    await Notification.deleteMany({ userId: { $in: userIds } });
    await walletModels.Wallet.deleteMany({ userId: { $in: userIds } });
    if (invitation) await JockeyInvitation.deleteOne({ _id: invitation._id });
    if (tournament) await Tournament.deleteOne({ _id: tournament._id });
    await User.deleteMany({ _id: { $in: userIds } });
    await mongoose.disconnect();
  }
});
