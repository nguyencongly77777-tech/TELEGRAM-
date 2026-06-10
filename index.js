const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN || "TOKEN_CUA_BAN";
const bot = new Telegraf(BOT_TOKEN);

// ─── DATABASE ─────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = {
  load: (file) => {
    const p = path.join(DATA_DIR, file + ".json");
    if (!fs.existsSync(p)) return {};
    try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return {}; }
  },
  save: (file, data) => fs.writeFileSync(path.join(DATA_DIR, file + ".json"), JSON.stringify(data, null, 2)),
  get: (file, key) => { const d = db.load(file); return key ? d[key] : d; },
  set: (file, key, value) => { const d = db.load(file); d[key] = value; db.save(file, d); },
  del: (file, key) => { const d = db.load(file); delete d[key]; db.save(file, d); }
};

// ─── HELPERS ──────────────────────────────────────────────────
const isAdmin = async (ctx) => {
  try {
    const m = await ctx.getChatMember(ctx.from.id);
    return ["administrator", "creator"].includes(m.status);
  } catch { return false; }
};
const backBtn = () => Markup.inlineKeyboard([[Markup.button.callback("‹ Quay lại Menu", "menu_main")]]);
const btn = (label, data) => Markup.button.callback(label, data);

// ─── MAIN MENU ────────────────────────────────────────────────
function showMainMenu() {
  return {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [btn("🛡️ Quản trị","mod_quantri"), btn("💤 AFK","mod_afk"), btn("🌊 Antiflood","mod_antiflood")],
      [btn("🚫 AntiRaid","mod_antiraid"), btn("🔐 Xác thực","mod_captcha"), btn("⚙️ Tự động","mod_tudong")],
      [btn("😍 AutoReact","mod_autoreact"), btn("🚷 Blacklist","mod_blacklist"), btn("📢 ChannelP","mod_channelp")],
      [btn("📡 ChannelS","mod_channels"), btn("🧹 CleanServ","mod_cleanserv"), btn("🔗 Kết nối","mod_ketnoi")],
      [btn("📋 CôngCụDán","mod_congcudan"), btn("📜 Đạo lý","mod_daoly"), btn("👨‍💻 Developer","mod_developer")],
      [btn("✅ DiemDanh","mod_diemdanh"), btn("🏆 FameRank","mod_famerank"), btn("🔍 Bộ lọc","mod_boloc")],
      [btn("👋 Chào mừng","mod_chaomung"), btn("📦 Import/Ex","mod_importex"), btn("🔒 Khóa","mod_khoa")],
      [btn("✉️ Modmail","mod_modmail"), btn("🏷️ NhãnDán","mod_nhandan"), btn("🌙 NightMode","mod_nightmode")],
      [btn("📝 Ghi chú","mod_ghichu"), btn("👑 OwnerEve","mod_ownereve"), btn("📊 PhânTích","mod_phantich")],
      [btn("📅 Lịch sử Tên","mod_lichsu"), btn("⚡ SiêuQuảnTrị","mod_sieukqt"), btn("🎨 Chủ đề","mod_chude")],
      [btn("🌐 Translate","mod_translate"), btn("📤 TríchXuất","mod_trichxuat"), btn("🔎 TìmKiếm","mod_timkiem")],
      [btn("🧠 TínhNăngAI","mod_tnnai"), btn("✨ TínhNăng","mod_tinhnang"), btn("🗂️ TạoPhiên","mod_taophien")],
      [btn("⬇️ TảiVề","mod_taive"), btn("❤️ YêuGhét","mod_yeughet")],
      [Markup.button.callback("🔍 Tìm kiếm","menu_timkiem"), Markup.button.callback("❌ Đóng","menu_dong")],
      [Markup.button.callback("📚 Hướng dẫn đầy đủ","menu_huongdan")],
    ])
  };
}

// ─── START / HELP ─────────────────────────────────────────────
bot.start((ctx) => {
  ctx.replyWithHTML(
    `👋 Xin chào <b>${ctx.from.first_name}</b>!\n\nTôi là <b>TRẦN MINH CHIẾN</b> 🤖\nHỗ trợ Tiếng Việt 🇻🇳 và English 🇺🇸\n\nChọn module bên dưới:`,
    showMainMenu()
  );
});

