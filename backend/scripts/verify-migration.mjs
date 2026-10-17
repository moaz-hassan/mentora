#!/usr/bin/env node
/**
 * MIG-09 verification: boots an in-memory MongoDB and exercises the three
 * migration-critical paths end-to-end:
 *
 *   1. Admin settings service (create/list/update/validate/public) - MIG-01
 *   2. Group-chat socket authenticate handler - MIG-02
 *   3. Logging worker batch flush (insertMany + duplicate tolerance) - MIG-03
 *
 * Requires no running services: Mongo is in-memory; the Redis-backed Bull
 * queue is imported but not used for these checks.
 *
 * Run: node scripts/verify-migration.mjs
 */
import "dotenv/config";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const results = [];

const check = async (name, fn) => {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error });
    console.error(`✗ ${name}\n    ${error?.stack || error}`);
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

const main = async () => {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "mentora_verify" });

  const settingsService = await import("../src/services/admin/settings.service.js");
  const { chatRoomRepository, chatParticipantRepository } = await import(
    "../src/repositories/communication/chat.repository.js"
  );
  const { authenticateHandler } = await import(
    "../src/sockets/group-chat/authenticate.handler.js"
  );
  const { addToBatch, flushBatch } = await import(
    "../src/workers/loggingWorker.js"
  );
  const { default: AuditLog } = await import(
    "../src/models/admin/auditLog.model.js"
  );

  // ------------------------------------------------------------------ MIG-01
  await check("settings: create persists category/data_type/is_public", async () => {
    const created = await settingsService.createSetting({
      key: "verify.payments.enabled",
      value: "true",
      category: "payments",
      data_type: "boolean",
      is_public: true,
      description: "verification setting",
    });

    assert(created.key === "verify.payments.enabled", "key persisted");
    assert(created.category === "payments", "category persisted");
    assert(created.data_type === "boolean", "data_type persisted");
    assert(created.is_public === true, "is_public persisted");
  });

  await check("settings: grouped getAllSettings + category filter", async () => {
    await settingsService.createSetting({
      key: "verify.general.siteName",
      value: "Mentora",
      category: "general",
    });

    const grouped = await settingsService.getAllSettings();
    assert(Array.isArray(grouped.payments), "payments group exists");
    assert(Array.isArray(grouped.general), "general group exists");
    assert(
      grouped.payments.some((s) => s.key === "verify.payments.enabled"),
      "payments group contains the key"
    );
    assert(
      grouped.general.length === 1 && grouped.general[0].dataType === "string",
      "default dataType is string"
    );

    const payments = await settingsService.getSettingsByCategory("payments");
    assert(
      payments.length === 1 && payments[0].dataType === "boolean",
      "category filter + dataType mapping"
    );
  });

  await check("settings: updateSetting validates per data_type", async () => {
    const updated = await settingsService.updateSetting(
      "verify.payments.enabled",
      false,
      "admin-verify"
    );
    assert(updated.value === "false", "boolean normalized to string");

    let threw = false;
    try {
      await settingsService.updateSetting(
        "verify.payments.enabled",
        "not-a-boolean",
        "admin-verify"
      );
    } catch (error) {
      threw = true;
      assert(error.statusCode === 400, "validation error has statusCode 400");
    }
    assert(threw, "invalid boolean rejected");
  });

  await check("settings: duplicate key + missing key errors", async () => {
    let duplicateThrew = false;
    try {
      await settingsService.createSetting({
        key: "verify.payments.enabled",
        value: "x",
        category: "payments",
      });
    } catch (error) {
      duplicateThrew = true;
      assert(error.statusCode === 400, "duplicate has statusCode 400");
    }
    assert(duplicateThrew, "duplicate key rejected");

    let missingThrew = false;
    try {
      await settingsService.updateSetting("verify.does.not.exist", "x", "admin-verify");
    } catch (error) {
      missingThrew = true;
      assert(error.statusCode === 404, "missing has statusCode 404");
    }
    assert(missingThrew, "missing key rejected");
  });

  await check("settings: getPublicSettings returns public keys only", async () => {
    const publicSettings = await settingsService.getPublicSettings();
    assert(publicSettings["verify.payments.enabled"] === "false", "public value present");
    assert(publicSettings["verify.general.siteName"] === undefined, "non-public key hidden");
  });

  // ------------------------------------------------------------------ MIG-02
  await check("socket: authenticate joins user's rooms via Mongoose", async () => {
    const room = await chatRoomRepository.create({
      type: "group",
      name: "Verification Room",
      course_id: "verify-course-1",
    });
    const userId = "verify-user-1";
    await chatParticipantRepository.create({ room_id: room._id, user_id: userId });

    const joined = [];
    const emitted = [];
    const socket = {
      id: "socket-verify-1",
      join: (roomName) => joined.push(roomName),
      emit: (event, payload) => emitted.push({ event, payload }),
    };
    const connectedUsers = new Map();

    await authenticateHandler({}, socket, connectedUsers)({ userId });

    assert(joined.includes(`room_${room._id}`), "socket joined the room");
    assert(connectedUsers.get(userId) === "socket-verify-1", "connection registered");
    const authEvent = emitted.find((e) => e.event === "authenticated");
    assert(
      authEvent && authEvent.payload.rooms.includes(room._id),
      "authenticated rooms payload is correct"
    );
  });

  await check("socket: missing userId is rejected", async () => {
    const emitted = [];
    const socket = {
      id: "socket-verify-2",
      join: () => {},
      emit: (event, payload) => emitted.push({ event, payload }),
    };

    await authenticateHandler({}, socket, new Map())({});

    assert(
      emitted.some((e) => e.event === "error"),
      "error event emitted for missing userId"
    );
  });

  // ------------------------------------------------------------------ MIG-03
  await check("worker: flushBatch persists logs via insertMany", async () => {
    const capturedErrors = [];
    const capturedWarnings = [];
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => capturedErrors.push(args.join(" "));
    console.warn = (...args) => capturedWarnings.push(args.join(" "));

    try {
      await addToBatch({
        type: "audit",
        data: { _id: "verify-audit-1", action: "verify.migration", admin_id: "admin-verify" },
      });
      await flushBatch();

      const count = await AuditLog.countDocuments({ _id: "verify-audit-1" });
      assert(count === 1, "audit log persisted");

      // Re-inserting the same document must be tolerated (ignoreDuplicates parity).
      await addToBatch({
        type: "audit",
        data: { _id: "verify-audit-1", action: "verify.migration", admin_id: "admin-verify" },
      });
      await flushBatch();

      const countAfter = await AuditLog.countDocuments({ _id: "verify-audit-1" });
      assert(countAfter === 1, "duplicate ignored, still one document");
      assert(
        capturedWarnings.some((message) => message.includes("Skipped duplicate")),
        "duplicate was detected through the duplicate-key path"
      );
      assert(
        !capturedErrors.some((message) => message.includes("Error flushing log batch")),
        "no flush errors were raised"
      );
    } finally {
      console.error = originalError;
      console.warn = originalWarn;
    }
  });

  await mongoose.disconnect();
  await mongod.stop();

  const failed = results.filter((result) => !result.ok);
  console.log(
    `\n${failed.length === 0 ? "✅" : "✗"} verify-migration: ${
      results.length - failed.length
    }/${results.length} checks passed`
  );
  process.exit(failed.length === 0 ? 0 : 1);
};

main().catch((error) => {
  console.error("✗ verify-migration crashed:", error);
  process.exit(1);
});
