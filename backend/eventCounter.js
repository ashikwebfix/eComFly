/**
 * Live event counter.
 *
 * Nginx writes one line per sGTM request to SGTM_EVENT_LOG (see the
 * `sgtm_events` log_format in deploy_sgtm.sh). This module tails that file every
 * few seconds, counts successful production tracking hits (/g/collect) per host
 * and adds them to containers.events_count / events_today and users.current_events.
 *
 * Log line format: <host>\t<status>\t<method>\t<request_uri>\t<has_preview_header>
 */
const fs = require('fs');
const db = require('./db');

const LOG_FILE = process.env.SGTM_EVENT_LOG || '/var/log/nginx/sgtm_events.log';
const STATE_FILE = process.env.SGTM_EVENT_STATE || '/root/.ecomfly_event_counter.json';
const INTERVAL_MS = 5000;
const MAX_READ_BYTES = 20 * 1024 * 1024;

let state = { offset: null, inode: null, day: null };
let running = false;
let leftover = '';

const today = () => new Date().toISOString().slice(0, 10);

const loadState = () => {
  try { state = { ...state, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }; } catch (e) { /* first run */ }
};
const saveState = () => {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state)); } catch (e) { console.error('[eventCounter] cannot save state', e.message); }
};

const isTrackingHit = (method, uri, status, preview) => {
  if (preview) return false;
  if (status < 200 || status >= 300) return false;
  if (method !== 'GET' && method !== 'POST') return false;
  if (!/^\/(g|j)\/collect(\?|$)/.test(uri)) return false;
  if (/[?&]gtm_preview=/.test(uri)) return false;
  return true;
};

const tick = async () => {
  if (running) return;
  running = true;
  try {
    if (!fs.existsSync(LOG_FILE)) return;
    const stat = fs.statSync(LOG_FILE);

    // First run: start from the end so old traffic is not double counted.
    if (state.offset === null) {
      state.offset = stat.size; state.inode = stat.ino; state.day = today(); saveState();
      return;
    }
    // Log rotated/truncated: start from the beginning of the new file.
    if (stat.ino !== state.inode || stat.size < state.offset) {
      state.offset = 0; state.inode = stat.ino; leftover = '';
    }

    // Reset daily counters on date change.
    if (state.day !== today()) {
      await db.query('UPDATE containers SET events_today = 0');
      state.day = today(); saveState();
    }

    if (stat.size === state.offset) return;
    const end = Math.min(stat.size, state.offset + MAX_READ_BYTES);
    const length = end - state.offset;
    const buf = Buffer.alloc(length);
    const fd = fs.openSync(LOG_FILE, 'r');
    try { fs.readSync(fd, buf, 0, length, state.offset); } finally { fs.closeSync(fd); }

    const text = leftover + buf.toString('utf8');
    const lines = text.split('\n');
    leftover = lines.pop(); // possibly partial last line

    const counts = {};
    for (const line of lines) {
      if (!line) continue;
      const [host, status, method, uri, preview] = line.split('\t');
      if (!host || !uri) continue;
      if (isTrackingHit(method, uri, parseInt(status, 10), preview && preview !== '-')) {
        counts[host.toLowerCase()] = (counts[host.toLowerCase()] || 0) + 1;
      }
    }

    for (const [host, n] of Object.entries(counts)) {
      const r = await db.query(
        `UPDATE containers
            SET events_count = COALESCE(events_count,0) + $1,
                events_today = COALESCE(events_today,0) + $1
          WHERE lower(auto_domain) = $2 OR lower(custom_domain) = $2
          RETURNING user_id`, [n, host]);
      if (r.rows.length > 0 && r.rows[0].user_id) {
        await db.query('UPDATE users SET current_events = COALESCE(current_events,0) + $1 WHERE id = $2', [n, r.rows[0].user_id]);
      }
    }

    state.offset = end; state.inode = stat.ino; saveState();
  } catch (err) {
    console.error('[eventCounter] error:', err.message);
  } finally {
    running = false;
  }
};

const start = () => {
  loadState();
  console.log(`📈 Event counter watching ${LOG_FILE}`);
  setInterval(tick, INTERVAL_MS);
  tick();
};

module.exports = { start };