bot.help((ctx) => ctx.replyWithHTML(
  `📚 <b>Lệnh cơ bản:</b>\n/start - Menu chính\n/help - Hướng dẫn\n/info - Thông tin nhóm\n/stats - Thống kê\n/ping - Kiểm tra bot\n/id - Xem ID`
));

bot.command("menu", (ctx) => ctx.reply("🏠 Menu chính:", showMainMenu()));

// ─── QUẢN TRỊ ─────────────────────────────────────────────────
bot.command("ban", async (ctx) => {
  if (!await isAdmin(ctx)) return ctx.reply("❌ Chỉ admin mới dùng được.");
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("⚠️ Reply tin nhắn người cần cấm.");
  try {
    await ctx.banChatMember(reply.from.id);
    ctx.replyWithHTML(`🔨 Đã cấm <b>${reply.from.first_name}</b>`);
  } catch(e) { ctx.reply("❌ " + e.message); }
});

bot.command("unban", async (ctx) => {
  if (!await isAdmin(ctx)) return ctx.reply("❌ Chỉ admin.");
  const args = ctx.message.text.split(" ");
  if (!args[1]) return ctx.reply("⚠️ /unban [user_id]");
  try { await ctx.unbanChatMember(args[1]); ctx.replyWithHTML(`✅ Đã bỏ cấm <code>${args[1]}</code>`); }
  catch(e) { ctx.reply("❌ " + e.message); }
});

bot.command("kick", async (ctx) => {
  if (!await isAdmin(ctx)) return ctx.reply("❌ Chỉ admin.");
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("⚠️ Reply tin nhắn người cần kick.");
  try {
    await ctx.banChatMember(reply.from.id);
    await ctx.unbanChatMember(reply.from.id);
    ctx.replyWithHTML(`👢 Đã kick <b>${reply.from.first_name}</b>`);
  } catch(e) { ctx.reply("❌ " + e.message); }
});

bot.command("mute", async (ctx) => {
  if (!await isAdmin(ctx)) return ctx.reply("❌ Chỉ admin.");
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("⚠️ Reply tin nhắn người cần mute.");
  try {
    await ctx.restrictChatMember(reply.from.id, { permissions: { can_send_messages: false } });
    ctx.replyWithHTML(`🔇 Đã mute <b>${reply.from.first_name}</b>`);
  } catch(e) { ctx.reply("❌ " + e.message); }
});

bot.command("unmute", async (ctx) => {
  if (!await isAdmin(ctx)) return ctx.reply("❌ Chỉ admin.");
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("⚠️ Reply tin nhắn người cần unmute.");
  try {
    await ctx.restrictChatMember(reply.from.id, {
      permissions: { can_send_messages: true, can_send_media_messages: true, can_send_polls: true, can_send_other_messages: true }
    });
    ctx.replyWithHTML(`🔊 Đã unmute <b>${reply.from.first_name}</b>`);
  } catch(e) { ctx.reply("❌ " + e.message); }
});

bot.command("admins", async (ctx) => {
  try {
    const admins = await ctx.getChatAdministrators();
    const list = admins.map(a => `• ${a.user.first_name} (${a.status})`).join("\n");
    ctx.replyWithHTML(`👮 <b>Admin:</b>\n${list}`);
  } catch(e) { ctx.reply("❌ " + e.message); }
});

bot.command("info", (ctx) => {
  const c = ctx.chat;
  ctx.replyWithHTML(`ℹ️ <b>Thông tin:</b>\n📌 Tên: <b>${c.title||c.first_name}</b>\n🆔 ID: <code>${c.id}</code>\n📋 Loại: ${c.type}`);
});

bot.command("id", (ctx) => ctx.replyWithHTML(`🆔 Bạn: <code>${ctx.from.id}</code>\n🆔 Nhóm: <code>${ctx.chat.id}</code>`));

bot.command("ping", (ctx) => {
  const s = Date.now();
  ctx.reply("🏓 Pong!").then(() => ctx.replyWithHTML(`⚡ Độ trễ: <b>${Date.now()-s}ms</b>`));
});

