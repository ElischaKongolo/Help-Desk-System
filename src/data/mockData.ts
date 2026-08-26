export type Role = 'employee' | 'agent' | 'manager'
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved'

export type User = {
  id: number
  name: string
  email: string
  role: Role
  categoryId: number | null
  active: boolean
  initials: string
}

export type Category = { id: number; name: string }
export type Ticket = {
  id: number
  title: string
  description: string
  categoryId: number
  status: TicketStatus
  requesterId: number
  assigneeId: number | null
  createdAt: string
  updatedAt: string
}
export type Conversation = { id: number; ticketId: number; authorId: number; body: string; createdAt: string; internal?: boolean }

export const currentUser: User = { id: 1, name: 'Alicia Morgan', email: 'alicia.morgan@northstar.co', role: 'manager', categoryId: null, active: true, initials: 'AM' }

export const users: User[] = [
  currentUser,
  { id: 2, name: 'Marcus Chen', email: 'marcus.chen@northstar.co', role: 'agent', categoryId: null, active: true, initials: 'MC' },
  { id: 3, name: 'Priya Shah', email: 'priya.shah@northstar.co', role: 'agent', categoryId: null, active: true, initials: 'PS' },
  { id: 4, name: 'Daniel Reed', email: 'daniel.reed@northstar.co', role: 'employee', categoryId: 4, active: true, initials: 'DR' },
  { id: 5, name: 'Maya Okafor', email: 'maya.okafor@northstar.co', role: 'employee', categoryId: 3, active: true, initials: 'MO' },
]

export const categories: Category[] = [
  { id: 1, name: 'Hardware' }, { id: 2, name: 'Software' }, { id: 3, name: 'Access & accounts' }, { id: 4, name: 'Network' },
]

export const tickets: Ticket[] = [
  { id: 1048, title: 'VPN access drops every morning', description: 'My VPN connection disconnects around 9:00am every day. Reconnecting works, but I lose access to the shared drive for a few minutes.', categoryId: 4, status: 'in_progress', requesterId: 4, assigneeId: 2, createdAt: 'Today, 08:42', updatedAt: 'Today, 09:18' },
  { id: 1047, title: 'Request access to Figma workspace', description: 'I have joined the brand team and need access to the Northstar Figma workspace to review the latest campaign files.', categoryId: 3, status: 'waiting', requesterId: 5, assigneeId: 3, createdAt: 'Yesterday, 16:20', updatedAt: 'Yesterday, 17:05' },
  { id: 1046, title: 'Laptop camera not detected', description: 'The camera is not appearing in Zoom or Teams after the latest system update.', categoryId: 1, status: 'open', requesterId: 4, assigneeId: null, createdAt: 'Yesterday, 14:12', updatedAt: 'Yesterday, 14:12' },
  { id: 1045, title: 'Install Adobe Creative Cloud', description: 'Please install Creative Cloud on my replacement MacBook.', categoryId: 2, status: 'resolved', requesterId: 5, assigneeId: 2, createdAt: 'Mon, 11:36', updatedAt: 'Tue, 10:14' },
  { id: 1044, title: 'Shared drive permission error', description: 'I get a permission error when opening the Finance shared drive.', categoryId: 3, status: 'resolved', requesterId: 4, assigneeId: 3, createdAt: 'Mon, 09:02', updatedAt: 'Mon, 15:40' },
]

export const conversations: Conversation[] = [
  { id: 1, ticketId: 1048, authorId: 4, body: 'The VPN is dropping around 9am each day. It happened again this morning.', createdAt: 'Today, 08:42' },
  { id: 2, ticketId: 1048, authorId: 2, body: 'Thanks Daniel. I am checking the gateway logs and will update you shortly.', createdAt: 'Today, 09:18' },
  { id: 3, ticketId: 1048, authorId: 2, body: 'The morning authentication spike is causing the disconnect. I am applying a client profile update.', createdAt: 'Today, 09:24', internal: true },
  { id: 4, ticketId: 1047, authorId: 5, body: 'I need this before the campaign review tomorrow, thank you!', createdAt: 'Yesterday, 16:20' },
]

export const getUser = (id: number | null) => users.find((user) => user.id === id)
export const getCategory = (id: number | null) => id === null ? undefined : categories.find((category) => category.id === id)
export function registerUser(name: string, email: string, categoryId: number | null, role: Role): User {
  const normalizedEmail = email.trim().toLowerCase()
  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) throw new Error('An account with this email already exists.')
  const id = Math.max(...users.map((user) => user.id)) + 1
  const user: User = { id, name: name.trim(), email: normalizedEmail, role, categoryId, active: true, initials: name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() }
  users.push(user)
  return user
}
export const getTicketsForSession = (user: User) => {
  const categoryTickets = user.categoryId === null ? tickets : tickets.filter((ticket) => ticket.categoryId === user.categoryId)
  return user.role === 'employee' ? categoryTickets.filter((ticket) => ticket.requesterId === user.id) : categoryTickets
}
