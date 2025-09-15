export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  MANAGER = 'Manager',
  CEO = 'CEO',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  managerId?: string;
  teamMemberIds?: string[];
  level: string;
  department: string;
  doj: string;
}

export enum BscStatus {
  DRAFT = 'Draft',
  PENDING_MANAGER = 'Pending Manager Approval',
  QUERIED_BY_MANAGER = 'Queried by Manager',
  REJECTED_BY_MANAGER = 'Rejected by Manager',
  PENDING_CEO = 'Pending CEO Approval',
  REJECTED_BY_CEO = 'Rejected by CEO',
  APPROVED = 'Approved',
}

export interface Kpi {
  id: string;
  resultKpi: string;
  processKpi: string;
  uom: string;
  definition: string;
  fom: string;
  baseLevel: string;
  target: string;
  initiatives: string;
}

export interface Kra {
  id: string;
  name: string;
  weightage: number;
  kpiOwner: string;
  kpis: Kpi[];
}

export interface BscPerspective {
  id: string;
  name: string;
  kra: Kra;
}

export interface Bsc {
  id: string;
  userId: string;
  userName: string;
  userLevel: string;
  userDoj: string;
  userTeam: string;
  reportingTo: string;
  date: string;
  status: BscStatus;
  perspectives: BscPerspective[];
  managerComments?: string;
  ceoComments?: string;
  history: {
    status: BscStatus;
    timestamp: string;
    actor: string;
    comments?: string;
  }[];
}