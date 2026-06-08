
import { User, UserRole, Software, ElectronicsItem, Subscription, License, PlanType, AuthResponse, CompanySettings, ContactMessage, Coupon, CartItem, Order, OrderStatus, DownloadRecord, Job, NewsUpdate, Tool, BusinessPlan, SystemSettings, FeatureFlag, CustomRole } from '../types';

// Initial Mock Data
const INITIAL_SOFTWARE: Software[] = [
  {
    id: 'sw-1',
    name: 'DevStudio Pro',
    version: '2024.1',
    description: 'The ultimate IDE for web developers. Includes AI code completion and cloud sync.',
    priceMonthly: 1299,
    priceYearly: 12999,
    fileUrl: 'https://cdn.rstechlab.com/builds/devstudio-2024.1.exe',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    category: 'Development',
    platform: 'Cross-Platform',
    fileSize: '1.2 GB',
    requirements: '8GB RAM, 4 Core CPU'
  },
  {
    id: 'sw-2',
    name: 'SecureGuard Antivirus',
    version: '5.0.2',
    description: 'Enterprise-grade security for your endpoints. Real-time threat detection.',
    priceMonthly: 749,
    priceYearly: 7499,
    fileUrl: 'https://cdn.rstechlab.com/builds/secureguard-5.0.2.msi',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    category: 'Security',
    platform: 'Windows',
    fileSize: '450 MB',
    requirements: 'Windows 10/11, 4GB RAM'
  },
  {
    id: 'sw-3',
    name: 'PixelMaster AI',
    version: '3.5',
    description: 'AI-powered image editing suite. Remove backgrounds and upscale in seconds.',
    priceMonthly: 2399,
    priceYearly: 23999,
    fileUrl: 'https://cdn.rstechlab.com/builds/pixelmaster-3.5.dmg',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    category: 'Design',
    platform: 'MacOS',
    fileSize: '2.8 GB',
    requirements: 'MacOS Ventura+, M1 Chip or better'
  }
];

