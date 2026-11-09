import { useState, useEffect, createContext, useContext } from "react";
const api = async (p, o = {}) => {
  const t = localStorage.t;
  const r = await fetch("/api" + p, {
    method: o.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(t && { Authorization: "Bearer " + t }),
    },
    body: o.body && JSON.stringify(o.body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Error");
  return d;
};
const U = createContext(),
  days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  types = ["breakfast", "lunch", "snacks", "dinner"],
  today = (new Date().getDay() + 6) % 7;
const Card = ({ children, c = "" }) => (
  <div
    className={
      "rounded-3xl bg-white/90 border border-black/5 shadow-sm p-5 " + c
    }
  >
    {children}
  </div>
);
const Btn = (p) => (
  <button
    {...p}
    className={
      "rounded-full bg-black text-white px-5 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-40 " +
      (p.className || "")
    }
  />
);
const cls =
  "w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black bg-white";
const In = (p) => <input {...p} className={cls} />;
const Sel = ({ o, ...p }) => (
  <select {...p} className={cls}>
    {o.map((x) => (
      <option key={x}>{x}</option>
    ))}
  </select>
);
const Veg = ({ v }) => (
  <span
    className={
      "inline-block w-4 h-4 border-2 rounded-sm " +
      (v ? "border-green-600" : "border-red-600")
    }
  >
    <i
      className={
        "block w-1.5 h-1.5 m-[1px] rounded-full " +
        (v ? "bg-green-600" : "bg-red-600")
      }
    />
  </span>
);
const Pill = ({ s }) => (
  <span
    className={
      "rounded-full px-3 py-1 text-xs font-semibold " +
      ({
        paid: "bg-green-100 text-green-700",
        resolved: "bg-green-100 text-green-700",
        "in-progress": "bg-yellow-100 text-yellow-700",
      }[s] || "bg-lilac/40")
    }
  >
    {s}
  </span>
);

function Auth({ set }) {
  const [reg, setReg] = useState(false),
    [f, setF] = useState({}),
    [e, setE] = useState("");
  const go = async () => {
    try {
      const d = await api("/auth/" + (reg ? "register" : "login"), {
        method: "POST",
        body: f,
      });
      localStorage.t = d.token;
      set(d.user);
    } catch (x) {
      setE(x.message);
    }
  };
  const h = (k) => ({
    placeholder: k,
    onChange: (v) => setF({ ...f, [k]: v.target.value }),
  });
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card c="w-full max-w-sm space-y-3 !p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Mess<span className="text-[#b66cf0]">.</span>
        </h1>
        <p className="text-sm text-black/50">
          IIIT Bhubaneswar · sign in with your college mail
        </p>
        {reg && <In {...h("name")} />}
        {reg && <In {...h("room")} />}
        <In {...h("email")} placeholder="you@iiit-bh.ac.in" />
        <In type="password" {...h("password")} />
        {e && <p className="text-sm text-red-600">{e}</p>}
        <Btn className="w-full" onClick={go}>
          {reg ? "Create account" : "Log in"}
        </Btn>
        <button className="text-sm underline" onClick={() => setReg(!reg)}>
          {reg ? "Have an account? Log in" : "New here? Register"}
        </button>
      </Card>
    </div>
  );
}

function Menu() {
  const [m, setM] = useState([]),
    [a, setA] = useState([]),
    [d, setD] = useState(today),
    [wk, setWk] = useState(false);
  useEffect(() => {
    api("/menu").then(setM);
    api("/announcements").then(setA);
  }, []);
  const Meal = ({ x }) => (
    <div className="rounded-2xl bg-lilac/25 p-4">
      <div className="flex justify-between text-xs uppercase tracking-wider font-bold">
        <span>{x.type}</span>
        <Veg v={x.veg} />
      </div>
      <p className="mt-2 text-sm font-medium">{x.items.join(", ")}</p>
      <p className="mt-2 text-xs text-black/50">
        {x.calories} kcal · {x.protein}g protein
      </p>
      {!!x.allergens?.length && (
        <p className="text-xs text-red-600 mt-1">⚠ {x.allergens.join(", ")}</p>
      )}
    </div>
  );
  return (
    <div className="space-y-5">
      {a.map((x) => (
        <div
          key={x._id}
          className="rounded-2xl bg-black text-white px-5 py-3 text-sm"
        >
          📢 {x.text}
        </div>
      ))}
      <div className="flex gap-2 flex-wrap items-center">
        {days.map((x, i) => (
          <button
            key={x}
            onClick={() => {
              setD(i);
              setWk(false);
            }}
            className={
              "rounded-full px-4 py-2 text-sm " +
              (!wk && d === i
                ? "bg-black text-white"
                : "bg-white border border-black/10")
            }
          >
            {x}
            {i === today && " •"}
          </button>
        ))}
        <button
          onClick={() => setWk(!wk)}
          className={
            "ml-auto rounded-full px-4 py-2 text-sm " +
            (wk ? "bg-lilac" : "bg-white border border-black/10")
          }
        >
          Weekly view
        </button>
      </div>
      {wk ? (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[900px]">
            {days.map((x, i) => (
              <Card key={x} c="!p-3 space-y-2">
                <b className="text-sm">{x}</b>
                {m
                  .filter((y) => y.day === i)
                  .map((y) => (
                    <div key={y._id} className="text-xs">
                      <div className="flex items-center gap-1 font-bold capitalize">
                        <Veg v={y.veg} />
                        {y.type}
                      </div>
                      {y.items.join(", ")}
                    </div>
                  ))}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {types.map((t) =>
            m
              .filter((x) => x.day === d && x.type === t)
              .map((x) => <Meal key={x._id} x={x} />),
          )}
          {!m.some((x) => x.day === d) && (
            <p className="text-black/50">No menu added for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Fees() {
  const [l, setL] = useState([]);
  useEffect(() => {
    api("/fees").then(setL);
  }, []);
  const p = l.filter((x) => x.status === "pending");
  return (
    <div className="space-y-4">
      <Card c="bg-black !text-white">
        <p className="text-sm opacity-60">Pending</p>
        <p className="text-4xl font-extrabold">
          ₹{p.reduce((a, x) => a + x.amount, 0)}
        </p>
        <p className="text-xs opacity-60 mt-2">
          Pay offline at the mess office / accounts counter.
        </p>
      </Card>
      {l.map((x) => (
        <Card key={x._id} c="flex justify-between items-center !py-4">
          <div>
            <b>{x.month}</b>
            <p className="text-xs text-black/50">
              {x.status === "paid"
                ? "Paid " + new Date(x.paidOn).toLocaleDateString()
                : "Due"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <b>₹{x.amount}</b>
            <Pill s={x.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function Feedback() {
  const [l, setL] = useState([]),
    [f, setF] = useState({ kind: "quality", rating: 5 }),
    load = () => api("/feedback").then(setL);
  useEffect(() => {
    load();
  }, []);
  const send = async () => {
    await api("/feedback", { method: "POST", body: f });
    setF({ kind: "quality", rating: 5 });
    load();
  };
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card c="space-y-3 h-fit">
        <b>Report or rate</b>
        <Sel
          o={["quality", "hygiene", "rating", "feedback"]}
          value={f.kind}
          onChange={(e) => setF({ ...f, kind: e.target.value })}
        />
        {f.kind === "rating" && (
          <>
            <In
              placeholder="Which meal? e.g. Tue lunch"
              onChange={(e) => setF({ ...f, meal: e.target.value })}
            />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setF({ ...f, rating: n })}
                  className={"text-2xl " + (n <= f.rating ? "" : "opacity-25")}
                >
                  ★
                </button>
              ))}
            </div>
          </>
        )}
        <textarea
          className={cls}
          rows="4"
          placeholder="Tell us more…"
          value={f.text || ""}
          onChange={(e) => setF({ ...f, text: e.target.value })}
        />
        <label className="text-sm flex gap-2">
          <input
            type="checkbox"
            onChange={(e) => setF({ ...f, anon: e.target.checked })}
          />
          Submit anonymously
        </label>
        <Btn disabled={!f.text} onClick={send}>
          Submit
        </Btn>
      </Card>
      <div className="space-y-3">
        {l.map((x) => (
          <Card key={x._id} c="!p-4">
            <div className="flex justify-between">
              <b className="capitalize text-sm">
                {x.kind}
                {x.anon && " · anonymous"}
              </b>
              <Pill s={x.status} />
            </div>
            <p className="text-sm mt-2">{x.text}</p>
            {x.reply && (
              <p className="text-sm mt-2 bg-lilac/25 rounded-xl p-2">
                Mess team: {x.reply}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Admin() {
  const [m, setM] = useState({ day: 0, type: "lunch", veg: true }),
    [an, setAn] = useState(""),
    [fee, setFee] = useState({}),
    [fees, setFees] = useState([]),
    [fb, setFb] = useState([]);
  const load = () => {
    api("/fees").then(setFees);
    api("/feedback").then(setFb);
  };
  useEffect(load, []);
  const run = async (p, o) => {
    await api(p, o);
    load();
  };
  const g = (k, n) => ({
    placeholder: k,
    onChange: (e) => setM({ ...m, [k]: n ? +e.target.value : e.target.value }),
  });
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="space-y-5">
        <Card c="space-y-2">
          <b>Add meal</b>
          <div className="grid grid-cols-2 gap-2">
            <Sel
              o={days}
              onChange={(e) =>
                setM({ ...m, day: days.indexOf(e.target.value) })
              }
            />
            <Sel
              o={types}
              value={m.type}
              onChange={(e) => setM({ ...m, type: e.target.value })}
            />
          </div>
          <In
            placeholder="items (comma separated)"
            onChange={(e) =>
              setM({
                ...m,
                items: e.target.value.split(",").map((x) => x.trim()),
              })
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <In {...g("calories", 1)} />
            <In {...g("protein", 1)} />
          </div>
          <In
            placeholder="allergens (comma separated)"
            onChange={(e) =>
              setM({
                ...m,
                allergens: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
          <label className="text-sm flex gap-2">
            <input
              type="checkbox"
              checked={m.veg}
              onChange={(e) => setM({ ...m, veg: e.target.checked })}
            />
            Vegetarian
          </label>
          <Btn onClick={() => run("/menu", { method: "POST", body: m })}>
            Add
          </Btn>
        </Card>
        <Card c="space-y-2">
          <b>Announcement</b>
          <In value={an} onChange={(e) => setAn(e.target.value)} />
          <Btn
            onClick={() =>
              run("/announcements", {
                method: "POST",
                body: { text: an },
              }).then(() => setAn(""))
            }
          >
            Post
          </Btn>
        </Card>
        <Card c="space-y-2">
          <b>Create fee for all students</b>
          <In
            placeholder="Month e.g. Nov 2026"
            onChange={(e) => setFee({ ...fee, month: e.target.value })}
          />
          <In
            placeholder="Amount ₹"
            onChange={(e) => setFee({ ...fee, amount: +e.target.value })}
          />
          <Btn onClick={() => run("/fees", { method: "POST", body: fee })}>
            Create
          </Btn>
        </Card>
      </div>
      <div className="space-y-5">
        <Card c="space-y-2 max-h-96 overflow-auto">
          <b>Fees (mark offline payments)</b>
          {fees.map((x) => (
            <div
              key={x._id}
              className="flex justify-between text-sm items-center"
            >
              <span>
                {x.user?.name} · {x.month} · ₹{x.amount}
              </span>
              {x.status === "paid" ? (
                <Pill s="paid" />
              ) : (
                <button
                  className="underline"
                  onClick={() =>
                    run(`/fees/${x._id}/paid`, { method: "PATCH" })
                  }
                >
                  Mark paid
                </button>
              )}
            </div>
          ))}
        </Card>
        <Card c="space-y-3 max-h-[28rem] overflow-auto">
          <b>Complaints & feedback</b>
          {fb.map((x) => (
            <div key={x._id} className="text-sm border-t pt-2">
              <b className="capitalize">{x.kind}</b> ·{" "}
              {x.user?.name || "Anonymous"}
              <p>{x.text}</p>
              <div className="flex gap-2 mt-1">
                <Sel
                  o={["open", "in-progress", "resolved"]}
                  value={x.status}
                  onChange={(e) =>
                    run("/feedback/" + x._id, {
                      method: "PATCH",
                      body: { status: e.target.value, reply: x.reply },
                    })
                  }
                />
                <In
                  placeholder="Reply (press Enter)"
                  defaultValue={x.reply}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    run("/feedback/" + x._id, {
                      method: "PATCH",
                      body: { status: x.status, reply: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [u, setU] = useState(),
    [ok, setOk] = useState(!localStorage.t),
    [tab, setTab] = useState("Menu");
  useEffect(() => {
    localStorage.t &&
      api("/me")
        .then(setU)
        .catch(() => delete localStorage.t)
        .finally(() => setOk(true));
  }, []);
  if (!ok) return null;
  if (!u) return <Auth set={setU} />;
  const tabs = [
      "Menu",
      "Fees",
      "Feedback",
      ...(u.role === "admin" ? ["Admin"] : []),
    ],
    V = { Menu, Fees, Feedback, Admin }[tab];
  return (
    <U.Provider value={u}>
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold">
            Mess<span className="text-[#b66cf0]">.</span>
          </h1>
          <nav className="flex gap-1 bg-white/80 rounded-full p-1 border border-black/5">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "rounded-full px-4 py-1.5 text-sm " +
                  (tab === t ? "bg-black text-white" : "")
                }
              >
                {t}
              </button>
            ))}
          </nav>
          <button
            className="text-sm underline"
            onClick={() => {
              delete localStorage.t;
              setU(null);
            }}
          >
            {u.name} · Log out
          </button>
        </header>
        <section className="rounded-[2rem] bg-gradient-to-br from-lilac to-[#c58cf5] p-8">
          <p className="text-sm font-medium">Hi {u.name.split(" ")[0]} 👋</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            Good food, <span className="underline">on time</span>.
          </h2>
        </section>
        <V />
      </div>
    </U.Provider>
  );
}