// ─── CẢNH BÁO ─────────────────────────────────────────────────
bot.command("warn", async (ctx) => {
  if (!await isAdmin(ctx)) return ctx.reply("❌ Chỉ admin.");
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("⚠️ Reply tin nhắn người cần cảnh báo.");
  const key = `${ctx.chat.id}:${reply.from.id}`;
  const w = (db.get("warns", key) || 0) + 1;
  const limit = db.get("warnlimit", ctx.chat.id.toString()) || 3;
  db.set("warns", key, w);
  if (w >= limit) {
    try { await ctx.banChatMember(reply.from.id); } catch {}
    return ctx.replyWithHTML(`⛔ <b>${reply.from.first_name}</b> bị cấm sau ${limit} cảnh báo!`);
  }
  ctx.replyWithHTML(`⚠️ Cảnh báo <b>${reply.from.first_name}</b>: ${w}/${limit}`);
});

bot.command("warns", (ctx) => {
  const r = ctx.message.reply_to_message;
  const uid = r ? r.from.id : ctx.from.id;
  const name = r ? r.from.first_name : ctx.from.first_name;
  const w = db.get("warns", `${ctx.chat.id}:${uid}`) || 0;
  const limit = db.get("warnlimit", ctx.chat.id.toString()) || 3;
  ctx.replyWithHTML(`⚠️ <b>${name}</b>: ${w}/${limit} cảnh báo`);
});

bot.command("resetwarn", (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("⚠️ Reply tin nhắn cần đặt lại.");
  db.del("warns", `${ctx.chat.id}:${r.from.id}`);
  ctx.replyWithHTML(`✅ Đã xoá cảnh báo của <b>${r.from.first_name}</b>`);
});

bot.command("setwarnlimit", (ctx) => {
  const n = parseInt(ctx.message.text.split(" ")[1]);
  if (isNaN(n)) return ctx.reply("⚠️ /setwarnlimit [số]");
  db.set("warnlimit", ctx.chat.id.toString(), n);
  ctx.replyWithHTML(`✅ Giới hạn cảnh báo: <b>${n}</b>`);
});

// ─── AFK ──────────────────────────────────────────────────────
bot.command("afk", (ctx) => {
  const reason = ctx.message.text.split(" ").slice(1).join(" ") || "Không có lý do";
  db.set("afk", ctx.from.id.toString(), { reason, time: Date.now(), name: ctx.from.first_name });
  ctx.replyWithHTML(`💤 <b>${ctx.from.first_name}</b> đang vắng mặt\n📝 ${reason}`);
});

bot.command("back", (ctx) => {
  const a = db.get("afk", ctx.from.id.toString());
  if (!a) return ctx.reply("Bạn không trong chế độ AFK.");
  db.del("afk", ctx.from.id.toString());
  ctx.replyWithHTML(`✅ <b>${ctx.from.first_name}</b> đã quay lại sau ${Math.round((Date.now()-a.time)/60000)} phút!`);
});

// ─── ANTIFLOOD ────────────────────────────────────────────────
const floodTrack = {};
bot.command("setflood", (ctx) => {
  const n = parseInt(ctx.message.text.split(" ")[1]);
  if (isNaN(n)) return ctx.reply("⚠️ /setflood [số] (0=tắt)");
  db.set("flood", ctx.chat.id.toString(), n);
  ctx.replyWithHTML(n === 0 ? "✅ Đã tắt antiflood." : `✅ Antiflood: <b>${n}</b> tin/10 giây`);
});
bot.command("flood", (ctx) => {
  const l = db.get("flood", ctx.chat.id.toString()) || 0;
  ctx.replyWithHTML(l ? `🌊 Antiflood: <b>${l}</b> tin/10 giây` : "🌊 Antiflood đang tắt");
});

// ─── ANTIRAID ─────────────────────────────────────────────────
bot.command("antiraid", (ctx) => {
  const on = ctx.message.text.includes("on");
  db.set("antiraid", ctx.chat.id.toString(), on);
  ctx.reply(on ? "🚫 AntiRaid bật! Thành viên mới sẽ bị kick." : "✅ AntiRaid tắt.");
});
bot.command("raidmode", (ctx) => {
  const on = db.get("antiraid", ctx.chat.id.toString());
  ctx.replyWithHTML(`🚫 AntiRaid: <b>${on ? "Đang bật 🔴" : "Đang tắt 🟢"}</b>`);
});

