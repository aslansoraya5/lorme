import { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Clock, Settings, List, Plus, Trash2, Edit2, 
  X, Zap, Shield, Calendar, AlertCircle,
  Play, Pause, CheckCircle, Search,
  BarChart3, Repeat
} from 'lucide-react';

// Types
interface AutoReplyRule {
  id: string;
  name: string;
  contact: string;
  contactType: 'all' | 'specific' | 'groups' | 'excluded';
  keyword: string;
  keywordMatch: 'contains' | 'starts' | 'exact' | 'any';
  response: string;
  enabled: boolean;
  delay: number;
  oneTimeOnly: boolean;
  priority: number;
}

interface ScheduledMessage {
  id: string;
  name: string;
  message: string;
  time: string;
  date: string;
  contact: string;
  contactType: 'all' | 'specific';
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

interface QuickReply {
  id: string;
  name: string;
  shortcut: string;
  message: string;
  enabled: boolean;
}

interface BusinessHours {
  enabled: boolean;
  autoReplyOutsideHours: boolean;
  replyMessage: string;
  schedule: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
}

interface AppSettings {
  autoReplyEnabled: boolean;
  replyDelay: number;
  maxRepliesPerContact: number;
  replyToGroups: boolean;
  replyToUnknown: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  disclaimerAccepted: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  contact: string;
  contactNumber: string;
  incoming: string;
  outgoing: string;
  ruleId: string | null;
  ruleName: string | null;
  status: 'success' | 'failed' | 'pending';
}

interface Stats {
  totalReplies: number;
  todayReplies: number;
  thisWeekReplies: number;
  activeRules: number;
  totalContacts: number;
}

// Storage Keys
const STORAGE_KEYS = {
  rules: 'lorme-rules',
  schedules: 'lorme-schedules',
  quickReplies: 'lorme-quick-replies',
  businessHours: 'lorme-business-hours',
  settings: 'lorme-settings',
  logs: 'lorme-logs',
};

// Initial Data
const initialBusinessHours: BusinessHours = {
  enabled: false,
  autoReplyOutsideHours: true,
  replyMessage: 'Our business hours are Monday to Friday, 9 AM to 6 PM. We will respond as soon as possible.',
  schedule: {
    monday: { start: '09:00', end: '18:00', enabled: true },
    tuesday: { start: '09:00', end: '18:00', enabled: true },
    wednesday: { start: '09:00', end: '18:00', enabled: true },
    thursday: { start: '09:00', end: '18:00', enabled: true },
    friday: { start: '09:00', end: '18:00', enabled: true },
    saturday: { start: '10:00', end: '14:00', enabled: true },
    sunday: { start: '00:00', end: '00:00', enabled: false },
  },
};

const initialSettings: AppSettings = {
  autoReplyEnabled: true,
  replyDelay: 3,
  maxRepliesPerContact: 5,
  replyToGroups: false,
  replyToUnknown: true,
  soundEnabled: true,
  vibrationEnabled: true,
  darkMode: false,
  disclaimerAccepted: false,
};

// Helper Functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Main App Component
export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'rules' | 'schedules' | 'quickReplies' | 'businessHours' | 'logs' | 'settings'>('dashboard');
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [schedules, setSchedules] = useState<ScheduledMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(initialBusinessHours);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReplies: 0,
    todayReplies: 0,
    thisWeekReplies: 0,
    activeRules: 0,
    totalContacts: 0,
  });

  // Editing states
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [showNewQuickReplyModal, setShowNewQuickReplyModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  // Form states
  const [newRule, setNewRule] = useState<AutoReplyRule>({
    id: '', name: '', contact: '', contactType: 'all', keyword: '',
    keywordMatch: 'contains', response: '', enabled: true, delay: 3,
    oneTimeOnly: false, priority: 1
  });

  const [newSchedule, setNewSchedule] = useState<ScheduledMessage>({
    id: '', name: '', message: '', time: '', date: '',
    contact: '', contactType: 'all', recurring: 'none', enabled: true
  });

  const [newQuickReply, setNewQuickReply] = useState<QuickReply>({
    id: '', name: '', shortcut: '', message: '', enabled: true
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);
      const hasAcceptedDisclaimer = savedSettings ? JSON.parse(savedSettings).disclaimerAccepted : false;
      if (!hasAcceptedDisclaimer) {
        setShowDisclaimerModal(true);
      }

      const savedRules = localStorage.getItem(STORAGE_KEYS.rules);
      if (savedRules) {
        const parsed = JSON.parse(savedRules);
        setRules(parsed);
      } else {
        // Sample data for demo
        setRules([
          {
            id: generateId(),
            name: 'Welcome Message',
            contact: '',
            contactType: 'all',
            keyword: 'hello',
            keywordMatch: 'contains',
            response: 'Hi there! 👋 Thanks for contacting us. How can we help you today?',
            enabled: true,
            delay: 2,
            oneTimeOnly: false,
            priority: 1
          },
          {
            id: generateId(),
            name: 'Out of Office',
            contact: '',
            contactType: 'all',
            keyword: 'urgent',
            keywordMatch: 'contains',
            response: 'Thank you for your message. For urgent matters, please call us at +1234567890.',
            enabled: true,
            delay: 1,
            oneTimeOnly: false,
            priority: 2
          },
          {
            id: generateId(),
            name: 'Price Inquiry',
            contact: '',
            contactType: 'all',
            keyword: 'price',
            keywordMatch: 'contains',
            response: 'Our pricing starts at $99/month. Would you like to schedule a demo to learn more?',
            enabled: true,
            delay: 3,
            oneTimeOnly: false,
            priority: 3
          }
        ]);
      }

      const savedSchedules = localStorage.getItem(STORAGE_KEYS.schedules);
      if (savedSchedules) setSchedules(JSON.parse(savedSchedules));

      const savedQuickReplies = localStorage.getItem(STORAGE_KEYS.quickReplies);
      if (savedQuickReplies) setQuickReplies(JSON.parse(savedQuickReplies));

      const savedBusinessHours = localStorage.getItem(STORAGE_KEYS.businessHours);
      if (savedBusinessHours) setBusinessHours(JSON.parse(savedBusinessHours));

      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedLogs = localStorage.getItem(STORAGE_KEYS.logs);
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    };

    loadData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (rules.length > 0 || localStorage.getItem(STORAGE_KEYS.rules)) {
      localStorage.setItem(STORAGE_KEYS.rules, JSON.stringify(rules));
    }
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.quickReplies, JSON.stringify(quickReplies));
  }, [quickReplies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.businessHours, JSON.stringify(businessHours));
  }, [businessHours]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
  }, [logs]);

  // Calculate stats
  useEffect(() => {
    const now = new Date();
    const today = now.toDateString();
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay())).toDateString();

    const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === today);
    const weekLogs = logs.filter(l => new Date(l.timestamp).toDateString() >= thisWeek);

    setStats({
      totalReplies: logs.length,
      todayReplies: todayLogs.length,
      thisWeekReplies: weekLogs.length,
      activeRules: rules.filter(r => r.enabled).length,
      totalContacts: new Set(logs.map(l => l.contactNumber)).size,
    });
  }, [logs, rules]);

  // CRUD Operations for Rules
  const handleAddRule = () => {
    if (!newRule.name || !newRule.response) return;
    const rule = { ...newRule, id: generateId() };
    setRules([...rules, rule]);
    setShowNewRuleModal(false);
    setNewRule({
      id: '', name: '', contact: '', contactType: 'all', keyword: '',
      keywordMatch: 'contains', response: '', enabled: true, delay: 3,
      oneTimeOnly: false, priority: 1
    });
  };

  const handleUpdateRule = () => {
    if (!editingRule) return;
    setRules(rules.map(r => r.id === editingRule.id ? editingRule : r));
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  // CRUD Operations for Schedules
  const handleAddSchedule = () => {
    if (!newSchedule.name || !newSchedule.message) return;
    const schedule = { ...newSchedule, id: generateId() };
    setSchedules([...schedules, schedule]);
    setShowNewScheduleModal(false);
    setNewSchedule({
      id: '', name: '', message: '', time: '', date: '',
      contact: '', contactType: 'all', recurring: 'none', enabled: true
    });
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  // CRUD Operations for Quick Replies
  const handleAddQuickReply = () => {
    if (!newQuickReply.name || !newQuickReply.message) return;
    const qr = { ...newQuickReply, id: generateId() };
    setQuickReplies([...quickReplies, qr]);
    setShowNewQuickReplyModal(false);
    setNewQuickReply({ id: '', name: '', shortcut: '', message: '', enabled: true });
  };

  const handleDeleteQuickReply = (id: string) => {
    setQuickReplies(quickReplies.filter(qr => qr.id !== id));
  };

  // Simulate incoming message
  const simulateIncomingMessage = useCallback(() => {
    const sampleContacts = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'];
    const sampleMessages = ['Hello', 'Hi, I have a question', 'What are your prices?', 'Urgent help needed', 'Thanks for your help'];
    const randomContact = sampleContacts[Math.floor(Math.random() * sampleContacts.length)];
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

    // Find matching rule
    const matchingRule = rules.find(r => r.enabled && 
      (r.keyword === '' || randomMessage.toLowerCase().includes(r.keyword.toLowerCase()))
    );

    if (matchingRule) {
      const log: LogEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        contact: randomContact,
        contactNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        incoming: randomMessage,
        outgoing: matchingRule.response,
        ruleId: matchingRule.id,
        ruleName: matchingRule.name,
        status: 'success'
      };
      setLogs([log, ...logs]);
    }
  }, [rules, logs]);

  // Filter rules based on search
  const filteredRules = rules.filter(rule => 
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dashboard Stats Cards
  const StatCard = ({ icon: Icon, title, value, color, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-white/30"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Lorme</h1>
                <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Smart Auto Responder</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={simulateIncomingMessage}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Simulate Message</span>
              </button>
              <div className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-full ${settings.autoReplyEnabled ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                <div className={`w-2 h-2 rounded-full ${settings.autoReplyEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`text-sm font-medium ${settings.autoReplyEnabled ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {settings.autoReplyEnabled ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => setSettings({ ...settings, autoReplyEnabled: !settings.autoReplyEnabled })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.autoReplyEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.autoReplyEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border sticky top-24`}>
              <ul className="p-3 space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'rules', label: 'Auto Reply Rules', icon: MessageSquare },
                  { id: 'schedules', label: 'Scheduled Messages', icon: Clock },
                  { id: 'quickReplies', label: 'Quick Replies', icon: Zap },
                  { id: 'businessHours', label: 'Business Hours', icon: Calendar },
                  { id: 'logs', label: 'Response Logs', icon: List },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((item) => (
                  <li key={item.id}>
                <button
                  onClick={() => setCurrentTab(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    currentTab === item.id
                      ? 'bg-blue-600 text-white font-medium'
                      : `${settings.darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                  }`}
                >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {item.id === 'rules' && (
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          currentTab === 'rules' ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {rules.length}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Dashboard Tab */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Overview of your auto-responder activity
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={MessageSquare}
                    title="Total Replies"
                    value={stats.totalReplies}
                    color="bg-blue-500"
                    trend={12}
                  />
                  <StatCard
                    icon={Clock}
                    title="Today's Replies"
                    value={stats.todayReplies}
                    color="bg-green-500"
                    trend={8}
                  />
                  <StatCard
                    icon={MessageSquare}
                    title="This Week"
                    value={stats.thisWeekReplies}
                    color="bg-purple-500"
                    trend={15}
                  />
                  <StatCard
                    icon={Shield}
                    title="Active Rules"
                    value={stats.activeRules}
                    color="bg-orange-500"
                  />
                </div>

                {/* Quick Actions */}
                <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => { setCurrentTab('rules'); setShowNewRuleModal(true); }}
                      className="flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Plus className="h-6 w-6 text-blue-600 mb-2" />
                      <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Rule</span>
                    </button>
                    <button
                      onClick={() => { setCurrentTab('schedules'); setShowNewScheduleModal(true); }}
                      className="flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Clock className="h-6 w-6 text-blue-600 mb-2" />
                      <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Schedule Message</span>
                    </button>
                  <button
                    onClick={() => { setCurrentTab('quickReplies'); setShowNewQuickReplyModal(true); }}
                    className="flex flex-col items-center p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <Zap className="h-6 w-6 text-indigo-600 mb-2" />
                    <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quick Reply</span>
                  </button>
                    <button
                      onClick={simulateIncomingMessage}
                      className="flex flex-col items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <Play className="h-6 w-6 text-green-600 mb-2" />
                      <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Test</span>
                    </button>
                </div>
                </div>

                {/* Recent Activity */}
                <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
                    <button
                      onClick={() => setCurrentTab('logs')}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View All
                    </button>
                  </div>
                  {logs.length === 0 ? (
                    <div className={`text-center py-8 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No activity yet. Click "Simulate Message" to test.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.slice(0, 5).map((log) => (
                        <div key={log.id} className={`flex items-start space-x-3 p-3 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{log.contact}</p>
                            <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{log.ruleName || 'Manual'}</p>
                            <p className={`text-xs mt-1 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {formatTime(log.timestamp)}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rules Tab */}
            {currentTab === 'rules' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Auto Reply Rules</h2>
                  <button
                    onClick={() => setShowNewRuleModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Rule</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${settings.darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      settings.darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>

                {/* Rules List */}
                <div className="space-y-4">
                  {filteredRules.length === 0 ? (
                    <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm border border-gray-200 p-12 text-center`}>
                      <MessageSquare className={`h-16 w-16 mx-auto mb-4 ${settings.darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <h3 className={`text-lg font-medium mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>No rules yet</h3>
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Create your first auto-reply rule to get started</p>
                      <button
                        onClick={() => setShowNewRuleModal(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Rule</span>
                      </button>
                    </div>
                  ) : (
                    filteredRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{rule.name}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                rule.enabled 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {rule.enabled ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className={`space-y-2 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <p><span className="font-medium">Keyword:</span> {rule.keyword || 'Any message'}</p>
                              <p><span className="font-medium">Response:</span> {rule.response}</p>
                              <p><span className="font-medium">Delay:</span> {rule.delay} seconds</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleRule(rule.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                rule.enabled 
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {rule.enabled ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </button>
                            <button
                              onClick={() => setEditingRule(rule)}
                              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Schedules Tab */}
            {currentTab === 'schedules' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Scheduled Messages</h2>
                  <button
                    onClick={() => setShowNewScheduleModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Schedule Message</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {schedules.length === 0 ? (
                    <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm border border-gray-200 p-12 text-center`}>
                      <Clock className={`h-16 w-16 mx-auto mb-4 ${settings.darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <h3 className={`text-lg font-medium mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>No scheduled messages</h3>
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Schedule your first message to send automatically</p>
                  <button
                    onClick={() => setShowNewScheduleModal(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Schedule Message</span>
                  </button>
                    </div>
                  ) : (
                    schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{schedule.name}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                schedule.enabled 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {schedule.enabled ? 'Scheduled' : 'Disabled'}
                              </span>
                            </div>
                            <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{schedule.message}</p>
                            <div className={`flex items-center space-x-4 text-sm ${settings.darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(schedule.date)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(schedule.time)}</span>
                              </span>
                              {schedule.recurring !== 'none' && (
                                <span className="flex items-center space-x-1 text-purple-600">
                                  <Repeat className="h-4 w-4" />
                                  <span className="capitalize">{schedule.recurring}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Quick Replies Tab */}
            {currentTab === 'quickReplies' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Replies</h2>
                  <button
                    onClick={() => setShowNewQuickReplyModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Quick Reply</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickReplies.length === 0 ? (
                    <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm border border-gray-200 p-12 text-center md:col-span-2`}>
                      <Zap className={`h-16 w-16 mx-auto mb-4 ${settings.darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <h3 className={`text-lg font-medium mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>No quick replies</h3>
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Create quick reply shortcuts for common messages</p>
                  <button
                    onClick={() => setShowNewQuickReplyModal(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Quick Reply</span>
                  </button>
                    </div>
                  ) : (
                    quickReplies.map((qr) => (
                      <div
                        key={qr.id}
                        className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-lg font-mono ${
                                settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {qr.shortcut || '/'}{qr.name.toLowerCase().replace(/\s+/g, '')}
                              </span>
                            </div>
                            <h3 className={`font-semibold mb-1 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{qr.name}</h3>
                            <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{qr.message}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteQuickReply(qr.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Business Hours Tab */}
            {currentTab === 'businessHours' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Business Hours</h2>
                
                <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Enable Business Hours</h3>
                      <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Set your working hours and auto-reply outside of them
                      </p>
                    </div>
                    <button
                      onClick={() => setBusinessHours({ ...businessHours, enabled: !businessHours.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        businessHours.enabled ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          businessHours.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {businessHours.enabled && (
                    <>
                      <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Auto-reply message outside business hours
                        </label>
                        <textarea
                          value={businessHours.replyMessage}
                          onChange={(e) => setBusinessHours({ ...businessHours, replyMessage: e.target.value })}
                          rows={3}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            settings.darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200 text-gray-900'
                          } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                        />
                      </div>

                      <div className="space-y-3">
                        {Object.entries(businessHours.schedule).map(([day, hours]) => (
                          <div key={day} className={`flex items-center space-x-4 p-4 rounded-xl ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="w-24 capitalize font-medium">{day}</div>
                            <input
                              type="time"
                              value={hours.start}
                              onChange={(e) => setBusinessHours({
                                ...businessHours,
                                schedule: { ...businessHours.schedule, [day]: { ...hours, start: e.target.value } }
                              })}
                              className={`px-3 py-2 rounded-lg border ${
                                settings.darkMode 
                                  ? 'bg-gray-600 border-gray-500 text-white' 
                                  : 'bg-white border-gray-200'
                              }`}
                            />
                            <span className="text-gray-400">to</span>
                            <input
                              type="time"
                              value={hours.end}
                              onChange={(e) => setBusinessHours({
                                ...businessHours,
                                schedule: { ...businessHours.schedule, [day]: { ...hours, end: e.target.value } }
                              })}
                              className={`px-3 py-2 rounded-lg border ${
                                settings.darkMode 
                                  ? 'bg-gray-600 border-gray-500 text-white' 
                                  : 'bg-white border-gray-200'
                              }`}
                            />
                            <input
                              type="checkbox"
                              checked={hours.enabled}
                              onChange={(e) => setBusinessHours({
                                ...businessHours,
                                schedule: { ...businessHours.schedule, [day]: { ...hours, enabled: e.target.checked } }
                              })}
                              className="rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {currentTab === 'logs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Response Logs</h2>
                  <button
                    onClick={() => setLogs([])}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border overflow-hidden`}>
                  {logs.length === 0 ? (
                    <div className="p-12 text-center">
                      <List className={`h-16 w-16 mx-auto mb-4 ${settings.darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No logs yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={`${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Time</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Contact</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Incoming</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Response</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Rule</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${settings.darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {logs.map((log) => (
                            <tr key={log.id} className={`${settings.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {formatTime(log.timestamp)}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {log.contact}
                              </td>
                              <td className={`px-6 py-4 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {log.incoming}
                              </td>
                              <td className={`px-6 py-4 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {log.outgoing}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {log.ruleName || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {currentTab === 'settings' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>

                <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>General Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Auto Reply</p>
                        <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enable automatic replies</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, autoReplyEnabled: !settings.autoReplyEnabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.autoReplyEnabled ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Reply to Groups</p>
                        <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Send auto-replies in group chats</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, replyToGroups: !settings.replyToGroups })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.replyToGroups ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.replyToGroups ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Reply to Unknown Contacts</p>
                        <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Respond to numbers not in contacts</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, replyToUnknown: !settings.replyToUnknown })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.replyToUnknown ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.replyToUnknown ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                        <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Use dark theme</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.darkMode ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Reply Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Reply Delay (seconds)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={settings.replyDelay}
                        onChange={(e) => setSettings({ ...settings, replyDelay: parseInt(e.target.value) || 0 })}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          settings.darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Max Replies Per Contact
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxRepliesPerContact}
                        onChange={(e) => setSettings({ ...settings, maxRepliesPerContact: parseInt(e.target.value) || 1 })}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          settings.darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer with Compliance Info */}
        <footer className={`mt-8 py-6 border-t ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-center">
            <p className={`text-sm ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Lorme v1.0 | Designed for WhatsApp Business API | 
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setShowDisclaimerModal(true); }}
                className="text-green-600 hover:text-green-700 ml-1 underline"
              >
                View Compliance Notice
              </a>
            </p>
            <p className={`text-xs mt-2 ${settings.darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              © 2026 Lorme. All data stored locally. No external servers. WhatsApp is a trademark of Meta Platforms, Inc.
            </p>
          </div>
        </footer>
      </div>

      {/* New Rule Modal */}
      {showNewRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Rule</h3>
                <button onClick={() => setShowNewRuleModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="e.g., Welcome Message"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contact Type</label>
                <select
                  value={newRule.contactType}
                  onChange={(e) => setNewRule({ ...newRule, contactType: e.target.value as any })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                >
                  <option value="all">All Contacts</option>
                  <option value="specific">Specific Contact</option>
                  <option value="groups">Groups Only</option>
                  <option value="excluded">Excluded Contacts</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keyword (optional)</label>
                <input
                  type="text"
                  value={newRule.keyword}
                  onChange={(e) => setNewRule({ ...newRule, keyword: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="Leave empty for any message"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keyword Match Type</label>
                <select
                  value={newRule.keywordMatch}
                  onChange={(e) => setNewRule({ ...newRule, keywordMatch: e.target.value as any })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                >
                  <option value="contains">Contains</option>
                  <option value="starts">Starts With</option>
                  <option value="exact">Exact Match</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Auto-Reply Message</label>
                <textarea
                  value={newRule.response}
                  onChange={(e) => setNewRule({ ...newRule, response: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter your auto-reply message..."
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Delay (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={newRule.delay}
                    onChange={(e) => setNewRule({ ...newRule, delay: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      settings.darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:ring-2 focus:ring-green-500`}
                  />
                </div>
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      settings.darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:ring-2 focus:ring-green-500`}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="oneTimeOnly"
                  checked={newRule.oneTimeOnly}
                  onChange={(e) => setNewRule({ ...newRule, oneTimeOnly: e.target.checked })}
                  className="rounded"
                />
                <label className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Only reply once per contact
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewRuleModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200 transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Rule</h3>
                <button onClick={() => setEditingRule(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keyword</label>
                <input
                  type="text"
                  value={editingRule.keyword}
                  onChange={(e) => setEditingRule({ ...editingRule, keyword: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Response</label>
                <textarea
                  value={editingRule.response}
                  onChange={(e) => setEditingRule({ ...editingRule, response: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingRule(null)}
                className={`px-4 py-2 rounded-lg ${
                  settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200 transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRule}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Schedule Modal */}
      {showNewScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-lg w-full`}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Schedule Message</h3>
                <button onClick={() => setShowNewScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message Name</label>
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="e.g., Morning Greeting"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message</label>
                <textarea
                  value={newSchedule.message}
                  onChange={(e) => setNewSchedule({ ...newSchedule, message: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter your message..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                  <input
                    type="date"
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      settings.darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:ring-2 focus:ring-green-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
                  <input
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      settings.darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:ring-2 focus:ring-green-500`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recurring</label>
                <select
                  value={newSchedule.recurring}
                  onChange={(e) => setNewSchedule({ ...newSchedule, recurring: e.target.value as any })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                >
                  <option value="none">No Recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewScheduleModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200 transition-colors`}
              >
                Cancel
              </button>
                  <button
                    onClick={handleAddSchedule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Schedule
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quick Reply Modal */}
      {showNewQuickReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-lg w-full`}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Create Quick Reply</h3>
                <button onClick={() => setShowNewQuickReplyModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                <input
                  type="text"
                  value={newQuickReply.name}
                  onChange={(e) => setNewQuickReply({ ...newQuickReply, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="e.g., Thank You"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Shortcut</label>
                <input
                  type="text"
                  value={newQuickReply.shortcut}
                  onChange={(e) => setNewQuickReply({ ...newQuickReply, shortcut: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="e.g., ty"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message</label>
                <textarea
                  value={newQuickReply.message}
                  onChange={(e) => setNewQuickReply({ ...newQuickReply, message: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    settings.darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter your quick reply message..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewQuickReplyModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200 transition-colors`}
              >
                Cancel
              </button>
                  <button
                    onClick={handleAddQuickReply}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-500 p-2 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Important Compliance Notice</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h4 className={`font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>WhatsApp Business Policy Compliance</h4>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  This application is designed for use with the official WhatsApp Business API. 
                  Meta/WhatsApp allows automation within the 24-hour response window for business purposes only.
                </p>
              </div>

              <div className={`p-4 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <h4 className={`font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>What's Allowed</h4>
                <ul className={`text-sm list-disc list-inside space-y-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>Task-specific business bots (support, orders, bookings)</li>
                  <li>Auto-replies within 24 hours of user message</li>
                  <li>Approved message templates for outbound messages</li>
                  <li>Clear escalation paths to human agents</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                <h4 className={`font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>What's Prohibited</h4>
                <ul className={`text-sm list-disc list-inside space-y-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>General-purpose AI chatbots without business purpose</li>
                  <li>Automation on personal WhatsApp accounts</li>
                  <li>Spam or unsolicited bulk messaging</li>
                  <li>Messages outside 24-hour window without templates</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Legal Considerations</h4>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  You are responsible for complying with local laws including GDPR (EU), CCPA (California), 
                  TCPA (US), and anti-spam regulations in your jurisdiction. Obtain proper consent before 
                  sending automated messages.
                </p>
              </div>

              <div className={`p-4 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <h4 className={`font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Important Notice</h4>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Lorme</strong> is a management dashboard only. It does not directly integrate with WhatsApp. 
                  You must use the official WhatsApp Business API or WhatsApp Business App for actual messaging. 
                  Misuse of this tool may result in account suspension by WhatsApp/Meta.
                </p>
              </div>

              <div className={`p-4 rounded-lg ${settings.darkMode ? 'bg-green-900' : 'bg-green-100'} border ${settings.darkMode ? 'border-green-700' : 'border-green-200'}`}>
                <h4 className={`font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-green-900'}`}>Privacy & Data Security</h4>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  All data is stored locally in your browser. No data is sent to external servers. 
                  You control your data completely.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.disclaimerAccepted}
                  onChange={(e) => {
                    const newSettings = { ...settings, disclaimerAccepted: e.target.checked };
                    setSettings(newSettings);
                    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(newSettings));
                    if (e.target.checked) {
                      setShowDisclaimerModal(false);
                    }
                  }}
                  className="mt-1 rounded"
                />
                <span className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>I understand and agree</strong> to use Lorme only in compliance with WhatsApp Business Policy and applicable laws. 
                  I accept full responsibility for my use of this tool.
                </span>
              </label>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowDisclaimerModal(false)}
                  disabled={!settings.disclaimerAccepted}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    settings.disclaimerAccepted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  I Accept & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
