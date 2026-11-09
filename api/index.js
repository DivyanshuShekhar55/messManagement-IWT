import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const { Schema, model, models } = mongoose,
  ref = { type: Schema.Types.ObjectId, ref: "User" },
  T = { timestamps: true };
const User =
  models.User ||
  model(
    "User",
    new Schema(
      {
        name: String,
        email: { type: String, unique: true, lowercase: true },
        hash: String,
        role: { type: String, default: "student" },
        room: String,
      },
      T,
    ),
  );
const Meal =
  models.Meal ||
  model(
    "Meal",
    new Schema({
      day: Number,
      type: String,
      items: [String],
      veg: { type: Boolean, default: true },
      calories: Number,
      protein: Number,
      allergens: [String],
    }),
  );
const Fee =
  models.Fee ||
  model(
    "Fee",
    new Schema(
      {
        user: ref,
        month: String,
        amount: Number,
        status: { type: String, default: "pending" },
        paidOn: Date,
      },
      T,
    ),
  );
const Fb =
  models.Fb ||
  model(
    "Fb",
    new Schema(
      {
        user: ref,
        kind: String,
        text: String,
        rating: Number,
        meal: String,
        anon: Boolean,
        status: { type: String, default: "open" },
        reply: String,
      },
      T,
    ),
  );
const Ann = models.Ann || model("Ann", new Schema({ text: String }, T));
const app = express();
app.use(express.json());
app.use(async (q, s, n) => {
  global.db ??= mongoose.connect(process.env.MONGODB_URI);
  await global.db;
  n();
});
const auth = (role) => async (q, s, n) => {
  try {
    const { id } = jwt.verify(
      (q.headers.authorization || "").slice(7),
      process.env.JWT_SECRET,
    );
    q.u = await User.findById(id);
    if (!q.u || (role && q.u.role !== role)) throw 0;
    n();
  } catch {
    s.status(401).json({ error: "Unauthorized" });
  }
};
const A = auth("admin"),
  S = auth(),
  sign = (u) => ({
    token: jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "30d" }),
    user: { id: u.id, name: u.name, email: u.email, role: u.role },
  });
app.post("/api/auth/register", async (q, s) => {
  const { name, email = "", password = "", room } = q.body,
    e = email.trim().toLowerCase();
  if (!e.endsWith("@iiit-bh.ac.in"))
    return s.status(400).json({ error: "Use your @iiit-bh.ac.in email" });
  if (password.length < 6 || !name)
    return s.status(400).json({ error: "Name and 6+ char password required" });
  if (await User.findOne({ email: e }))
    return s.status(400).json({ error: "Already registered" });
  const admin = (process.env.ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map((x) => x.trim())
    .includes(e);
  s.json(
    sign(
      await User.create({
        name,
        room,
        email: e,
        hash: await bcrypt.hash(password, 10),
        role: admin ? "admin" : "student",
      }),
    ),
  );
});
app.post("/api/auth/login", async (q, s) => {
  const u = await User.findOne({
    email: (q.body.email || "").trim().toLowerCase(),
  });
  if (!u || !(await bcrypt.compare(q.body.password || "", u.hash)))
    return s.status(400).json({ error: "Invalid credentials" });
  s.json(sign(u));
});
app.get("/api/me", S, (q, s) => s.json(sign(q.u).user));
app.get("/api/menu", S, async (q, s) =>
  s.json(await Meal.find().sort({ day: 1 })),
);
app.post("/api/menu", A, async (q, s) => s.json(await Meal.create(q.body)));
app.delete("/api/menu/:id", A, async (q, s) =>
  s.json(await Meal.findByIdAndDelete(q.params.id)),
);
app.get("/api/announcements", S, async (q, s) =>
  s.json(await Ann.find().sort({ createdAt: -1 }).limit(5)),
);
app.post("/api/announcements", A, async (q, s) =>
  s.json(await Ann.create({ text: q.body.text })),
);
app.get("/api/fees", S, async (q, s) =>
  s.json(
    await Fee.find(q.u.role === "admin" ? {} : { user: q.u.id })
      .populate("user", "name email room")
      .sort({ createdAt: -1 }),
  ),
);
app.post("/api/fees", A, async (q, s) => {
  const st = await User.find({ role: "student" });
  s.json(
    await Fee.insertMany(
      st.map((u) => ({
        user: u.id,
        month: q.body.month,
        amount: q.body.amount,
      })),
    ),
  );
});
app.patch("/api/fees/:id/paid", A, async (q, s) =>
  s.json(
    await Fee.findByIdAndUpdate(
      q.params.id,
      { status: "paid", paidOn: new Date() },
      { new: true },
    ),
  ),
);
app.post("/api/feedback", S, async (q, s) => {
  const { kind, text, rating, meal, anon } = q.body;
  s.json(await Fb.create({ kind, text, rating, meal, anon, user: q.u.id }));
});
app.get("/api/feedback", S, async (q, s) => {
  const adm = q.u.role === "admin",
    l = await Fb.find(adm ? {} : { user: q.u.id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();
  s.json(l.map((f) => (adm && f.anon ? { ...f, user: null } : f)));
});
app.patch("/api/feedback/:id", A, async (q, s) =>
  s.json(
    await Fb.findByIdAndUpdate(
      q.params.id,
      { status: q.body.status, reply: q.body.reply },
      { new: true },
    ),
  ),
);
app.use((e, q, s, n) => s.status(500).json({ error: e.message }));
export default app;
if (!process.env.VERCEL) app.listen(3000, () => console.log("API :3000"));