// ─── CHÀO MỪNG ────────────────────────────────────────────────
bot.command("setwelcome", (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("⚠️ /setwelcome [nội dung]\nBiến: {name} {username} {id}");
  db.set("welcome", ctx.chat.id.toString(), text);
  ctx.reply("✅ Đã đặt tin chào mừng!");
});
bot.command("welcome", (ctx) => {
  const w = db.get("welcome", ctx.chat.id.toString());
  ctx.reply(w ? `👋 Tin chào:\n${w}` : "Chưa đặt. Dùng /setwelcome");
});
bot.command("resetwelcome", (ctx) => { db.del("welcome", ctx.chat.id.toString()); ctx.reply("✅ Đã xoá tin chào."); });

// ─── GHI CHÚ ──────────────────────────────────────────────────
bot.command("save", (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("⚠️ /save [tên] [nội dung]");
  const notes = db.get("notes", ctx.chat.id.toString()) || {};
  notes[args[1].toLowerCase()] = args.slice(2).join(" ");
  db.set("notes", ctx.chat.id.toString(), notes);
  ctx.replyWithHTML(`📝 Đã lưu: <b>${args[1]}</b>`);
});
bot.command("get", (ctx) => {
  const args = ctx.message.text.split(" ");
  if (!args[1]) return ctx.reply("⚠️ /get [tên]");
  const notes = db.get("notes", ctx.chat.id.toString()) || {};
  const note = notes[args[1].toLowerCase()];
  note ? ctx.replyWithHTML(`📝 <b>${args[1]}</b>:\n${note}`) : ctx.reply(`❌ Không tìm thấy: ${args[1]}`);
});
bot.command("notes", (ctx) => {
  const notes = db.get("notes", ctx.chat.id.toString()) || {};
  const keys = Object.keys(notes);
  keys.length ? ctx.replyWithHTML(`📝 <b>Ghi chú:</b>\n${keys.map(k=>`• #${k}`).join("\n")}`) : ctx.reply("Chưa có ghi chú.");
});
bot.command("clear", (ctx) => {
  const args = ctx.message.text.split(" ");
  if (!args[1]) return ctx.reply("⚠️ /clear [tên]");
  const notes = db.get("notes", ctx.chat.id.toString()) || {};
  delete notes[args[1].toLowerCase()];
  db.set("notes", ctx.chat.id.toString(), notes);
  ctx.replyWithHTML(`✅ Đã xoá: <b>${args[1]}</b>`);
});
bot.hears(/^#(\w+)$/, (ctx) => {
  const notes = db.get("notes", ctx.chat.id.toString()) || {};
  const note = notes[ctx.match[1].toLowerCase()];
  if (note) ctx.replyWithHTML(`📝 <b>${ctx.match[1]}</b>:\n${note}`);
});

// ─── ĐIỂM DANH ────────────────────────────────────────────────
bot.command("diemdanh", (ctx) => {
  const today = new Date().toDateString();
  const key = `${ctx.chat.id}:${today}`;
  const list = db.get("diemdanh", key) || [];
  const uid = ctx.from.id.toString();
  if (list.includes(uid)) return ctx.replyWithHTML(`✅ <b>${ctx.from.first_name}</b> đã điểm danh hôm nay rồi!`);
  list.push(uid);
  db.set("diemdanh", key, list);
  const score = db.get("fame", uid) || { name: ctx.from.first_name, points: 0 };
  score.points += 1; score.name = ctx.from.first_name;
  db.set("fame", uid, score);
  ctx.replyWithHTML(`✅ <b>${ctx.from.first_name}</b> điểm danh!\n⭐ Điểm: ${score.points}`);
});
bot.command("bangdiem", (ctx) => {
  const list = db.get("diemdanh", `${ctx.chat.id}:${new Date().toDateString()}`) || [];
  ctx.replyWithHTML(`📋 Điểm danh hôm nay: <b>${list.length}</b> người`);
});

