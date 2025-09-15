import { User, UserRole, Bsc, BscStatus, BscPerspective } from './types.ts';

const USERS_KEY = 'bsc_app_users';
const BSCS_KEY = 'bsc_app_bscs';

const initialUsers: User[] = [
  { id: '1', name: 'Saurabh', role: UserRole.USER, managerId: '2', level: 'IT Op Ex', department: 'IT Development', doj: '2022-01-10' },
  { id: '2', name: 'Deepak Gaba', role: UserRole.MANAGER, teamMemberIds: ['1'], level: 'Manager', department: 'IT Development', doj: '2020-05-15' },
  { id: '3', name: 'Admin User', role: UserRole.ADMIN, level: 'System Admin', department: 'Administration', doj: '2019-01-01' },
  { id: '4', name: 'Mr. CEO', role: UserRole.CEO, level: 'CEO', department: 'Executive', doj: '2018-01-01' },
];

const initialBscs: Bsc[] = [
  {
    id: 'bsc1',
    userId: '1',
    userName: 'Saurabh',
    userLevel: 'IT Op Ex',
    userDoj: '2022-01-10',
    userTeam: 'Digital Op Ex IT Infra',
    reportingTo: 'Deepak Gaba',
    date: '2025-06-26',
    status: BscStatus.PENDING_MANAGER,
    perspectives: [
      { id: 'p1', name: 'Finance', kra: { id: 'kra1', name: 'IT Operation Cost optimisation', weightage: 20, kpiOwner: 'Saurabh', kpis: [
        { id: 'kpi1', resultKpi: 'Hardware Cost Optimisation', processKpi: 'Hardware Procurement and Repair and Maintenance Savings', uom: 'INR', definition: 'Savings INR', fom: 'Monthly', baseLevel: '0', target: '70000', initiatives: 'Signature Automation across Company'},
        { id: 'kpi2', resultKpi: 'Software Cost Optimisation', processKpi: 'Software Procurement and Repair and Maintenance Savings', uom: 'INR', definition: 'Savings INR', fom: 'Monthly', baseLevel: '0', target: '50000', initiatives: 'QMS Complete Automation Including Billing'},
      ]}},
      { id: 'p2', name: 'Customer', kra: { id: 'kra2', name: 'IT Complaince', weightage: 20, kpiOwner: 'Saurabh', kpis: [
        { id: 'kpi3', resultKpi: 'DBMS', processKpi: 'On Prem and Cloud Storage Management', uom: 'Hours', definition: 'IT Library', fom: 'Monthly', baseLevel: '0', target: '576 Hours', initiatives: 'Tickting Tool Migration -Cost Saving'},
      ]}},
      { id: 'p3', name: 'Internal Process', kra: { id: 'kra3', name: 'Core IT Services & Operations', weightage: 20, kpiOwner: 'Saurabh', kpis: [
        { id: 'kpi4', resultKpi: 'Hardware Management', processKpi: 'Hardware\'s Maintenance/Inventory & Troubleshooting', uom: '% OT', definition: 'IT Library', fom: 'Monthly', baseLevel: '0', target: '100%', initiatives: 'ITAM Improvement & New Features to be added'},
        { id: 'kpi5', resultKpi: 'Software Management', processKpi: 'Software\'s Maintenance/Inventory & Troubleshooting', uom: '% OT', definition: 'IT Library', fom: 'Monthly', baseLevel: '0', target: '100%', initiatives: ''},
      ]}},
      { id: 'p4', name: 'Learning and Growth', kra: { id: 'kra4', name: 'Traning and Development', weightage: 20, kpiOwner: 'Saurabh', kpis: [
         { id: 'kpi6', resultKpi: 'Team Training- IT Policies', processKpi: 'Policies and SOP training and Implementation', uom: '% Adherence', definition: 'IT Library', fom: 'Monthly', baseLevel: '0', target: '100%', initiatives: ''},
      ]}},
      { id: 'p5', name: 'Infrastructure', kra: { id: 'kra5', name: 'Infrastructure management', weightage: 20, kpiOwner: 'Saurabh', kpis: [
        { id: 'kpi7', resultKpi: 'Data Center Uptime', processKpi: 'SLA Adherence / Power & Cooling Efficiency / Downtime Incidents', uom: '% Adherence', definition: 'IT Library', fom: 'Monthly', baseLevel: '0', target: '100%', initiatives: ''},
      ]}},
    ],
    history: [{ status: BscStatus.DRAFT, timestamp: new Date().toISOString(), actor: 'Saurabh' }, { status: BscStatus.PENDING_MANAGER, timestamp: new Date().toISOString(), actor: 'Saurabh' }],
  }
];