const INITIAL_ELECTRONICS: ElectronicsItem[] = [
    { id: 'el-1', name: "IoT Starter Kit", price: 3999, image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=400&q=80", category: "Development", stock: 15, description: "Complete kit for beginners." },
    { id: 'el-2', name: "Raspberry Pi 5", price: 6999, image: "https://images.unsplash.com/photo-1629739884942-8678d138dd64?auto=format&fit=crop&w=400&q=80", category: "Boards", stock: 42, description: "Latest generation microcomputer." },
    { id: 'el-3', name: "Arduino Uno R3", price: 2199, image: "https://images.unsplash.com/photo-1558002038-1091a166111c?auto=format&fit=crop&w=400&q=80", category: "Microcontrollers", stock: 100, description: "Standard microcontroller board." },
    { id: 'el-4', name: "OLED Display Module", price: 999, image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80", category: "Components", stock: 200, description: "0.96 inch I2C OLED." },
    { id: 'el-5', name: "Smart Sensor Pack", price: 2799, image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80", category: "Sensors", stock: 30, description: "Temperature, humidity, and motion sensors." },
    { id: 'el-6', name: "Robot Arm Kit", price: 9999, image: "https://images.unsplash.com/photo-1535376435256-b5f7477eb2ac?auto=format&fit=crop&w=400&q=80", category: "Robotics", stock: 5, description: "Programmable 4-DOF robot arm." }
];

const INITIAL_SETTINGS: CompanySettings = {
  address: "39, Mahaveer Colony 1, Kartarpura, Jaipur, India",
  email: "rohitsaini470021@gmail.com",
  phone: "+91 6350256169",
  hours: "Mon-Fri from 9am to 6pm"
};

const INITIAL_COUPONS: Coupon[] = [
    {
        id: 'cpn-1',
        code: 'RSTECH20',
        discountType: 'PERCENTAGE',
        value: 20,
        targetType: 'ALL',
        usedCount: 15
    },
    {
        id: 'cpn-2',
        code: 'ELEC200',
        discountType: 'FIXED',
        value: 200,
        targetType: 'ELECTRONICS',
        usedCount: 5,
        expiryDate: '2025-12-31'
    }
];

const INITIAL_JOBS: Job[] = [
    {
      id: 'job-1',
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote / Jaipur",
      type: "Full-time",
      tags: ["React", "Node.js", "TypeScript"],
      isActive: true
    },
    {
      id: 'job-2',
      title: "Product Designer (UI/UX)",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      tags: ["Figma", "Design Systems"],
      isActive: true
    },
    {
      id: 'job-3',
      title: "DevOps Specialist",
      department: "Infrastructure",
      location: "Bangalore",
      type: "Full-time",
      tags: ["AWS", "Docker", "Kubernetes"],
      isActive: true
    }
];

const INITIAL_UPDATES: NewsUpdate[] = [
    {
      id: 'update-1',
      title: "AI-Powered Analytics Suite",
      description: "Get deep insights into your software performance with our new dashboard. Now featuring predictive scaling and anomaly detection.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      tag: "New Release",
      date: new Date().toISOString()
    },
    {
      id: 'update-2',
      title: "IoT Control Center v2.0",
      description: "Manage all your connected devices from a single, unified interface. Enhanced protocol support for Zigbee and Matter.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      tag: "Major Update",
      date: new Date().toISOString()
    },
    {
      id: 'update-3',
      title: "Cloud Security Shield",
      description: "Enterprise-grade protection for your cloud infrastructure. Zero-trust architecture implementation guide included.",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      tag: "Feature Spotlight",
      date: new Date().toISOString()
    },
    {
      id: 'update-4',
      title: "Global Developer Conference",
      description: "Join us in San Francisco or online for 3 days of workshops, keynotes, and networking with industry leaders.",
      image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1200&q=80",
      tag: "Event",
      date: new Date().toISOString()
    },
    {
      id: 'update-5',
      title: "Sustainable Tech Initiative",
      description: "Our commitment to carbon-neutral data centers and eco-friendly hardware packaging starts today.",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
      tag: "Announcement",
      date: new Date().toISOString()
    }
];

const INITIAL_TOOLS: Tool[] = [
  {
    id: 'tool-1',
    name: 'File Transfer',
    description: 'Secure, encrypted peer-to-peer file transfer powered by WebRTC. Directly transmit files browser-to-browser with no size limits or cloud latency.',
    icon: 'Wifi',
    category: 'Network & P2P',
    url: 'https://transfer.rstechlab.com',
    status: 'ACTIVE',
    featured: true,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z',
    clicks: 341,
    loginRequired: false,
    premiumRequired: false,
    allowedPlans: ['Free Plan', 'Starter Plan', 'Premium Plan', 'Business Plan', 'Enterprise Plan']
  },
  {
    id: 'tool-2',
    name: 'JWT Decoder & Validator',
    description: 'Deconstruct and decode JSON Web Tokens on-the-fly. Instantly check signatures, evaluate token structures, and inspect claims.',
    icon: 'Shield',
    category: 'Security & Cryptography',
    url: 'https://jwt.rstechlab.com',
    status: 'ACTIVE',
    featured: true,
    createdAt: '2026-02-14T09:15:00.000Z',
    updatedAt: '2026-02-14T09:15:00.000Z',
    clicks: 198,
    loginRequired: true,
    premiumRequired: false,
    allowedPlans: ['Starter Plan', 'Premium Plan', 'Business Plan', 'Enterprise Plan']
  },
  {
    id: 'tool-3',
    name: 'HTTP Endpoint Sandbox',
    description: 'Instantly spin up mock API endpoints with custom JSON responses, response codes, delay configurations, and simulated authentication systems.',
    icon: 'Terminal',
    category: 'Developer Utilities',
    url: 'https://sandbox.rstechlab.com',
    status: 'ACTIVE',
    featured: false,
    createdAt: '2026-02-28T14:30:00.000Z',
    updatedAt: '2026-02-28T14:30:00.000Z',
    clicks: 145,
    loginRequired: false,
    premiumRequired: false,
    allowedPlans: ['Free Plan', 'Starter Plan', 'Premium Plan', 'Business Plan', 'Enterprise Plan']
  },
  {
    id: 'tool-4',
    name: 'Neural Weight Evaluator',
    description: 'Model prompt exploration suite for stable diffusion and LLM weight fine-tuning. Evaluate output matrices and generate code presets.',
    icon: 'Sparkles',
    category: 'AI & Data Science',
    url: 'https://ai.rstechlab.com',
    status: 'ACTIVE',
    featured: true,
    createdAt: '2026-03-05T08:00:00.000Z',
    updatedAt: '2026-03-05T08:00:00.000Z',
    clicks: 582,
    loginRequired: true,
    premiumRequired: true,
    allowedPlans: ['Premium Plan', 'Business Plan', 'Enterprise Plan']
  },
  {
    id: 'tool-5',
    name: 'Fluid Markdown Compiler',
    description: 'Distraction-free rich markdown editor featuring side-by-side live compilation, responsive CSS injection, and automated storage integrations.',
    icon: 'FileText',
    category: 'Developer Utilities',
    url: 'https://md.rstechlab.com',
    status: 'ACTIVE',
    featured: false,
    createdAt: '2026-03-12T16:45:00.000Z',
    updatedAt: '2026-03-12T16:45:00.000Z',
    clicks: 76,
    loginRequired: false,
    premiumRequired: false,
    allowedPlans: ['Free Plan', 'Starter Plan', 'Premium Plan', 'Business Plan', 'Enterprise Plan']
  }
];

const INITIAL_PLANS: BusinessPlan[] = [
  {
    id: 'plan-free',
    name: 'Free Plan',
    priceMonthly: 0,
    priceLifetime: 0,
    transferLimit: 10,
    storageLimit: '2 GB',
    toolAccess: ['tool-1', 'tool-3', 'tool-5'],
    premiumFeatures: ['P2P File Transfer', 'Public Sandbox Access', 'Decentralized Channels'],
    trialDays: 0,
    status: 'ACTIVE'
  },
  {
    id: 'plan-starter',
    name: 'Starter Plan',
    priceMonthly: 499,
    priceLifetime: 4999,
    transferLimit: 50,
    storageLimit: '10 GB',
    toolAccess: ['tool-1', 'tool-2', 'tool-3', 'tool-5'],
    premiumFeatures: ['P2P File Transfer', 'JWT Utility Validator', 'Support Link Sandbox', 'Premium Bandwidth Layer'],
    trialDays: 7,
    status: 'ACTIVE'
  },
  {
    id: 'plan-premium',
    name: 'Premium Plan',
    priceMonthly: 9,
    priceLifetime: 99,
    transferLimit: 200,
    storageLimit: '50 GB',
    toolAccess: ['tool-1', 'tool-2', 'tool-3', 'tool-4', 'tool-5'],
    premiumFeatures: ['Neural Weight Evaluator', 'Unlimited Concurrent Tunnels', 'Full-Chain JWT Verification', 'Dedicated Support Hotline'],
    trialDays: 14,
    status: 'ACTIVE'
  },
  {
    id: 'plan-business',
    name: 'Business Plan',
    priceMonthly: 2499,
    priceLifetime: 24999,
    transferLimit: 1000,
    storageLimit: '250 GB',
    toolAccess: ['tool-1', 'tool-2', 'tool-3', 'tool-4', 'tool-5'],
    premiumFeatures: ['Corporate Multi-User Licensing', 'Custom Subdomain Routing', 'Dedicated GPU Matrices', 'Service-Level SLA Guarantees'],
    trialDays: 30,
    status: 'ACTIVE'
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Plan',
    priceMonthly: 4999,
    priceLifetime: 49999,
    transferLimit: 99999,
    storageLimit: 'Unlimited',
    toolAccess: ['tool-1', 'tool-2', 'tool-3', 'tool-4', 'tool-5'],
    premiumFeatures: ['Full White-Label Branding', 'Dedicated Ingress Controller', 'Direct Firebase DB Bridges', 'Custom BLE Gateway Access'],
    trialDays: 30,
    status: 'ACTIVE'
  }
];

const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  siteName: 'RSTechLab',
  branding: 'Cyberpunk Teal',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
  themeColor: 'cyan',
  contactEmail: 'rohitsaini470021@gmail.com',
  supportLink: 'https://docs.rstechlab.com',
  maintenanceMode: false,
  registrationEnabled: true,
  loginEnabled: true,
  defaultPlanId: 'plan-free'
};

const INITIAL_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'ff-1', name: 'File Transfer Module', key: 'file_transfer', enabled: true, description: 'Client-side WebRTC direct secure channels' },
  { id: 'ff-2', name: 'AI Lab Integration', key: 'ai_lab', enabled: true, description: 'Synthesizer & LLM prompt tuning' },
  { id: 'ff-3', name: 'BLE Gateway Connectivity', key: 'ble_gateway', enabled: false, description: 'Physical bluetooth device communications' },
  { id: 'ff-4', name: 'API Playground Panel', key: 'api_playground', enabled: true, description: 'In-app HTTP & webhook dynamic testing suites' },
  { id: 'ff-5', name: 'Network Lab Simulator', key: 'network_lab', enabled: true, description: 'Topology and latency visualization controllers' },
  { id: 'ff-6', name: 'Protocol Explorer Utility', key: 'protocol_explorer', enabled: false, description: 'Deconstruct TCP/UDP and BLE formats dynamically' }
];

