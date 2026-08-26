import { useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Activity,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import {
  categories,
  conversations,
  currentUser,
  getCategory,
  getTicketsForSession,
  getUser,
  registerUser,
  tickets,
  users,
  type Role,
  type Ticket,
  type TicketStatus,
  type User,
} from "./data/mockData";
import "./App.css";

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting: "Waiting on employee",
  resolved: "Resolved",
};
const navItems = [
  {
    label: "Overview",
    to: "/",
    icon: LayoutDashboard,
    roles: ["manager", "agent"],
  },
  {
    label: "My requests",
    to: "/requests",
    icon: FileText,
    roles: ["employee"],
  },
  {
    label: "Support queue",
    to: "/queue",
    icon: LifeBuoy,
    roles: ["agent", "manager"],
  },
  { label: "Team overview", to: "/team", icon: Activity, roles: ["manager"] },
  { label: "Accounts", to: "/accounts", icon: Users, roles: ["manager"] },
  { label: "Settings", to: "/settings", icon: Settings, roles: ["manager"] },
];

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`status status-${status}`}>
      <span />
      {statusLabels[status]}
    </span>
  );
}
function roleLabel(role: Role) {
  return role === "manager"
    ? "Support manager"
    : role === "agent"
      ? "Support agent"
      : "Employee";
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const logout = () => setSessionUser(null);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login onAuth={setSessionUser} />}
        />
        <Route
          path="*"
          element={
            sessionUser ? (
              <Shell
                role={sessionUser.role}
                setRole={() => undefined}
                sessionUser={sessionUser}
                onLogout={logout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function Login({
  onAuth,
}: {
  onAuth: (user: User) => void;
}) {
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [signupRole, setSignupRole] = useState<Role>("employee");
  const [error, setError] = useState("");
  return (
    <main className="login-page">
      <div className="login-card">
        <div className="brand-mark">
          <LifeBuoy size={22} />
        </div>
        <p className="eyebrow">NORTHSTAR IT</p>
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">
          {signup
            ? "Choose your account type and access details."
            : "Sign in to your support workspace."}
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            const form = new FormData(event.currentTarget);
            try {
              const user = signup
                ? registerUser(
                    String(form.get("name")),
                    String(form.get("email")),
                    signupRole === "employee" ? Number(form.get("category")) : null,
                    String(form.get("role")) as Role,
                  )
                : users.find((user) => user.email === form.get("email")) ||
                  currentUser;
              onAuth(user);
              navigate("/");
            } catch (caught) {
              setError(
                caught instanceof Error
                  ? caught.message
                  : "Unable to create account.",
              );
            }
          }}
        >
          <>
            {signup && (
              <label>
                Full name
                <input name="name" required placeholder="Your name" />
              </label>
            )}
          </>
          <label>
            Email address
            <input
              name="email"
              type="email"
              defaultValue={signup ? "" : "alicia.morgan@northstar.co"}
              required
              placeholder="you@company.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              defaultValue={signup ? "" : "password"}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </label>
          {signup && (
            <label>
              Account type
              <select name="role" value={signupRole} onChange={(event) => setSignupRole(event.target.value as Role)} required>
                <option value="employee">Employee</option>
                <option value="agent">Technical agent</option>
                <option value="manager">Manager</option>
              </select>
            </label>
          )}
          {signup && (
            signupRole === "employee" && (
            <label>
              Support category
              <select name="category" defaultValue="" required>
                <option value="" disabled>Select your category</option>
                {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
              </select>
            </label>
            )
          )}
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full" type="submit">
            {signup ? "Create account" : "Sign in"}
          </button>
        </form>
        <button
          className="auth-toggle"
          onClick={() => {
            setSignup(!signup);
            setError("");
          }}
        >
          {signup
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
        <p className="login-foot">
          <ShieldCheck size={14} /> Secure internal workspace
        </p>
      </div>
    </main>
  );
}

function Shell({
  role,
  setRole,
  sessionUser,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
}: {
  role: Role;
  setRole: (role: Role) => void;
  sessionUser: User;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = navItems.filter((item) => item.roles.includes(role));
  const category = getCategory(sessionUser.categoryId);
  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-brand">
          <div className="brand-mark small">
            <LifeBuoy size={18} />
          </div>
          <span>
            Northstar <strong>IT</strong>
          </span>
          <button
            className="icon-button close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-select">
          <div className="workspace-icon">
            <CircleHelp size={17} />
          </div>
          <div>
            <small>Assigned category</small>
            <strong>{category?.name ?? "All categories"}</strong>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav>
          <p className="nav-label">Workspace</p>
          {items.map(({ label, to, icon: Icon }) => (
            <Link
              className={
                location.pathname === to ? "nav-item active" : "nav-item"
              }
              to={to}
              key={to}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
          <p className="nav-label space-top">Resources</p>
          <a className="nav-item" href="#guides">
            <BookOpen size={17} />
            Help center
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="status-live">
            <span />
            All systems operational
          </div>
          <button className="profile-mini" onClick={() => { onLogout(); navigate("/login"); }}>
            <div className="avatar">{sessionUser.initials}</div>
            <div>
              <strong>{sessionUser.name}</strong>
              <small>
                {roleLabel(role)} · {category?.name ?? "All categories"}
              </small>
            </div>
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            Help desk <span>/</span>{" "}
            {location.pathname === "/"
              ? "Overview"
              : location.pathname.slice(1).replace("-", " ")}
          </div>
          <div className="topbar-actions">
            <div className="role-switcher">
              <span>Viewing as</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                aria-label="Switch demo role"
              >
                <option value="manager">Manager</option>
                <option value="agent">Support agent</option>
                <option value="employee">Employee</option>
              </select>
              <ChevronDown size={14} />
            </div>
            <button className="icon-button notification">
              <Bell size={18} />
              <i />
            </button>
            <div className="avatar">{sessionUser.initials}</div>
          </div>
        </header>
        <main className="content">
          <div className="scope-banner">
            <ShieldCheck size={15} /> Session scope:{" "}
            <strong>{category?.name ?? "All categories"}</strong>
            <span>{category ? "Only tickets in this category are visible." : "Managers and technical agents can view every category."}</span>
          </div>
          <Routes>
            <Route path="/" element={<Dashboard sessionUser={sessionUser} />} />
            <Route
              path="/requests"
              element={<TicketList sessionUser={sessionUser} employee />}
            />
            <Route
              path="/queue"
              element={<TicketList sessionUser={sessionUser} />}
            />
            <Route
              path="/new"
              element={<NewRequest sessionUser={sessionUser} />}
            />
            <Route
              path="/ticket/:id"
              element={<TicketDetail role={role} sessionUser={sessionUser} />}
            />
            <Route
              path="/team"
              element={<TeamOverview sessionUser={sessionUser} />}
            />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function Dashboard({ sessionUser }: { sessionUser: User }) {
  const scoped = getTicketsForSession(sessionUser);
  const counts = {
    open: scoped.filter((t) => t.status === "open").length,
    in_progress: scoped.filter((t) => t.status === "in_progress").length,
    waiting: scoped.filter((t) => t.status === "waiting").length,
    resolved: scoped.filter((t) => t.status === "resolved").length,
  };
  return (
    <>
      <PageHeading
        eyebrow="Wednesday, 26 August 2026"
        title={`Good morning, ${sessionUser.name.split(" ")[0]}`}
        subtitle="Here is what needs your attention today."
        action={
          <Link to="/new" className="primary-button">
            <Plus size={17} /> New request
          </Link>
        }
      />
      <div className="stat-grid">
        {(
          [
            ["open", "Open requests", CircleHelp],
            ["in_progress", "In progress", Activity],
            ["waiting", "Waiting on employee", Clock3],
            ["resolved", "Resolved this month", CheckCircle2],
          ] as const
        ).map(([key, label, Icon]) => (
          <div className="stat-card" key={key}>
            <div className={`stat-icon ${key}`}>
              <Icon size={18} />
            </div>
            <div>
              <strong>{counts[key]}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent requests</h2>
              <p className="muted">
                {getCategory(sessionUser.categoryId)?.name} category
              </p>
            </div>
            <Link to="/queue" className="text-link">
              View queue
            </Link>
          </div>
          <TicketTable data={scoped.slice(0, 4)} />
        </section>
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Team pulse</h2>
              <p className="muted">Live activity from your team</p>
            </div>
            <MoreHorizontal size={18} />
          </div>
          {[
            ["MC", "Marcus claimed a request", "8 min ago"],
            ["PS", "Priya resolved a request", "42 min ago"],
            ["DR", "Daniel added a comment", "1 hr ago"],
            ["AM", "You reassigned a request", "2 hrs ago"],
          ].map(([initials, text, time]) => (
            <div className="activity-row" key={text}>
              <div className="avatar avatar-blue">{initials}</div>
              <div>
                <strong>{text}</strong>
                <small>{time}</small>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
function TicketList({
  sessionUser,
  employee = false,
}: {
  sessionUser: User;
  employee?: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const data = getTicketsForSession(sessionUser);
  const filtered =
    filter === "all"
      ? data
      : data.filter((t) =>
          filter === "unassigned"
            ? !t.assigneeId
            : filter === "mine"
              ? t.assigneeId === sessionUser.id
              : t.status === "resolved",
        );
  return (
    <>
      <PageHeading
        eyebrow={employee ? "Employee portal" : "Operations"}
        title={employee ? "My requests" : "Support queue"}
        subtitle={`${getCategory(sessionUser.categoryId)?.name} category only`}
        action={
          employee ? (
            <Link to="/new" className="primary-button">
              <Plus size={17} /> New request
            </Link>
          ) : undefined
        }
      />
      <div className="toolbar">
        <div className="tabs">
          {(employee
            ? [
                ["all", "All requests"],
                ["open", "Open"],
                ["resolved", "Resolved"],
              ]
            : [
                ["all", "All tickets"],
                ["mine", "My tickets"],
                ["unassigned", "Unassigned"],
                ["resolved", "Resolved"],
              ]
          ).map(([key, label]) => (
            <button
              className={filter === key ? "tab active" : "tab"}
              onClick={() => setFilter(key)}
              key={key}
            >
              {label}
              {key === "unassigned" && <b>1</b>}
            </button>
          ))}
        </div>
        <button className="filter-button">
          <SlidersHorizontal size={16} /> Filter
        </button>
      </div>
      <section className="panel table-panel">
        <TicketTable data={filtered} />
      </section>
    </>
  );
}
function TicketTable({ data }: { data: Ticket[] }) {
  const navigate = useNavigate();
  return (
    <div className="ticket-table">
      <div className="table-head">
        <span>Request</span>
        <span>Requester</span>
        <span>Assignee</span>
        <span>Status</span>
        <span>Updated</span>
        <span />
      </div>
      {data.map((ticket) => (
        <button
          className="table-row"
          key={ticket.id}
          onClick={() => navigate(`/ticket/${ticket.id}`)}
        >
          <div className="request-cell">
            <strong>{ticket.title}</strong>
            <small>
              HD-{ticket.id} · {getCategory(ticket.categoryId)?.name}
            </small>
          </div>
          <span>{getUser(ticket.requesterId)?.name}</span>
          <span>
            {ticket.assigneeId ? (
              getUser(ticket.assigneeId)?.name
            ) : (
              <em className="unassigned">Unassigned</em>
            )}
          </span>
          <StatusBadge status={ticket.status} />
          <span className="updated">{ticket.updatedAt}</span>
          <MoreHorizontal size={17} />
        </button>
      ))}
    </div>
  );
}
function NewRequest({ sessionUser }: { sessionUser: User }) {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const category = getCategory(sessionUser.categoryId);
  return (
    <>
      <PageHeading
        eyebrow="Employee portal"
        title="Submit a new request"
        subtitle={`Your request will be routed to ${category?.name}.`}
        action={
          <Link to="/requests" className="secondary-button">
            Back to requests
          </Link>
        }
      />
      <section className="form-panel">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
            setTimeout(() => navigate("/ticket/1048"), 500);
          }}
        >
          <label>
            What do you need help with?
            <input
              required
              placeholder="e.g. Cannot connect to the office VPN"
            />
          </label>
          <label>
            Category
            <select
              required
              value={category?.name}
              aria-label="Assigned category"
              onChange={() => undefined}
            >
              <option>{category?.name}</option>
            </select>
          </label>
          <label>
            Describe the issue
            <textarea
              required
              rows={6}
              placeholder="Include any details that might help us resolve this quickly..."
            />
          </label>
          <div className="attachment">
            <button type="button" className="secondary-button">
              <Plus size={16} /> Add attachment
            </button>
            <span>Optional · PNG, JPG or PDF up to 10MB</span>
          </div>
          <div className="form-actions">
            <Link to="/requests" className="text-link">
              Cancel
            </Link>
            <button className="primary-button" type="submit">
              {sent ? "Request sent" : "Submit request"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
function TicketDetail({
  role,
  sessionUser,
}: {
  role: Role;
  sessionUser: User;
}) {
  const { id } = useParams();
  const scoped = getTicketsForSession(sessionUser);
  const ticket =
    scoped.find((item) => item.id === Number(id)) || scoped[0] || tickets[0];
  const staff = role !== "employee";
  const [status, setStatus] = useState(ticket.status);
  const [comment, setComment] = useState("");
  const author = getUser(ticket.requesterId);
  const navigate = useNavigate();
  return (
    <>
      <button className="back-link" onClick={() => navigate(-1)}>
        Back
      </button>
      <div className="detail-layout">
        <div>
          <div className="detail-title">
            <div>
              <div className="ticket-id">
                HD-{ticket.id} <span>·</span>{" "}
                {getCategory(ticket.categoryId)?.name}
              </div>
              <h1>{ticket.title}</h1>
            </div>
            <StatusBadge status={status} />
          </div>
          <section className="panel description-panel">
            <div className="requester-line">
              <div className="avatar avatar-orange">{author?.initials}</div>
              <div>
                <strong>{author?.name}</strong>
                <span>Submitted {ticket.createdAt}</span>
              </div>
            </div>
            <p>{ticket.description}</p>
          </section>
          <section className="conversation">
            <div className="section-title">
              <h2>Conversation</h2>
              <span>Visible to requester</span>
            </div>
            {conversations
              .filter(
                (item) =>
                  item.ticketId === ticket.id && (!item.internal || staff),
              )
              .map((item) => (
                <div
                  className={item.internal ? "message internal" : "message"}
                  key={item.id}
                >
                  <div className="avatar">
                    {getUser(item.authorId)?.initials}
                  </div>
                  <div>
                    <div className="message-meta">
                      <strong>{getUser(item.authorId)?.name}</strong>
                      {item.internal && (
                        <span className="staff-only">Staff only</span>
                      )}
                      <time>{item.createdAt}</time>
                    </div>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            <form
              className="reply-box"
              onSubmit={(event) => {
                event.preventDefault();
                setComment("");
              }}
            >
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={
                  staff
                    ? "Write a reply to the requester..."
                    : "Add a comment..."
                }
              />
              <div>
                <span>Replies are visible to the requester</span>
                <button className="primary-button" disabled={!comment.trim()}>
                  Send reply
                </button>
              </div>
            </form>
          </section>
        </div>
        <aside className="detail-sidebar">
          <div className="panel side-panel">
            <h3>Request details</h3>
            <DetailItem label="Status">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TicketStatus)
                }
                disabled={!staff}
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </DetailItem>
            <DetailItem label="Requester">
              <strong>{author?.name}</strong>
              <span>{author?.email}</span>
            </DetailItem>
            <DetailItem label="Assignee">
              <strong>
                {ticket.assigneeId
                  ? getUser(ticket.assigneeId)?.name
                  : "Unassigned"}
              </strong>
              {staff && <button className="text-link small">Reassign</button>}
            </DetailItem>
            {staff && (
              <button
                className="resolve-button"
                onClick={() => setStatus("resolved")}
              >
                <CheckCircle2 size={16} /> Mark as resolved
              </button>
            )}
          </div>
          {staff && (
            <div className="panel side-panel audit">
              <h3>
                <ShieldCheck size={16} /> Internal notes
              </h3>
              <p>Staff-only context stays private from the requester.</p>
              <button className="secondary-button full">
                Add internal note
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="detail-item">
      <label>{label}</label>
      <div>{children}</div>
    </div>
  );
}
function TeamOverview({ sessionUser }: { sessionUser: User }) {
  const scoped = getTicketsForSession(sessionUser);
  return (
    <>
      <PageHeading
        eyebrow="Management"
        title="Team overview"
        subtitle={`${getCategory(sessionUser.categoryId)?.name} category metrics`}
      />
      <div className="team-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Requests by status</h2>
              <p className="muted">Current category workload</p>
            </div>
            <button className="filter-button">
              This month <ChevronDown size={14} />
            </button>
          </div>
          <div className="bars">
            {(
              [
                ["Open", "open"],
                ["In progress", "in_progress"],
                ["Waiting", "waiting"],
                ["Resolved", "resolved"],
              ] as const
            ).map(([label, status]) => (
              <div className="bar-row" key={label}>
                <span>{label}</span>
                <div>
                  <i
                    className={`bar ${status}`}
                    style={{
                      width: `${Math.max(10, scoped.filter((t) => t.status === status).length * 25)}%`,
                    }}
                  />
                </div>
                <strong>
                  {scoped.filter((t) => t.status === status).length}
                </strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel metric-panel">
          <p className="eyebrow">Average first response</p>
          <strong>1h 42m</strong>
          <div className="metric-change">
            <span>↓ 18%</span> vs last month
          </div>
        </section>
      </div>
    </>
  );
}
function Accounts() {
  const [accountList, setAccountList] = useState(users);
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Accounts"
        subtitle="Manage access for everyone in the support workspace."
        action={
          <button className="primary-button">
            <Plus size={17} /> Add account
          </button>
        }
      />
      <section className="panel table-panel accounts">
        <div className="panel-heading">
          <div>
            <h2>All accounts</h2>
            <p className="muted">
              {accountList.length} people in this workspace
            </p>
          </div>
          <button className="filter-button">
            <Search size={16} /> Search
          </button>
        </div>
        <div className="account-list">
          {accountList.map((user) => (
            <div className="account-row" key={user.id}>
              <div className="agent">
                <div className="avatar avatar-purple">{user.initials}</div>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <select defaultValue={user.role}>
                <option value="employee">Employee</option>
                <option value="agent">Support agent</option>
                <option value="manager">Manager</option>
              </select>
              <span className="active-pill">
                {user.active ? "Active" : "Inactive"}
              </span>
              <button
                className="icon-button"
                onClick={() =>
                  setAccountList(
                    accountList.map((item) =>
                      item.id === user.id
                        ? { ...item, active: !item.active }
                        : item,
                    ),
                  )
                }
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
function SettingsPage() {
  const [list, setList] = useState(categories);
  const [newCategory, setNewCategory] = useState("");
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Settings"
        subtitle="Manage request categories."
      />
      <section className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <h2>Request categories</h2>
            <p className="muted">
              Each authenticated session is assigned one category.
            </p>
          </div>
          <Settings size={19} />
        </div>
        <div className="category-list">
          {list.map((category) => (
            <div className="category-row" key={category.id}>
              <span className="category-dot" />
              {category.name}
              <button
                className="icon-button"
                onClick={() =>
                  setList(list.filter((item) => item.id !== category.id))
                }
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <form
          className="add-category"
          onSubmit={(event) => {
            event.preventDefault();
            if (newCategory.trim()) {
              setList([...list, { id: Date.now(), name: newCategory.trim() }]);
              setNewCategory("");
            }
          }}
        >
          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Add a category"
          />
          <button className="secondary-button" type="submit">
            <Plus size={16} /> Add category
          </button>
        </form>
      </section>
    </>
  );
}