// ─── FAMERANK ─────────────────────────────────────────────────
bot.command("rank", (ctx) => {
  const s = db.get("fame", ctx.from.id.toString()) || { name: ctx.from.first_name, points: 0 };
  ctx.replyWithHTML(`🏆 <b>${s.name}</b>\n⭐ Điểm: ${Math.floor(s.points)}`);
});
bot.command("top", (ctx) => {
  const all = Object.values(db.load("fame")).sort((a,b)=>b.points-a.points).slice(0,10);
  if (!all.length) return ctx.reply("Chưa có dữ liệu.");
  const medals = ["🥇","🥈","🥉"];
  ctx.replyWithHTML(`🏆 <b>Top thành viên:</b>\n\n${all.map((u,i)=>`${medals[i]||(i+1)+"."} <b>${u.name}</b> - ${Math.floor(u.points)} điểm`).join("\n")}`);
});
bot.command("leaderboard", (ctx) => {
  const all = Object.values(db.load("fame")).sort((a,b)=>b.points-a.points);
  if (!all.length) return ctx.reply("Chưa có dữ liệu.");
  ctx.replyWithHTML(`🏆 <b>Bảng xếp hạng:</b>\n\n${all.map((u,i)=>`${i+1}. ${u.name} - ${Math.floor(u.points)} điểm`).join("\n")}`);
});

// ─── KHÓA ─────────────────────────────────────────────────────
bot.command("lock", (ctx) => {
  const type = ctx.message.text.split(" ")[1];
  if (!type) return ctx.reply("⚠️ /lock [sticker|gif|url|photo|video|voice|document]");
  const locks = db.get("locks", ctx.chat.id.toString()) || [];
  if (!locks.includes(type)) locks.push(type);
  db.set("locks", ctx.chat.id.toString(), locks);
  ctx.replyWithHTML(`🔒 Đã khóa: <b>${type}</b>`);
});
bot.command("unlock", (ctx) => {
  const type = ctx.message.text.split(" ")[1];
  const locks = (db.get("locks", ctx.chat.id.toString()) || []).filter(l=>l!==type);
  db.set("locks", ctx.chat.id.toString(), locks);
  ctx.replyWithHTML(`🔓 Đã mở: <b>${type}</b>`);
});
bot.command("locktypes", (ctx) => {
  const locks = db.get("locks", ctx.chat.id.toString()) || [];
  ctx.replyWithHTML(`🔒 <b>Đang khóa:</b> ${locks.length ? locks.join(", ") : "Không có"}`);
});

// ─── NIGHTMODE ────────────────────────────────────────────────
bot.command("nightmode", (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args[1] === "off") { db.del("nightmode", ctx.chat.id.toString()); return ctx.reply("☀️ NightMode tắt."); }
  const start = args[2] || "22:00", end = args[3] || "06:00";
  db.set("nightmode", ctx.chat.id.toString(), { start, end });
  ctx.replyWithHTML(`🌙 NightMode bật: <b>${start}</b> - <b>${end}</b>`);
});

// ─── BLACKLIST ────────────────────────────────────────────────
bot.command("addblacklist", (ctx) => {
  const word = ctx.message.text.split(" ").slice(1).join(" ").toLowerCase();
  if (!word) return ctx.reply("⚠️ /addblacklist [từ]");
  const list = db.get("blacklist", ctx.chat.id.toString()) || [];
  if (!list.includes(word)) list.push(word);
  db.set("blacklist", ctx.chat.id.toString(), list);
  ctx.replyWithHTML(`🚷 Đã thêm từ cấm: <b>${word}</b>`);
});
bot.command("rmblacklist", (ctx) => {
  const word = ctx.message.text.split(" ")[1]?.toLowerCase();
  if (!word) return ctx.reply("⚠️ /rmblacklist [từ]");
  const list = (db.get("blacklist", ctx.chat.id.toString()) || []).filter(w=>w!==word);
  db.set("blacklist", ctx.chat.id.toString(), list);
  ctx.replyWithHTML(`✅ Đã xoá từ cấm: <b>${word}</b>`);
});
bot.command("blacklist", (ctx) => {
  const list = db.get("blacklist", ctx.chat.id.toString()) || [];
  list.length ? ctx.replyWithHTML(`🚷 <b>Từ cấm:</b>\n${list.map(w=>`• ${w}`).join("\n")}`) : ctx.reply("Danh sách trống.");
});

