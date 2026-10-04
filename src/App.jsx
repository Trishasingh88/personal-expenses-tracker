import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  DollarSign,
  LayoutDashboard,
  Moon,
  Plus,
  Receipt,
  Search,
  Sun,
  Trash2,
  Wallet,
  X
} from "lucide-react";

const initialTransactions = [
  { id: 1, type: "income", title: "Salary", category: "Salary", amount: 85000, date: "2026-10-01" },
  { id: 2, type: "expense", title: "Rent", category: "Housing", amount: 22000, date: "2026-10-02" },
  { id: 3, type: "expense", title: "Groceries", category: "Food", amount: 4200, date: "2026-10-03" },
  { id: 4, type: "expense", title: "Electricity Bill", category: "Bills", amount: 1800, date: "2026-10-04" },
  { id: 5, type: "expense", title: "Cab & Metro", category: "Transport", amount: 2400, date: "2026-10-04" },
  { id: 6, type: "income", title: "Freelance Project", category: "Freelance", amount: 12000, date: "2026-10-05" },
  { id: 7, type: "expense", title: "Dinner", category: "Food", amount: 1650, date: "2026-10-06" }
];

const expenseColors = ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("fintrack-transactions");
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("fintrack-theme") === "dark";
    } catch {
      return false;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [month, setMonth] = useState("2026-10");

  useEffect(() => {
    localStorage.setItem("fintrack-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("fintrack-theme", dark ? "dark" : "light");
  }, [dark]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(month))
      .filter((t) => filter === "all" || t.type === filter)
      .filter((t) => {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, month, filter, search]);

  const totals = useMemo(() => {
    const current = transactions.filter((t) => t.date.startsWith(month));
    const income = current
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = current
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses };
  }, [transactions, month]);

  const categoryData = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.date.startsWith(month) && t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, month]);

  const trendData = useMemo(() => {
    const days = {};
    transactions
      .filter((t) => t.date.startsWith(month))
      .forEach((t) => {
        const day = Number(t.date.slice(-2));
        if (!days[day]) days[day] = { day, income: 0, expenses: 0 };
        if (t.type === "income") days[day].income += t.amount;
        else days[day].expenses += t.amount;
      });

    return Object.values(days).sort((a, b) => a.day - b.day);
  }, [transactions, month]);

  const addTransaction = (transaction) => {
    setTransactions((prev) => [
      ...prev,
      { ...transaction, id: Date.now(), amount: Number(transaction.amount) }
    ]);
    setShowModal(false);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const savingsRate =
    totals.income > 0
      ? Math.max(0, Math.round((totals.balance / totals.income) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                <BarChart3 size={17} />
                Personal Finance
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Good evening, Trisha 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Here’s your financial overview for this month.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CalendarDays size={17} className="text-slate-400" />
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-transparent outline-none dark:[color-scheme:dark]"
                />
              </label>

              <button
                onClick={() => setDark(!dark)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
                aria-label="Toggle theme"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Add transaction
              </button>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total balance"
              value={currency(totals.balance)}
              icon={<Wallet size={20} />}
              tone="indigo"
              change={`${savingsRate}% saved`}
            />
            <StatCard
              title="Income"
              value={currency(totals.income)}
              icon={<ArrowUpRight size={20} />}
              tone="emerald"
              change="This month"
            />
            <StatCard
              title="Expenses"
              value={currency(totals.expenses)}
              icon={<ArrowDownRight size={20} />}
              tone="rose"
              change="This month"
            />
            <StatCard
              title="Transactions"
              value={filteredTransactions.length}
              icon={<Receipt size={20} />}
              tone="amber"
              change="Showing current filter"
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <Panel title="Cash flow" subtitle="Income vs expenses by transaction date">
              <div className="h-[310px] w-full">
                {trendData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e293b" : "#e2e8f0"} />
                      <XAxis dataKey="day" tick={{ fill: dark ? "#94a3b8" : "#64748b", fontSize: 12 }} />
                      <YAxis
                        tick={{ fill: dark ? "#94a3b8" : "#64748b", fontSize: 12 }}
                        tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                      />
                      <Tooltip
                        formatter={(value) => currency(value)}
                        contentStyle={{
                          borderRadius: 14,
                          border: dark ? "1px solid #334155" : "1px solid #e2e8f0",
                          background: dark ? "#0f172a" : "#ffffff"
                        }}
                      />
                      <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeFill)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="expenses" stroke="#6366f1" fill="url(#expenseFill)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Add transactions to see your cash-flow chart." />
                )}
              </div>
              <div className="mt-2 flex gap-5 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Income</span>
                <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-indigo-500" />Expenses</span>
              </div>
            </Panel>

            <Panel title="Spending breakdown" subtitle="Where your money goes">
              <div className="h-[250px]">
                {categoryData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={expenseColors[index % expenseColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => currency(value)}
                        contentStyle={{
                          borderRadius: 14,
                          border: dark ? "1px solid #334155" : "1px solid #e2e8f0",
                          background: dark ? "#0f172a" : "#ffffff"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No expenses for this month." />
                )}
              </div>
              <div className="space-y-3">
                {categoryData.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: expenseColors[index % expenseColors.length] }}
                      />
                      <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-semibold">{currency(item.value)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className="mt-6">
            <Panel
              title="Transactions"
              subtitle="Manage your income and expenses"
              action={
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="h-10 w-40 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 sm:w-52"
                    />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="all">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expenses</option>
                  </select>
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800">
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 text-right font-semibold">Amount</th>
                      <th className="pb-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              t.type === "income"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                                : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                            }`}>
                              {t.type === "income" ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
                            </div>
                            <span className="font-medium">{t.title}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-500 dark:text-slate-400">{t.category}</td>
                        <td className="py-4 text-slate-500 dark:text-slate-400">{formatDate(t.date)}</td>
                        <td className={`py-4 text-right font-semibold ${
                          t.type === "income" ? "text-emerald-600" : "text-slate-800 dark:text-slate-100"
                        }`}>
                          {t.type === "income" ? "+" : "-"}{currency(t.amount)}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="rounded-lg p-2 text-slate-400 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label={`Delete ${t.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!filteredTransactions.length && (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No transactions match your filters.
                  </div>
                )}
              </div>
            </Panel>
          </section>

          <footer className="py-8 text-center text-xs text-slate-400">
            Personal Expenses Tracker
          </footer>
        </main>
      </div>

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSave={addTransaction}
        />
      )}
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
          <DollarSign size={21} />
        </div>
        <div>
          <div className="font-bold">FinTrack</div>
          <div className="text-xs text-slate-400">Finance analytics</div>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        <NavItem active icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem icon={<Receipt size={18} />} label="Transactions" />
        <NavItem icon={<BarChart3 size={18} />} label="Analytics" />
      </nav>

      <div className="mt-8 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-500/10">
        <p className="text-sm font-semibold">Savings goal</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Keep building your emergency fund.</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-800">
          <div className="h-full w-[72%] rounded-full bg-indigo-600" />
        </div>
        <p className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">72% completed</p>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, icon, tone, change }) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">{change}</p>
    </div>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function TransactionModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    type: "expense",
    title: "",
    category: "Food",
    amount: "",
    date: new Date().toISOString().slice(0, 10)
  });
  const [error, setError] = useState("");

  const categories = form.type === "income"
    ? ["Salary", "Freelance", "Business", "Investment", "Other"]
    : ["Food", "Housing", "Bills", "Transport", "Shopping", "Health", "Entertainment", "Other"];

  const submit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return setError("Please enter a description.");
    if (!form.amount || Number(form.amount) <= 0) return setError("Amount must be greater than zero.");
    if (!form.date) return setError("Please choose a date.");

    onSave(form);
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Add transaction</h2>
            <p className="mt-1 text-xs text-slate-400">Track your income or spending.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={19} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {["expense", "income"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("type", type)}
              className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${
                form.type === type
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Description">
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Monthly groceries"
              className="input"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount">
              <input
                type="number"
                min="1"
                step="1"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="5000"
                className="input"
              />
            </Field>

            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="input"
              >
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="input dark:[color-scheme:dark]"
            />
          </Field>

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            <Check size={17} />
            Save transaction
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}

export default App;