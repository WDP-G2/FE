require("dotenv").config();
process.env.MONGOOSE_AUTO_INDEX = "false";

var mongoose = require("../db");
var Tournament = require("../models/tournament");
var JockeyInvitation = require("../models/jockeyInvitation");
var { executeOperation, asInteger } = require("../services/walletLedger");

var apply = process.argv.indexOf("--apply") >= 0;
var confirmedBackup = process.argv.indexOf("--confirm-backup") >= 0;

function rejectionNote(registration) {
  var reason = String(registration.reviewNote || "Không đạt điều kiện duyệt").trim();
  return "Admin từ chối đăng ký thi đấu: " + reason;
}

async function findCandidates() {
  var tournaments = await Tournament.find({
    registrations: {
      $elemMatch: {
        status: "Từ chối",
        jockeyInvitationId: { $ne: null },
      },
    },
  }).exec();
  var candidates = [];
  var unmatched = [];

  for (var i = 0; i < tournaments.length; i += 1) {
    var tournament = tournaments[i];
    var rejected = (tournament.registrations || []).filter(function (registration) {
      return registration.status === "Từ chối" && registration.jockeyInvitationId;
    });
    for (var j = 0; j < rejected.length; j += 1) {
      var registration = rejected[j];
      var invitation = await JockeyInvitation.findById(registration.jockeyInvitationId).exec();
      if (!invitation) {
        unmatched.push({
          registrationId: String(registration._id),
          invitationId: String(registration.jockeyInvitationId),
          reason: "INVITATION_NOT_FOUND",
        });
        continue;
      }
      if (invitation.status === "Đã chấp nhận" || invitation.rewardStatus === "HELD") {
        candidates.push({
          tournamentId: tournament._id,
          registration: registration,
          invitation: invitation,
        });
      }
    }
  }
  return { candidates: candidates, unmatched: unmatched };
}

async function reconcileCandidate(candidate) {
  var registration = candidate.registration;
  var invitation = candidate.invitation;
  var reward = invitation.rewardStatus === "HELD"
    ? asInteger(invitation.reward || 0, "Thù lao jockey")
    : 0;
  var note = rejectionNote(registration);

  async function updateInvitation(session, operation) {
    var set = {
      status: "Đã hủy",
      cancelledAt: new Date(),
      responseNote: note,
    };
    if (reward > 0) {
      set.rewardStatus = "REFUNDED";
      set.rewardSettlementOperationId = operation._id;
    } else if (invitation.rewardStatus === "HELD") {
      set.rewardStatus = "REFUNDED";
    }
    await JockeyInvitation.updateOne(
      {
        _id: invitation._id,
        $or: [{ status: "Đã chấp nhận" }, { rewardStatus: "HELD" }],
      },
      { $set: set },
      { session: session },
    ).exec();
  }

  if (reward > 0) {
    var result = await executeOperation({
      idempotencyKey: "migration:registration-rejection:" + registration._id,
      type: "JOCKEY_REWARD_REFUND",
      referenceType: "REGISTRATION",
      referenceId: String(registration._id),
      metadata: { invitationId: String(invitation._id), migration: true },
      postings: [{
        ownerType: "USER",
        userId: invitation.ownerId,
        transactionType: "JOCKEY_REWARD",
        availableDelta: reward,
        holdDelta: -reward,
        description: "Hoàn thù lao đăng ký bị admin từ chối",
      }],
      mutateDomain: updateInvitation,
    });
    return { amount: reward, idempotent: result.idempotent };
  }

  await mongoose.connection.transaction(async function (session) {
    await updateInvitation(session, { _id: null });
  });
  return { amount: 0, idempotent: false };
}

async function main() {
  await mongoose.connectPromise;
  if (apply && !confirmedBackup) {
    throw new Error("--apply yêu cầu --confirm-backup sau khi đã backup database");
  }

  var found = await findCandidates();
  var report = {
    mode: apply ? "APPLY" : "DRY_RUN",
    candidates: found.candidates.length,
    heldRewardAmount: found.candidates.reduce(function (sum, candidate) {
      return sum + (candidate.invitation.rewardStatus === "HELD"
        ? Number(candidate.invitation.reward || 0)
        : 0);
    }, 0),
    unmatched: found.unmatched,
    reconciled: 0,
    refundedAmount: 0,
    failures: [],
  };

  if (apply) {
    for (var i = 0; i < found.candidates.length; i += 1) {
      try {
        var result = await reconcileCandidate(found.candidates[i]);
        if (!result.idempotent) {
          report.reconciled += 1;
          report.refundedAmount += result.amount;
        }
      } catch (err) {
        report.failures.push({
          registrationId: String(found.candidates[i].registration._id),
          invitationId: String(found.candidates[i].invitation._id),
          error: err && err.message ? err.message : String(err),
        });
      }
    }
  }

  console.log(JSON.stringify(report, null, 2));
  await mongoose.disconnect();
}

main().catch(async function (err) {
  console.error(err && err.stack ? err.stack : err);
  await mongoose.disconnect().catch(function () {});
  process.exitCode = 1;
});