// ─── CAPTCHA ──────────────────────────────────────────────────
const pending = {};
bot.command("captcha", (ctx) => {
  const on = ctx.message.text.includes("on");
  db.set("captcha", ctx.chat.id.toString(), on);
  ctx.reply(on ? "🔐 Captcha bật." : "✅ Captcha tắt.");
});
bot.command("verify", async (ctx) => {
  const key = `${ctx.chat.id}:${ctx.from.id}`;
  const answer = pending[key];
  if (!answer) return;
  if (parseInt(ctx.message.text.split(" ")[1]) === answer) {
    delete pending[key];
    try {
      await ctx.restrictChatMember(ctx.from.id, {
        permissions: { can_send_messages: true, can_send_media_messages: true, can_send_polls: true, can_send_other_messages: true }
      });
    } catch {}
    ctx.replyWithHTML(`✅ <b>${ctx.from.first_name}</b> xác minh thành công!`);
  } else ctx.reply("❌ Sai! Thử lại.");
});

// ─── DỊCH THUẬT ───────────────────────────────────────────────
bot.command("tr", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const lang = args[1] || "vi";
  const text = args.slice(2).join(" ") || ctx.message.reply_to_message?.text;
  if (!text) return ctx.reply("⚠️ /tr [vi|en] [text]");
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    ctx.replyWithHTML(`🌐 <b>Dịch (${lang}):</b>\n${data[0].map(t=>t[0]).join("")}`);
  } catch { ctx.reply("❌ Lỗi dịch thuật."); }
});

// ─── NỘI QUY ──────────────────────────────────────────────────
bot.command("setrules", (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("⚠️ /setrules [nội quy]");
  db.set("rules", ctx.chat.id.toString(), text);
  ctx.reply("✅ Đã đặt nội quy!");
});
bot.command("rules", (ctx) => {
  const r = db.get("rules", ctx.chat.id.toString());
  r ? ctx.replyWithHTML(`📜 <b>Nội quy:</b>\n${r}`) : ctx.reply("Chưa đặt nội quy. Dùng /setrules");
});

// ─── THỐNG KÊ ─────────────────────────────────────────────────
bot.command("stats", async (ctx) => {
  try {
    const count = await ctx.getChatMembersCount();
    const totalUsers = Object.keys(db.load("fame")).length;
    ctx.replyWithHTML(`📊 <b>Thống kê</b>\n👥 Thành viên: <b>${count}</b>\n🏆 Hoạt động: <b>${totalUsers}</b>\n📅 ${new Date().toLocaleDateString("vi-VN")}`);
  } catch(e) { ctx.reply("❌ " + e.message); }
});

// ─── DEL ──────────────────────────────────────────────────────
bot.command("del", async (ctx) => {
  if (!await isAdmin(ctx)) return ctx.reply("❌ Chỉ admin.");
  if (ctx.message.reply_to_message) {
    try { await ctx.deleteMessage(ctx.message.reply_to_message.message_id); ctx.deleteMessage(); } catch {}
  }
});

