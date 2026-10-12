'use strict';
/* cronauth.js — shared lib, film-watchtower.
 * Copied per ARCHITECTURE.md §1.11 / §8 rule 3.
 * Cron/admin endpoints fail closed: CRON_SECRET unset -> false (caller 401s).
 * Vercel auto-sends `Authorization: Bearer <CRON_SECRET>` on cron invocations.
 */
var crypto = require('crypto');

function assertCron(req) {
  var secret = process.env.CRON_SECRET || '';
  if (!secret) return false; // fail closed — never run an unprotected refresh
  var header = (req.headers && (req.headers['authorization'] || req.headers['Authorization'])) || '';
  var expected = 'Bearer ' + secret;
  var a = Buffer.from(String(header));
  var b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { assertCron: assertCron };
