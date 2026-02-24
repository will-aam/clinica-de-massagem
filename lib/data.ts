// In-memory data store for the clinic management app
// In production, this would be backed by Prisma + a real database

export interface Admin {
  id: string
  email: string
  password: string
}

export interface Client {
  id: string
  name: string
  cpf: string
  phone_whatsapp: string
  created_at: string
}

export interface Package {
  id: string
  client_id: string
  total_sessions: number
  used_sessions: number
  active: boolean
  created_at: string
}

export interface CheckIn {
  id: string
  client_id: string
  package_id: string
  date_time: string
}

// Mock data
const admins: Admin[] = [
  { id: "1", email: "admin@serenita.com", password: "123456" },
]

const clients: Client[] = [
  { id: "1", name: "Maria Silva", cpf: "123.456.789-00", phone_whatsapp: "(11) 99999-0001", created_at: "2025-12-01T10:00:00Z" },
  { id: "2", name: "Ana Oliveira", cpf: "234.567.890-11", phone_whatsapp: "(11) 99999-0002", created_at: "2025-12-10T14:00:00Z" },
  { id: "3", name: "Carla Santos", cpf: "345.678.901-22", phone_whatsapp: "(11) 99999-0003", created_at: "2026-01-05T09:00:00Z" },
  { id: "4", name: "Juliana Costa", cpf: "456.789.012-33", phone_whatsapp: "(11) 99999-0004", created_at: "2026-01-15T11:00:00Z" },
  { id: "5", name: "Fernanda Lima", cpf: "567.890.123-44", phone_whatsapp: "(11) 99999-0005", created_at: "2026-02-01T08:00:00Z" },
]

const packages: Package[] = [
  { id: "1", client_id: "1", total_sessions: 10, used_sessions: 4, active: true, created_at: "2025-12-01T10:00:00Z" },
  { id: "2", client_id: "2", total_sessions: 10, used_sessions: 10, active: false, created_at: "2025-12-10T14:00:00Z" },
  { id: "3", client_id: "3", total_sessions: 5, used_sessions: 3, active: true, created_at: "2026-01-05T09:00:00Z" },
  { id: "4", client_id: "4", total_sessions: 10, used_sessions: 8, active: true, created_at: "2026-01-15T11:00:00Z" },
  { id: "5", client_id: "5", total_sessions: 10, used_sessions: 1, active: true, created_at: "2026-02-01T08:00:00Z" },
]

const checkIns: CheckIn[] = [
  { id: "1", client_id: "1", package_id: "1", date_time: "2026-02-20T09:00:00Z" },
  { id: "2", client_id: "1", package_id: "1", date_time: "2026-02-21T10:00:00Z" },
  { id: "3", client_id: "3", package_id: "3", date_time: "2026-02-21T14:00:00Z" },
  { id: "4", client_id: "4", package_id: "4", date_time: "2026-02-22T11:00:00Z" },
  { id: "5", client_id: "1", package_id: "1", date_time: "2026-02-23T09:00:00Z" },
  { id: "6", client_id: "5", package_id: "5", date_time: "2026-02-24T08:30:00Z" },
  { id: "7", client_id: "4", package_id: "4", date_time: "2026-02-24T10:00:00Z" },
  { id: "8", client_id: "1", package_id: "1", date_time: "2026-02-24T11:00:00Z" },
  { id: "9", client_id: "3", package_id: "3", date_time: "2026-02-24T14:00:00Z" },
]

// Data access functions
export function getAdminByEmail(email: string): Admin | undefined {
  return admins.find(a => a.email === email)
}

export function getAllClients(): Client[] {
  return [...clients]
}

export function getClientById(id: string): Client | undefined {
  return clients.find(c => c.id === id)
}

export function getClientByCpf(cpf: string): Client | undefined {
  return clients.find(c => c.cpf === cpf)
}

export function getActivePackageForClient(clientId: string): Package | undefined {
  return packages.find(p => p.client_id === clientId && p.active)
}

export function getPackagesForClient(clientId: string): Package[] {
  return packages.filter(p => p.client_id === clientId)
}

export function getCheckInsForClient(clientId: string): CheckIn[] {
  return checkIns.filter(ci => ci.client_id === clientId).sort((a, b) =>
    new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
  )
}

export function getCheckInsForPackage(packageId: string): CheckIn[] {
  return checkIns.filter(ci => ci.package_id === packageId)
}

export function getAllCheckIns(): CheckIn[] {
  return [...checkIns].sort((a, b) =>
    new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
  )
}

export function getTodayCheckIns(): CheckIn[] {
  const today = new Date().toISOString().split("T")[0]
  return checkIns.filter(ci => ci.date_time.startsWith(today))
}

export function getActiveClientsCount(): number {
  const activeClientIds = new Set(packages.filter(p => p.active).map(p => p.client_id))
  return activeClientIds.size
}

export function getPackagesEndingSoon(): Package[] {
  return packages.filter(p => p.active && (p.total_sessions - p.used_sessions) <= 2)
}

export function createClient(data: { name: string; cpf: string; phone_whatsapp: string; total_sessions: number }): Client {
  const newClient: Client = {
    id: String(clients.length + 1),
    name: data.name,
    cpf: data.cpf,
    phone_whatsapp: data.phone_whatsapp,
    created_at: new Date().toISOString(),
  }
  clients.push(newClient)

  const newPackage: Package = {
    id: String(packages.length + 1),
    client_id: newClient.id,
    total_sessions: data.total_sessions,
    used_sessions: 0,
    active: true,
    created_at: new Date().toISOString(),
  }
  packages.push(newPackage)

  return newClient
}

export function addPackageToClient(clientId: string, totalSessions: number): Package {
  // Deactivate existing active packages
  packages.forEach(p => {
    if (p.client_id === clientId && p.active) {
      p.active = false
    }
  })

  const newPackage: Package = {
    id: String(packages.length + 1),
    client_id: clientId,
    total_sessions: totalSessions,
    used_sessions: 0,
    active: true,
    created_at: new Date().toISOString(),
  }
  packages.push(newPackage)
  return newPackage
}

export function performCheckIn(cpf: string): { success: boolean; client?: Client; package_info?: Package; error?: string } {
  const client = getClientByCpf(cpf)
  if (!client) {
    return { success: false, error: "CPF_NOT_FOUND" }
  }

  const activePackage = getActivePackageForClient(client.id)
  if (!activePackage) {
    return { success: false, error: "NO_ACTIVE_PACKAGE" }
  }

  if (activePackage.used_sessions >= activePackage.total_sessions) {
    return { success: false, error: "PACKAGE_EXHAUSTED" }
  }

  activePackage.used_sessions += 1

  const newCheckIn: CheckIn = {
    id: String(checkIns.length + 1),
    client_id: client.id,
    package_id: activePackage.id,
    date_time: new Date().toISOString(),
  }
  checkIns.push(newCheckIn)

  if (activePackage.used_sessions >= activePackage.total_sessions) {
    activePackage.active = false
  }

  return { success: true, client, package_info: activePackage }
}

export function deleteClient(id: string): boolean {
  const index = clients.findIndex(c => c.id === id)
  if (index === -1) return false
  clients.splice(index, 1)
  // Remove associated packages and check-ins
  const pkgIds = packages.filter(p => p.client_id === id).map(p => p.id)
  for (let i = packages.length - 1; i >= 0; i--) {
    if (packages[i].client_id === id) packages.splice(i, 1)
  }
  for (let i = checkIns.length - 1; i >= 0; i--) {
    if (pkgIds.includes(checkIns[i].package_id)) checkIns.splice(i, 1)
  }
  return true
}