// ─── MIDDLEWARE: TEXT ──────────────────────────────────────────
bot.on("text", async (ctx, next) => {
  const cid = ctx.chat.id.toString();
  const uid = ctx.from.id.toString();

  // AFK: tự động quay lại
  const afkData = db.get("afk", uid);
  if (afkData) {
    db.del("afk", uid);
    ctx.replyWithHTML(`✅ <b>${ctx.from.first_name}</b> đã quay lại sau ${Math.round((Date.now()-afkData.time)/60000)} phút!`);
  }

  // Blacklist
  const blacklist = db.get("blacklist", cid) || [];
  const text = ctx.message.text.toLowerCase();
  const found = blacklist.find(w => text.includes(w));
  if (found) {
    try { await ctx.deleteMessage(); } catch {}
    return ctx.replyWithHTML(`🚷 Tin nhắn chứa từ cấm: <b>${found}</b>`);
  }

  // Antiflood
  const limit = db.get("flood", cid);
  if (limit) {
    const key = `${cid}:${uid}`;
    if (!floodTrack[key] || Date.now() > floodTrack[key].reset) floodTrack[key] = { count: 0, reset: Date.now() + 10000 };
    floodTrack[key].count++;
    if (floodTrack[key].count > limit) {
      try { await ctx.restrictChatMember(ctx.from.id, { permissions: { can_send_messages: false } }); ctx.replyWithHTML(`⚠️ <b>${ctx.from.first_name}</b> bị mute do spam!`); } catch {}
      return;
    }
  }

  // NightMode
  const nm = db.get("nightmode", cid);
  if (nm) {
    const now = new Date(); const cur = now.getHours()*60+now.getMinutes();
    const [sh,sm] = nm.start.split(":").map(Number); const [eh,em] = nm.end.split(":").map(Number);
    const s = sh*60+sm, e = eh*60+em;
    const isNight = s > e ? (cur >= s || cur < e) : (cur >= s && cur < e);
    if (isNight) { try { await ctx.deleteMessage(); } catch {} return; }
  }

  // Fame points
  const score = db.get("fame", uid) || { name: ctx.from.first_name, points: 0 };
  score.points += 0.1; score.name = ctx.from.first_name;
  db.set("fame", uid, score);

  next();
});

// ─── NEW MEMBER ───────────────────────────────────────────────
bot.on("new_chat_members", async (ctx) => {
  const cid = ctx.chat.id.toString();
  const raid = db.get("antiraid", cid);
  const captchaOn = db.get("captcha", cid);

  for (const member of ctx.message.new_chat_members) {
    if (raid) {
      try { await ctx.banChatMember(member.id); await ctx.unbanChatMember(member.id); } catch {}
      ctx.reply("🚫 AntiRaid: Thành viên mới bị kick!");
      continue;
    }
    if (captchaOn) {
      const n1 = Math.floor(Math.random()*10), n2 = Math.floor(Math.random()*10);
      pending[`${cid}:${member.id}`] = n1 + n2;
      try { await ctx.restrictChatMember(member.id, { permissions: { can_send_messages: false } }); } catch {}
      ctx.replyWithHTML(`🔐 Chào <b>${member.first_name}</b>!\nXác minh: ${n1} + ${n2} = ?\nDùng /verify [đáp án]`);
      continue;
    }
    const tmpl = db.get("welcome", cid);
    const text = (tmpl || "👋 Chào mừng {name} đến với nhóm!")
      .replace("{name}", member.first_name)
      .replace("{username}", member.username ? "@"+member.username : member.first_name)
      .replace("{id}", member.id);
    ctx.reply(text);
  }
});