let users: User[] = [];
let bscs: Bsc[] = [];

const loadState = () => {
    try {
        const storedUsers = localStorage.getItem(USERS_KEY);
        const storedBscs = localStorage.getItem(BSCS_KEY);
        if (storedUsers && storedBscs) {
            users = JSON.parse(storedUsers);
            bscs = JSON.parse(storedBscs);
        } else {
            users = initialUsers;
            bscs = initialBscs;
            saveState();
        }
    } catch (e) {
        console.error("Failed to load state from localStorage", e);
        users = initialUsers;
        bscs = initialBscs;
    }
};

const saveState = () => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(BSCS_KEY, JSON.stringify(bscs));
    } catch (e) {
        console.error("Failed to save state to localStorage", e);
    }
};

loadState();


const api = {
  getUsers: async (): Promise<User[]> => Promise.resolve(users),
  getUserById: async (id: string): Promise<User | undefined> => Promise.resolve(users.find(u => u.id === id)),
  
  getBscs: async (): Promise<Bsc[]> => Promise.resolve(bscs),
  getBscById: async (id: string): Promise<Bsc | undefined> => Promise.resolve(bscs.find(b => b.id === id)),
  
  getBscsByUserId: async (userId: string): Promise<Bsc[]> => Promise.resolve(bscs.filter(b => b.userId === userId)),
  
  getBscsForManager: async (managerId: string): Promise<Bsc[]> => {
    const manager = users.find(u => u.id === managerId);
    if (!manager || !manager.teamMemberIds) return Promise.resolve([]);
    return Promise.resolve(bscs.filter(b => manager.teamMemberIds?.includes(b.userId)));
  },

  createBsc: async (bscData: Omit<Bsc, 'id' | 'history'>, user: User): Promise<Bsc> => {
    const newBsc: Bsc = {
      ...bscData,
      id: `bsc${Date.now()}`,
      history: [{ status: bscData.status, timestamp: new Date().toISOString(), actor: user.name }]
    };
    bscs.push(newBsc);
    saveState();
    return Promise.resolve(newBsc);
  },

  updateBsc: async (bscId: string, bscData: Bsc, actor: User): Promise<Bsc> => {
    const bscIndex = bscs.findIndex(b => b.id === bscId);
    if (bscIndex === -1) throw new Error('BSC not found');
    
    const oldBsc = bscs[bscIndex];
    if (oldBsc.status !== bscData.status) {
      bscData.history.push({
        status: bscData.status,
        timestamp: new Date().toISOString(),
        actor: actor.name,
        comments: bscData.status.includes('Rejected') ? bscData.managerComments || bscData.ceoComments : undefined
      });
    }

    bscs[bscIndex] = { ...bscs[bscIndex], ...bscData };
    saveState();
    return Promise.resolve(bscs[bscIndex]);
  },

  updateUser: async (userData: User): Promise<User> => {
    const userIndex = users.findIndex(u => u.id === userData.id);
    if (userIndex === -1) throw new Error("User not found");
    users[userIndex] = userData;
    saveState();
    return Promise.resolve(users[userIndex]);
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = { ...userData, id: `user${Date.now()}` };
    users.push(newUser);
    saveState();
    return Promise.resolve(newUser);
  },

  deleteUser: async (userId: string): Promise<void> => {
    users = users.filter(u => u.id !== userId);
    saveState();
    return Promise.resolve();
  }
};

export default api;