const INITIAL_CUSTOM_ROLES: CustomRole[] = [
  { id: 'role-guest', name: 'Guest', description: 'Unauthenticated public visitors.', permissions: ['view_landing', 'view_tools'] },
  { id: 'role-user', name: 'User', description: 'Authenticated client tier.', permissions: ['view_landing', 'view_tools', 'use_free_tools'] },
  { id: 'role-premium', name: 'Premium', description: 'Paid client subscribers with high metrics.', permissions: ['view_landing', 'view_tools', 'use_free_tools', 'use_premium_tools'] },
  { id: 'role-moderator', name: 'Moderator', description: 'Staff accounts managing updates, jobs and messages.', permissions: ['view_landing', 'view_tools', 'use_free_tools', 'use_premium_tools', 'manage_content'] },
  { id: 'role-admin', name: 'Admin', description: 'System controllers with absolute authority.', permissions: ['view_landing', 'view_tools', 'use_free_tools', 'use_premium_tools', 'manage_content', 'configure_system'] }
];

const MOCK_DELAY = 600;

// Local Storage Keys
const LS_USERS = 'sh_users';
const LS_SOFTWARE = 'sh_software';
const LS_ELECTRONICS = 'sh_electronics';
const LS_SUBS = 'sh_subs';
const LS_LICENSES = 'sh_licenses';
const LS_CURRENT_USER = 'sh_current_user';
const LS_SETTINGS = 'sh_settings';
const LS_MESSAGES = 'sh_messages';
const LS_COUPONS = 'sh_coupons';
const LS_CART = 'sh_cart';
const LS_ORDERS = 'sh_orders';
const LS_DOWNLOADS = 'sh_downloads';
const LS_JOBS = 'sh_jobs';
const LS_UPDATES = 'sh_updates';
const LS_TOOLS = 'sh_tools';
const LS_PLANS = 'sh_plans';
const LS_SYSTEM_SETTINGS = 'sh_system_settings';
const LS_FEATURE_FLAGS = 'sh_feature_flags';
const LS_CUSTOM_ROLES = 'sh_custom_roles';