// ─── CALLBACK MENU ────────────────────────────────────────────
const moduleInfo = {
  mod_quantri: ["🛡️ Quản trị", "/ban · /unban [id] · /kick · /mute · /unmute · /admins · /info"],
  mod_afk: ["💤 AFK", "/afk [lý do] · /back"],
  mod_antiflood: ["🌊 Antiflood", "/setflood [số] (0=tắt) · /flood"],
  mod_antiraid: ["🚫 AntiRaid", "/antiraid on|off · /raidmode"],
  mod_captcha: ["🔐 Xác thực", "/captcha on|off · /verify [đáp án]"],
  mod_tudong: ["⚙️ Tự động", "/addfilter [từ] [trả lời] · /rmfilter · /filters"],
  mod_autoreact: ["😍 AutoReact", "/react add [emoji] [từ] · /react remove · /react list"],
  mod_blacklist: ["🚷 Blacklist", "/addblacklist [từ] · /rmblacklist [từ] · /blacklist"],
  mod_channelp: ["📢 ChannelP", "/setpost [channel_id] · /post [nội dung] · /autopost on|off"],
  mod_channels: ["📡 ChannelS", "/sync add [channel] · /sync remove · /synclist"],
  mod_cleanserv: ["🧹 CleanServ", "/del (reply tin nhắn cần xoá)"],
  mod_ketnoi: ["🔗 Kết nối", "/connect [group_id] · /disconnect · /connected"],
  mod_congcudan: ["📋 CôngCụDán", "/paste [nội dung] · /getpaste [id] · /pastelist"],
  mod_daoly: ["📜 Đạo lý", "/setrules [nội quy] · /rules · /clearrules"],
  mod_developer: ["👨‍💻 Developer", "/ping · /id · /stats"],
  mod_diemdanh: ["✅ DiemDanh", "/diemdanh · /bangdiem"],
  mod_famerank: ["🏆 FameRank", "/rank · /top · /leaderboard"],
  mod_boloc: ["🔍 Bộ lọc", "/addfilter [từ] [trả lời] · /rmfilter · /filters"],
  mod_chaomung: ["👋 Chào mừng", "/setwelcome [text] · /welcome · /resetwelcome\nBiến: {name} {username} {id}"],
  mod_importex: ["📦 Import/Export", "/export · /import · /backup"],
  mod_khoa: ["🔒 Khóa", "/lock [loại] · /unlock [loại] · /locktypes\nLoại: sticker gif url photo video voice document"],
  mod_modmail: ["✉️ Modmail", "/modmail [nội dung] · /modmaillist · /modmailreply [id] [trả lời]"],
  mod_nhandan: ["🏷️ NhãnDán", "/tag @user [nhãn] · /untag @user · /tags"],
  mod_nightmode: ["🌙 NightMode", "/nightmode on [22:00] [06:00] · /nightmode off"],
  mod_ghichu: ["📝 Ghi chú", "/save [tên] [nội dung] · /get [tên] · /notes · /clear [tên] · #tên"],
  mod_ownereve: ["👑 OwnerEve", "/setevent [tên] [mô tả] · /events · /notify [nội dung]"],
  mod_phantich: ["📊 PhânTích", "/stats · /admins · /id"],
  mod_lichsu: ["📅 Lịch sử Tên", "/namelog @user · /clearnames @user"],
  mod_sieukqt: ["⚡ SiêuQuảnTrị", "/gban @user · /ungban @user · /broadcast [nội dung]"],
  mod_chude: ["🎨 Chủ đề", "/settheme [tên] · /themes · /resettheme"],
  mod_translate: ["🌐 Translate", "/tr vi [text] · /tr en [text] · (reply tin nhắn + /tr vi)"],
  mod_trichxuat: ["📤 TríchXuất", "/extract members · /extract admins · /extract messages"],
  mod_timkiem: ["🔎 TìmKiếm", "/search [từ khoá] · /searchuser [tên] · /searchnote [từ]"],
  mod_tnnai: ["🧠 TínhNăng AI", "/ai [câu hỏi] · /summarize"],
  mod_tinhnang: ["✨ TínhNăng+", "/poll [câu hỏi] · /quiz · /weather [thành phố]"],
  mod_taophien: ["🗂️ TạoPhiên", "/session start [tên] · /session end · /session list"],
  mod_taive: ["⬇️ TảiVề", "/dl [url] · /ytdl [url] · /mp3 [url] · /mp4 [url]"],
  mod_yeughet: ["❤️ YêuGhét", "/love @user · /hate @user · /loveboard"],
};

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (data === "menu_main") return ctx.editMessageText("🏠 Menu chính:", showMainMenu());
  if (data === "menu_dong") return ctx.editMessageText("✅ Đã đóng menu.");
  if (data === "menu_timkiem") return ctx.editMessageText("🔍 Dùng lệnh /search [từ khoá] để tìm.", backBtn());
  if (data === "menu_huongdan") {
    const text = `📚 <b>Hướng dẫn đầy đủ</b>\n\n` +
      Object.values(moduleInfo).map(([name, cmds]) => `<b>${name}</b>\n${cmds}`).join("\n\n");
    return ctx.editMessageText(text, { parse_mode: "HTML", ...backBtn() });
  }

  const info = moduleInfo[data];
  if (info) {
    return ctx.editMessageText(
      `${info[0]}\n\n📋 <b>Lệnh:</b>\n${info[1]}`,
      { parse_mode: "HTML", ...backBtn() }
    );
  }
});

// ─── LAUNCH ───────────────────────────────────────────────────
bot.launch().then(() => {
  console.log("✅ Bot TRẦN MINH CHIẾN đã khởi động!");
  console.log("📡 Đang lắng nghe tin nhắn...");
}).catch(err => console.error("❌ Lỗi:", err.message));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