// Helpers
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateLicenseKey = () => 
  `${Math.random().toString(36).substr(2, 5).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

// --- IndexedDB for File Storage (To enable Real Upload/Download Cycle) ---
const DB_NAME = 'SoftwareHubDB';
const DB_VERSION = 1;
const FILE_STORE = 'files';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
        console.warn("IndexedDB not supported");
        resolve({} as IDBDatabase); 
        return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveSoftwareFile = async (softwareId: string, file: File | Blob) => {
  try {
    const db = await openDB();
    if (!db.transaction) return; // DB not opened correctly
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(FILE_STORE, 'readwrite');
        const store = tx.objectStore(FILE_STORE);
        const request = store.put(file, softwareId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
  } catch (e) {
      console.error("Failed to save file to IndexedDB", e);
  }
};

export const getSoftwareFile = async (softwareId: string): Promise<Blob | null> => {
  try {
    const db = await openDB();
    if (!db.transaction) return null;
    return new Promise((resolve, reject) => {
        const tx = db.transaction(FILE_STORE, 'readonly');
        const store = tx.objectStore(FILE_STORE);
        const request = store.get(softwareId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
  } catch (e) {
      console.error("Failed to get file from IndexedDB", e);
      return null;
  }
};


// Initialize Data if Empty
const initializeData = () => {
  if (!localStorage.getItem(LS_SOFTWARE)) {
    localStorage.setItem(LS_SOFTWARE, JSON.stringify(INITIAL_SOFTWARE));
  }
  if (!localStorage.getItem(LS_ELECTRONICS)) {
    localStorage.setItem(LS_ELECTRONICS, JSON.stringify(INITIAL_ELECTRONICS));
  }
  if (!localStorage.getItem(LS_USERS)) {
    const admin: User = { id: 'admin-1', name: 'System Admin', email: 'admin@hub.com', role: UserRole.ADMIN };
    const client: User = { id: 'client-1', name: 'John Doe', email: 'client@hub.com', role: UserRole.CLIENT };
    localStorage.setItem(LS_USERS, JSON.stringify([admin, client]));
  }
  if (!localStorage.getItem(LS_SETTINGS)) {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem(LS_COUPONS)) {
      localStorage.setItem(LS_COUPONS, JSON.stringify(INITIAL_COUPONS));
  }
  if (!localStorage.getItem(LS_JOBS)) {
      localStorage.setItem(LS_JOBS, JSON.stringify(INITIAL_JOBS));
  }
  if (!localStorage.getItem(LS_UPDATES)) {
      localStorage.setItem(LS_UPDATES, JSON.stringify(INITIAL_UPDATES));
  }
  if (!localStorage.getItem(LS_TOOLS)) {
      localStorage.setItem(LS_TOOLS, JSON.stringify(INITIAL_TOOLS));
  }
  if (!localStorage.getItem(LS_PLANS)) {
      localStorage.setItem(LS_PLANS, JSON.stringify(INITIAL_PLANS));
  }
  if (!localStorage.getItem(LS_SYSTEM_SETTINGS)) {
      localStorage.setItem(LS_SYSTEM_SETTINGS, JSON.stringify(INITIAL_SYSTEM_SETTINGS));
  }
  if (!localStorage.getItem(LS_FEATURE_FLAGS)) {
      localStorage.setItem(LS_FEATURE_FLAGS, JSON.stringify(INITIAL_FEATURE_FLAGS));
  }
  if (!localStorage.getItem(LS_CUSTOM_ROLES)) {
      localStorage.setItem(LS_CUSTOM_ROLES, JSON.stringify(INITIAL_CUSTOM_ROLES));
  }
};

initializeData();

// ... [Keep existing Auth, Settings, Contact, Software, Electronics, Cart services] ...

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await delay(MOCK_DELAY);
  const users: User[] = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
  const user = users.find(u => u.email === email);
  if (!user) throw new Error('Invalid credentials');
  localStorage.setItem(LS_CURRENT_USER, JSON.stringify(user));
  return { user, token: 'fake-jwt-token-' + generateId() };
};

export const register = async (name: string, email: string, password: string, role: UserRole = UserRole.CLIENT): Promise<AuthResponse> => {
  await delay(MOCK_DELAY);
  const users: User[] = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
  if (users.find(u => u.email === email)) throw new Error('User already exists');
  
  // Resolve default plan ID and plan name dynamically from dynamic system settings 
  const settingsObj = JSON.parse(localStorage.getItem(LS_SYSTEM_SETTINGS) || 'null') || INITIAL_SYSTEM_SETTINGS;
  const defPlanId = settingsObj.defaultPlanId || 'plan-free';
  const plansList = JSON.parse(localStorage.getItem(LS_PLANS) || '[]');
  const matchedPlan = plansList.find((p: any) => p.id === defPlanId);
  const defPlanName = matchedPlan ? matchedPlan.name : 'Free Plan';

  const newUser: User = { 
    id: generateId(), 
    name, 
    email, 
    role,
    planId: defPlanId,
    planName: defPlanName
  };
  users.push(newUser);
  localStorage.setItem(LS_USERS, JSON.stringify(users));
  localStorage.setItem(LS_CURRENT_USER, JSON.stringify(newUser));
  return { user: newUser, token: 'fake-jwt-token-' + generateId() };
};

export const updateUserPlan = async (userId: string, planId: string, planName: string): Promise<User> => {
  return updateUserProfile(userId, { planId, planName });
};

export const logout = () => {
  localStorage.removeItem(LS_CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(LS_CURRENT_USER);
  return u ? JSON.parse(u) : null;
};

export const updateUserProfile = async (id: string, updates: Partial<User>): Promise<User> => {
  await delay(MOCK_DELAY);
  let users: User[] = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');
  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  localStorage.setItem(LS_USERS, JSON.stringify(users));
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
     localStorage.setItem(LS_CURRENT_USER, JSON.stringify(updatedUser));
  }
  return updatedUser;
};

// ... Settings, Contact, Software, Electronics CRUDs ...
export const getCompanySettings = async (): Promise<CompanySettings> => {
  await delay(MOCK_DELAY);
  return JSON.parse(localStorage.getItem(LS_SETTINGS) || JSON.stringify(INITIAL_SETTINGS));
};
export const updateCompanySettings = async (settings: CompanySettings): Promise<CompanySettings> => {
  await delay(MOCK_DELAY);
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  return settings;
};
export const submitContactMessage = async (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>): Promise<void> => {
    await delay(MOCK_DELAY);
    const messages: ContactMessage[] = JSON.parse(localStorage.getItem(LS_MESSAGES) || '[]');
    const newMessage: ContactMessage = { ...msg, id: generateId(), date: new Date().toISOString(), read: false };
    messages.push(newMessage);
    localStorage.setItem(LS_MESSAGES, JSON.stringify(messages));
};
export const getContactMessages = async (): Promise<ContactMessage[]> => {
    await delay(MOCK_DELAY);
    return JSON.parse(localStorage.getItem(LS_MESSAGES) || '[]');
};
export const deleteContactMessage = async (id: string): Promise<void> => {
    await delay(MOCK_DELAY);
    let messages: ContactMessage[] = JSON.parse(localStorage.getItem(LS_MESSAGES) || '[]');
    messages = messages.filter(m => m.id !== id);
    localStorage.setItem(LS_MESSAGES, JSON.stringify(messages));
    window.dispatchEvent(new Event('messages-updated'));
};
export const getSoftware = async (): Promise<Software[]> => {
  await delay(MOCK_DELAY);
  return JSON.parse(localStorage.getItem(LS_SOFTWARE) || '[]');
};
export const addSoftware = async (software: Omit<Software, 'id'>): Promise<Software> => {
  await delay(MOCK_DELAY);
  const list: Software[] = JSON.parse(localStorage.getItem(LS_SOFTWARE) || '[]');
  const newSw = { ...software, id: generateId() };
  list.push(newSw);
  localStorage.setItem(LS_SOFTWARE, JSON.stringify(list));
  return newSw;
};
export const updateSoftware = async (id: string, updates: Partial<Software>): Promise<Software> => {
  await delay(MOCK_DELAY);
  let list: Software[] = JSON.parse(localStorage.getItem(LS_SOFTWARE) || '[]');
  const index = list.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Software not found');
  list[index] = { ...list[index], ...updates };
  localStorage.setItem(LS_SOFTWARE, JSON.stringify(list));
  return list[index];
};
export const deleteSoftware = async (id: string): Promise<void> => {
  await delay(MOCK_DELAY);
  let list: Software[] = JSON.parse(localStorage.getItem(LS_SOFTWARE) || '[]');
  list = list.filter(s => s.id !== id);
  localStorage.setItem(LS_SOFTWARE, JSON.stringify(list));
  window.dispatchEvent(new Event('software-updated'));
};
export const getElectronics = async (): Promise<ElectronicsItem[]> => {
  await delay(MOCK_DELAY);
  return JSON.parse(localStorage.getItem(LS_ELECTRONICS) || '[]');
};
export const addElectronics = async (item: Omit<ElectronicsItem, 'id'>): Promise<ElectronicsItem> => {
  await delay(MOCK_DELAY);
  const list: ElectronicsItem[] = JSON.parse(localStorage.getItem(LS_ELECTRONICS) || '[]');
  const newItem = { ...item, id: generateId() };
  list.push(newItem);
  localStorage.setItem(LS_ELECTRONICS, JSON.stringify(list));
  return newItem;
};
export const updateElectronics = async (id: string, updates: Partial<ElectronicsItem>): Promise<ElectronicsItem> => {
  await delay(MOCK_DELAY);
  let list: ElectronicsItem[] = JSON.parse(localStorage.getItem(LS_ELECTRONICS) || '[]');
  const index = list.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Item not found');
  list[index] = { ...list[index], ...updates };
  localStorage.setItem(LS_ELECTRONICS, JSON.stringify(list));
  return list[index];
};
export const deleteElectronics = async (id: string): Promise<void> => {
  await delay(MOCK_DELAY);
  let list: ElectronicsItem[] = JSON.parse(localStorage.getItem(LS_ELECTRONICS) || '[]');
  list = list.filter(s => s.id !== id);
  localStorage.setItem(LS_ELECTRONICS, JSON.stringify(list));
  window.dispatchEvent(new Event('electronics-updated'));
};

// ... Cart, Orders, Coupons, Subscriptions ...
const getCartKey = () => {
    const user = getCurrentUser();
    return user ? `${LS_CART}_${user.id}` : LS_CART;
};

export const getCart = async (): Promise<CartItem[]> => { return JSON.parse(localStorage.getItem(getCartKey()) || '[]'); };
export const addToCart = async (item: ElectronicsItem): Promise<CartItem[]> => {
    const key = getCartKey();
    let cart: CartItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    const existingIndex = cart.findIndex(c => c.id === item.id);
    if (existingIndex > -1) { cart[existingIndex].quantity += 1; } else { cart.push({ ...item, quantity: 1 }); }
    localStorage.setItem(key, JSON.stringify(cart));
    return cart;
};
export const updateCartQuantity = async (itemId: string, quantity: number): Promise<CartItem[]> => {
    const key = getCartKey();
    let cart: CartItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    const index = cart.findIndex(c => c.id === itemId);
    if (index > -1) { if (quantity <= 0) { cart.splice(index, 1); } else { cart[index].quantity = quantity; } }
    localStorage.setItem(key, JSON.stringify(cart));
    return cart;
};
export const removeFromCart = async (itemId: string): Promise<CartItem[]> => {
    const key = getCartKey();
    let cart: CartItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    cart = cart.filter(c => c.id !== itemId);
    localStorage.setItem(key, JSON.stringify(cart));
    return cart;
};
export const clearCart = async (): Promise<void> => { localStorage.removeItem(getCartKey()); };
export const createOrder = async (userId: string, userEmail: string, items: CartItem[], total: number, paymentMethod: 'PAYTM' | 'CARD', address: string): Promise<Order> => {
    await delay(MOCK_DELAY);
    
    // 1. Update Stock for Electronics
    const electronics: ElectronicsItem[] = JSON.parse(localStorage.getItem(LS_ELECTRONICS) || '[]');
    let stockUpdated = false;

    for (const item of items) {
        // Only update stock for electronics, assuming software doesn't track stock in the same way or is infinite
        // In this app, items in cart seem to be ElectronicsItem based on addToCart signature, but let's be safe
        const productIndex = electronics.findIndex(e => e.id === item.id);
        if (productIndex !== -1) {
            const currentStock = electronics[productIndex].stock || 0;
            // Decrement stock
            electronics[productIndex].stock = Math.max(0, currentStock - item.quantity);
            stockUpdated = true;
        }
    }

    if (stockUpdated) {
        localStorage.setItem(LS_ELECTRONICS, JSON.stringify(electronics));
        // Dispatch a custom event for same-tab updates if needed, though mostly for cross-tab or re-mount
        window.dispatchEvent(new Event('electronics-updated'));
    }

    const orders: Order[] = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
    const newOrder: Order = { 
        id: generateId(), 
        userId, 
        userEmail, 
        items, 
        totalAmount: total, 
        status: 'PENDING', 
        refundStatus: 'NONE',
        date: new Date().toISOString(), 
        shippingAddress: address, 
        paymentMethod, 
        paymentId: 'TXN_' + generateId().toUpperCase() 
    };
    orders.push(newOrder);
    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
    localStorage.removeItem(userId ? `${LS_CART}_${userId}` : LS_CART);
    return newOrder;
};
export const getOrders = async (): Promise<Order[]> => { await delay(MOCK_DELAY); return JSON.parse(localStorage.getItem(LS_ORDERS) || '[]'); };
export const getUserOrders = async (userId: string): Promise<Order[]> => {
    await delay(MOCK_DELAY);
    const orders: Order[] = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
    return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    await delay(MOCK_DELAY);
    const orders: Order[] = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    
    if(index !== -1) { 
        const order = orders[index];
        const electronics: ElectronicsItem[] = JSON.parse(localStorage.getItem(LS_ELECTRONICS) || '[]');
        let stockUpdated = false;
        
        // If transitioning TO Cancelled FROM a non-cancelled state, restore stock
        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
            for (const item of order.items) {
                const productIndex = electronics.findIndex(e => e.id === item.id);
                if (productIndex !== -1) {
                    electronics[productIndex].stock = (electronics[productIndex].stock || 0) + item.quantity;
                    stockUpdated = true;
                }
            }
            // Set refund status to PENDING if not already completed
            if (order.refundStatus !== 'COMPLETED') {
                order.refundStatus = 'PENDING';
            }
        }
        // If transitioning FROM Cancelled TO a non-cancelled state, reserve stock again
        else if (status !== 'CANCELLED' && order.status === 'CANCELLED') {
            for (const item of order.items) {
                const productIndex = electronics.findIndex(e => e.id === item.id);
                if (productIndex !== -1) {
                    const currentStock = electronics[productIndex].stock || 0;
                    electronics[productIndex].stock = Math.max(0, currentStock - item.quantity);
                    stockUpdated = true;
                }
            }
            // Reset refund status if it was pending
            if (order.refundStatus === 'PENDING') {
                order.refundStatus = 'NONE';
            }
        }

        if (stockUpdated) {
            localStorage.setItem(LS_ELECTRONICS, JSON.stringify(electronics));
            window.dispatchEvent(new Event('electronics-updated'));
        }

        orders[index] = order; // Update the object reference in array
        orders[index].status = status; 
        localStorage.setItem(LS_ORDERS, JSON.stringify(orders)); 
    }
};

export const processRefund = async (orderId: string): Promise<boolean> => {
    await delay(MOCK_DELAY);
    const orders: Order[] = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].refundStatus = 'COMPLETED';
        localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
        console.log(`Refund processed for order ${orderId}`);
        return true;
    } else {
        console.error(`Order ${orderId} not found for refund processing`);
        return false;
    }
};
export const getCoupons = async (): Promise<Coupon[]> => { await delay(MOCK_DELAY); return JSON.parse(localStorage.getItem(LS_COUPONS) || '[]'); };
export const addCoupon = async (coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> => {
    await delay(MOCK_DELAY);
    const list: Coupon[] = JSON.parse(localStorage.getItem(LS_COUPONS) || '[]');
    const newCoupon = { ...coupon, id: generateId(), usedCount: 0 };
    list.push(newCoupon);
    localStorage.setItem(LS_COUPONS, JSON.stringify(list));
    return newCoupon;
};
export const deleteCoupon = async (id: string): Promise<void> => {
    await delay(MOCK_DELAY);
    let list: Coupon[] = JSON.parse(localStorage.getItem(LS_COUPONS) || '[]');
    list = list.filter(c => c.id !== id);
    localStorage.setItem(LS_COUPONS, JSON.stringify(list));
    window.dispatchEvent(new Event('coupons-updated'));
};
export const validateCoupon = async (code: string, originalPrice: number, itemId?: string, category?: 'SOFTWARE' | 'ELECTRONICS'): Promise<{amount: number, type: 'PERCENTAGE' | 'FIXED'}> => {
    await delay(MOCK_DELAY);
    const list: Coupon[] = JSON.parse(localStorage.getItem(LS_COUPONS) || '[]');
    const coupon = list.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) throw new Error('Invalid coupon code.');
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) throw new Error('This coupon has expired.');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new Error('This coupon has reached its usage limit.');
    if (coupon.targetType === 'SOFTWARE' && category !== 'SOFTWARE') throw new Error('This code is only valid for Software products.');
    if (coupon.targetType === 'ELECTRONICS' && category !== 'ELECTRONICS') throw new Error('This code is only valid for Electronics.');
    if (coupon.targetId && itemId && coupon.targetId !== itemId) throw new Error('This code is not valid for this specific item.');
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') { discountAmount = (originalPrice * coupon.value) / 100; } else { discountAmount = coupon.value; }
    if (discountAmount > originalPrice) discountAmount = originalPrice;
    return { amount: discountAmount, type: coupon.discountType };
};
export const incrementCouponUsage = async (code: string) => {
    const list: Coupon[] = JSON.parse(localStorage.getItem(LS_COUPONS) || '[]');
    const index = list.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (index !== -1) { list[index].usedCount = (list[index].usedCount || 0) + 1; localStorage.setItem(LS_COUPONS, JSON.stringify(list)); }
}
export const subscribe = async (userId: string, softwareId: string, plan: PlanType, couponCode?: string): Promise<{subscription: Subscription, license: License}> => {
  await delay(MOCK_DELAY + 500); 
  const softwareList: Software[] = JSON.parse(localStorage.getItem(LS_SOFTWARE) || '[]');
  const sw = softwareList.find(s => s.id === softwareId);
  if (!sw) throw new Error('Software not found');
  if (couponCode) { await incrementCouponUsage(couponCode); }
  const now = new Date();
  const endDate = new Date();
  if (plan === PlanType.MONTHLY) endDate.setMonth(endDate.getMonth() + 1);
  else endDate.setFullYear(endDate.getFullYear() + 1);
  const subId = generateId();
  const newSub: Subscription = { id: subId, userId, softwareId, plan, startDate: now.toISOString(), endDate: endDate.toISOString(), status: 'ACTIVE', amountPaid: plan === PlanType.MONTHLY ? sw.priceMonthly : sw.priceYearly };
  const newLicense: License = { id: generateId(), key: generateLicenseKey(), userId, softwareId, subscriptionId: subId, expiryDate: endDate.toISOString(), isActive: true };
  const subs: Subscription[] = JSON.parse(localStorage.getItem(LS_SUBS) || '[]');
  subs.push(newSub);
  localStorage.setItem(LS_SUBS, JSON.stringify(subs));
  const licenses: License[] = JSON.parse(localStorage.getItem(LS_LICENSES) || '[]');
  licenses.push(newLicense);
  localStorage.setItem(LS_LICENSES, JSON.stringify(licenses));
  return { subscription: newSub, license: newLicense };
};
export const getUserSubscriptions = async (userId: string): Promise<(Subscription & { software: Software })[]> => {
  await delay(MOCK_DELAY);
  const subs: Subscription[] = JSON.parse(localStorage.getItem(LS_SUBS) || '[]');
  const sws: Software[] = JSON.parse(localStorage.getItem(LS_SOFTWARE) || '[]');
  return subs.filter(s => s.userId === userId).map(s => ({ ...s, software: sws.find(sw => sw.id === s.softwareId) as Software })).filter(s => !!s.software); 
};
export const getUserLicenses = async (userId: string): Promise<(License & { software: Software })[]> => {
  await delay(MOCK_DELAY);
  const licenses: License[] = JSON.parse(localStorage.getItem(LS_LICENSES) || '[]');
  const sws: Software[] = JSON.parse(localStorage.getItem(LS_SOFTWARE) || '[]');
  return licenses.filter(l => l.userId === userId).map(l => ({ ...l, software: sws.find(sw => sw.id === l.softwareId) as Software })).filter(l => !!l.software);
};
export const getAllStats = async () => {
  await delay(MOCK_DELAY);
  const subs: Subscription[] = JSON.parse(localStorage.getItem(LS_SUBS) || '[]');
  const users: User[] = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
  const software: Software[] = JSON.parse(localStorage.getItem(LS_SOFTWARE) || '[]');
  const electronics: ElectronicsItem[] = JSON.parse(localStorage.getItem(LS_ELECTRONICS) || '[]');
  const messages: ContactMessage[] = JSON.parse(localStorage.getItem(LS_MESSAGES) || '[]');
  const orders: Order[] = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
  const tools: Tool[] = JSON.parse(localStorage.getItem(LS_TOOLS) || '[]');
  const subRevenue = subs.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const orderRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  return { 
    totalRevenue: subRevenue + orderRevenue, 
    totalUsers: users.length, 
    activeSubscriptions: subs.filter(s => s.status === 'ACTIVE').length, 
    totalSoftware: software.length, 
    totalElectronics: electronics.length, 
    totalMessages: messages.length,
    totalTools: tools.length,
    activeTools: tools.filter(t => t.status === 'ACTIVE').length,
    featuredTools: tools.filter(t => t.featured).length,
    totalToolClicks: tools.reduce((sum, t) => sum + (t.clicks || 0), 0)
  };
};
export const getClientStats = async (userId: string) => {
  await delay(MOCK_DELAY);
  const subs: Subscription[] = JSON.parse(localStorage.getItem(LS_SUBS) || '[]');
  const orders: Order[] = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
  const userSubs = subs.filter(s => s.userId === userId);
  const userOrders = orders.filter(o => o.userId === userId);
  const activeSubs = userSubs.filter(s => s.status === 'ACTIVE');
  const monthlySpend = activeSubs.reduce((acc, sub) => { return acc + (sub.plan === PlanType.MONTHLY ? sub.amountPaid : sub.amountPaid / 12); }, 0);
  const subSpent = userSubs.reduce((acc, s) => acc + s.amountPaid, 0);
  const orderSpent = userOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  return { activeLicenses: activeSubs.length, monthlySpend: Math.round(monthlySpend), totalSpent: subSpent + orderSpent };
};
export const getAllUsers = async (): Promise<User[]> => { await delay(MOCK_DELAY); return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); };
export const deleteUser = async (id: string): Promise<void> => {
  await delay(MOCK_DELAY);
  let users: User[] = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
  users = users.filter(u => u.id !== id);
  localStorage.setItem(LS_USERS, JSON.stringify(users));
};
export const updateLicenseStatus = async (licenseId: string, isActive: boolean): Promise<void> => {
  await delay(MOCK_DELAY);
  const licenses: License[] = JSON.parse(localStorage.getItem(LS_LICENSES) || '[]');
  const index = licenses.findIndex(l => l.id === licenseId);
  if (index !== -1) { licenses[index].isActive = isActive; localStorage.setItem(LS_LICENSES, JSON.stringify(licenses)); }
};

// --- Job CRUD ---
export const getJobs = async (): Promise<Job[]> => {
    await delay(MOCK_DELAY);
    return JSON.parse(localStorage.getItem(LS_JOBS) || '[]');
};

export const addJob = async (job: Omit<Job, 'id'>): Promise<Job> => {
    await delay(MOCK_DELAY);
    const list: Job[] = JSON.parse(localStorage.getItem(LS_JOBS) || '[]');
    const newJob = { ...job, id: generateId() };
    list.push(newJob);
    localStorage.setItem(LS_JOBS, JSON.stringify(list));
    return newJob;
};

export const updateJob = async (id: string, updates: Partial<Job>): Promise<Job> => {
    await delay(MOCK_DELAY);
    let list: Job[] = JSON.parse(localStorage.getItem(LS_JOBS) || '[]');
    const index = list.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Job not found');
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(LS_JOBS, JSON.stringify(list));
    return list[index];
};

export const deleteJob = async (id: string): Promise<void> => {
    await delay(MOCK_DELAY);
    let list: Job[] = JSON.parse(localStorage.getItem(LS_JOBS) || '[]');
    list = list.filter(j => j.id !== id);
    localStorage.setItem(LS_JOBS, JSON.stringify(list));
    window.dispatchEvent(new Event('jobs-updated'));
};

// --- News/Updates CRUD ---
export const getUpdates = async (): Promise<NewsUpdate[]> => {
    await delay(MOCK_DELAY);
    return JSON.parse(localStorage.getItem(LS_UPDATES) || '[]');
};

export const addUpdate = async (update: Omit<NewsUpdate, 'id'>): Promise<NewsUpdate> => {
    await delay(MOCK_DELAY);
    const list: NewsUpdate[] = JSON.parse(localStorage.getItem(LS_UPDATES) || '[]');
    const newUpdate = { ...update, id: generateId() };
    list.unshift(newUpdate); // Add to top
    localStorage.setItem(LS_UPDATES, JSON.stringify(list));
    return newUpdate;
};

export const updateUpdate = async (id: string, updates: Partial<NewsUpdate>): Promise<NewsUpdate> => {
    await delay(MOCK_DELAY);
    let list: NewsUpdate[] = JSON.parse(localStorage.getItem(LS_UPDATES) || '[]');
    const index = list.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Update not found');
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(LS_UPDATES, JSON.stringify(list));
    return list[index];
};

export const deleteUpdate = async (id: string): Promise<void> => {
    await delay(MOCK_DELAY);
    let list: NewsUpdate[] = JSON.parse(localStorage.getItem(LS_UPDATES) || '[]');
    list = list.filter(u => u.id !== id);
    localStorage.setItem(LS_UPDATES, JSON.stringify(list));
    window.dispatchEvent(new Event('updates-updated'));
};

// --- Download History Service ---
export const getDownloadHistory = async (userId: string): Promise<DownloadRecord[]> => {
    await delay(MOCK_DELAY / 2);
    const downloads: DownloadRecord[] = JSON.parse(localStorage.getItem(LS_DOWNLOADS) || '[]');
    return downloads.filter(d => d.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addDownloadRecord = async (record: Omit<DownloadRecord, 'id' | 'date' | 'status' | 'securityScanResult'>): Promise<void> => {
    // No delay needed for smoother UI
    const downloads: DownloadRecord[] = JSON.parse(localStorage.getItem(LS_DOWNLOADS) || '[]');
    const newRecord: DownloadRecord = {
        ...record,
        id: generateId(),
        date: new Date().toISOString(),
        status: 'COMPLETED', // In this mock, we only record completion
        securityScanResult: 'CLEAN'
    };
    downloads.unshift(newRecord);
    // Keep max 20 records
    if (downloads.length > 20) downloads.pop();
    localStorage.setItem(LS_DOWNLOADS, JSON.stringify(downloads));
};

// --- Tools CRUD & Statistics ---
export const getTools = async (): Promise<Tool[]> => {
  await delay(MOCK_DELAY);
  return JSON.parse(localStorage.getItem(LS_TOOLS) || '[]');
};

export const addTool = async (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt' | 'clicks'>): Promise<Tool> => {
  await delay(MOCK_DELAY);
  const list: Tool[] = JSON.parse(localStorage.getItem(LS_TOOLS) || '[]');
  const now = new Date().toISOString();
  const newTool: Tool = {
    ...tool,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    clicks: 0
  };
  list.unshift(newTool);
  localStorage.setItem(LS_TOOLS, JSON.stringify(list));
  return newTool;
};

export const updateTool = async (id: string, updates: Partial<Tool>): Promise<Tool> => {
  await delay(MOCK_DELAY);
  const list: Tool[] = JSON.parse(localStorage.getItem(LS_TOOLS) || '[]');
  const index = list.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Tool not found');
  const now = new Date().toISOString();
  list[index] = {
    ...list[index],
    ...updates,
    updatedAt: now
  };
  localStorage.setItem(LS_TOOLS, JSON.stringify(list));
  return list[index];
};

export const deleteTool = async (id: string): Promise<void> => {
  await delay(MOCK_DELAY);
  let list: Tool[] = JSON.parse(localStorage.getItem(LS_TOOLS) || '[]');
  list = list.filter(t => t.id !== id);
  localStorage.setItem(LS_TOOLS, JSON.stringify(list));
  window.dispatchEvent(new Event('tools-updated'));
};

export const incrementToolClicks = async (id: string): Promise<void> => {
  const list: Tool[] = JSON.parse(localStorage.getItem(LS_TOOLS) || '[]');
  const index = list.findIndex(t => t.id === id);
  if (index !== -1) {
    list[index].clicks = (list[index].clicks || 0) + 1;
    localStorage.setItem(LS_TOOLS, JSON.stringify(list));
  }
};

// --- Plan Management Helpers ---
export const getPlans = async (): Promise<BusinessPlan[]> => {
  await delay(MOCK_DELAY / 3);
  return JSON.parse(localStorage.getItem(LS_PLANS) || '[]');
};

export const addPlan = async (plan: Omit<BusinessPlan, 'id'>): Promise<BusinessPlan> => {
  await delay(MOCK_DELAY / 3);
  const list: BusinessPlan[] = JSON.parse(localStorage.getItem(LS_PLANS) || '[]');
  const newPlan: BusinessPlan = {
    ...plan,
    id: generateId()
  };
  list.push(newPlan);
  localStorage.setItem(LS_PLANS, JSON.stringify(list));
  return newPlan;
};

export const updatePlan = async (id: string, updates: Partial<BusinessPlan>): Promise<BusinessPlan> => {
  await delay(MOCK_DELAY / 3);
  const list: BusinessPlan[] = JSON.parse(localStorage.getItem(LS_PLANS) || '[]');
  const index = list.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Plan not found');
  list[index] = {
    ...list[index],
    ...updates
  };
  localStorage.setItem(LS_PLANS, JSON.stringify(list));
  return list[index];
};

export const deletePlan = async (id: string): Promise<void> => {
  await delay(MOCK_DELAY / 3);
  let list: BusinessPlan[] = JSON.parse(localStorage.getItem(LS_PLANS) || '[]');
  list = list.filter(p => p.id !== id);
  localStorage.setItem(LS_PLANS, JSON.stringify(list));
};

// --- Custom Role Management Helpers ---
export const getCustomRoles = async (): Promise<CustomRole[]> => {
  await delay(MOCK_DELAY / 3);
  return JSON.parse(localStorage.getItem(LS_CUSTOM_ROLES) || '[]');
};

export const addCustomRole = async (role: Omit<CustomRole, 'id'>): Promise<CustomRole> => {
  await delay(MOCK_DELAY / 3);
  const list: CustomRole[] = JSON.parse(localStorage.getItem(LS_CUSTOM_ROLES) || '[]');
  const newRole: CustomRole = {
    ...role,
    id: generateId()
  };
  list.push(newRole);
  localStorage.setItem(LS_CUSTOM_ROLES, JSON.stringify(list));
  return newRole;
};

export const updateCustomRole = async (id: string, updates: Partial<CustomRole>): Promise<CustomRole> => {
  await delay(MOCK_DELAY / 3);
  const list: CustomRole[] = JSON.parse(localStorage.getItem(LS_CUSTOM_ROLES) || '[]');
  const index = list.findIndex(r => r.id === id);
  if (index === -1) throw new Error('Role not found');
  list[index] = {
    ...list[index],
    ...updates
  };
  localStorage.setItem(LS_CUSTOM_ROLES, JSON.stringify(list));
  return list[index];
};

export const deleteCustomRole = async (id: string): Promise<void> => {
  await delay(MOCK_DELAY / 3);
  let list: CustomRole[] = JSON.parse(localStorage.getItem(LS_CUSTOM_ROLES) || '[]');
  list = list.filter(r => r.id !== id);
  localStorage.setItem(LS_CUSTOM_ROLES, JSON.stringify(list));
};

// --- System Settings Helpers ---
export const getSystemSettings = async (): Promise<SystemSettings> => {
  await delay(MOCK_DELAY / 3);
  return JSON.parse(localStorage.getItem(LS_SYSTEM_SETTINGS) || JSON.stringify(INITIAL_SYSTEM_SETTINGS));
};

export const updateSystemSettings = async (updates: Partial<SystemSettings>): Promise<SystemSettings> => {
  await delay(MOCK_DELAY / 3);
  const current: SystemSettings = JSON.parse(localStorage.getItem(LS_SYSTEM_SETTINGS) || JSON.stringify(INITIAL_SYSTEM_SETTINGS));
  const updated = {
    ...current,
    ...updates
  };
  localStorage.setItem(LS_SYSTEM_SETTINGS, JSON.stringify(updated));
  window.dispatchEvent(new Event('settings-updated'));
  return updated;
};

// --- Feature Flag Helpers ---
export const getFeatureFlags = async (): Promise<FeatureFlag[]> => {
  await delay(MOCK_DELAY / 3);
  return JSON.parse(localStorage.getItem(LS_FEATURE_FLAGS) || '[]');
};

export const updateFeatureFlag = async (id: string, enabled: boolean): Promise<FeatureFlag> => {
  await delay(MOCK_DELAY / 3);
  const list: FeatureFlag[] = JSON.parse(localStorage.getItem(LS_FEATURE_FLAGS) || '[]');
  const index = list.findIndex(f => f.id === id);
  if (index === -1) throw new Error('Feature flag not found');
  list[index].enabled = enabled;
  localStorage.setItem(LS_FEATURE_FLAGS, JSON.stringify(list));
  window.dispatchEvent(new Event('feature-flags-updated'));
  return list[index];
};

