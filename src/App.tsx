/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Mic, 
  Shield, 
  Users, 
  Terminal as TerminalIcon, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Brain,
  Heart,
  Database,
  Lock,
  Search,
  Plus,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { Patient, AnalysisResult } from './types';

// --- Mock Data ---
const MOCK_PATIENTS: Patient[] = [
  { id: '1', name: 'Jean Dupont', age: 68, mdsScore: 42, lastAnalysis: '2026-03-30', status: 'stable', tremorFrequency: [2, 3, 4, 3, 5, 4, 3, 2, 3, 4] },
  { id: '2', name: 'Marie Curie', age: 72, mdsScore: 58, lastAnalysis: '2026-03-28', status: 'warning', tremorFrequency: [5, 7, 8, 6, 9, 7, 8, 6, 7, 8] },
  { id: '3', name: 'Robert Martin', age: 65, mdsScore: 25, lastAnalysis: '2026-03-31', status: 'stable', tremorFrequency: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2] },
  { id: '4', name: 'Alice Bernard', age: 79, mdsScore: 82, lastAnalysis: '2026-03-25', status: 'critical', tremorFrequency: [10, 12, 15, 13, 16, 14, 15, 13, 14, 15] },
];

const SYSTEM_LOGS = [
  { time: '16:20:05', type: 'info', msg: 'Z-CORE: Initialisation du noyau sécurisé terminée.' },
  { time: '16:21:12', type: 'success', msg: 'IA Parkinson Logic: Modèles MDS-UPDRS chargés.' },
  { time: '16:22:45', type: 'warning', msg: 'NetSecurePro: Détection d\'une tentative de scan réseau bloquée.' },
  { time: '16:23:11', type: 'info', msg: 'MedicalTrackerPro34: Synchronisation des dossiers patients.' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 group",
      active ? "bg-[#5b8fff]/10 text-[#5b8fff]" : "text-gray-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active ? "text-[#5b8fff]" : "text-gray-500")} />
    <span className="font-medium text-sm">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-[#5b8fff] rounded-full" />}
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-[#151619] border border-white/5 p-5 rounded-xl flex items-center gap-4">
    <div className={cn("p-3 rounded-lg", color)}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </div>
);

const Terminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(SYSTEM_LOGS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newLog = { time: new Date().toLocaleTimeString(), type: 'cmd', msg: `> ${input}` };
    setHistory([...history, newLog]);
    setInput('');
    
    // Simulate command response
    setTimeout(() => {
      let response = { time: new Date().toLocaleTimeString(), type: 'info', msg: 'Commande non reconnue.' };
      if (input.toLowerCase().includes('status')) {
        response = { time: new Date().toLocaleTimeString(), type: 'success', msg: 'Z-CORE: Systèmes nominaux. Charge CPU: 12%.' };
      } else if (input.toLowerCase().includes('scan')) {
        response = { time: new Date().toLocaleTimeString(), type: 'warning', msg: 'NetSecurePro: Scan d\'intégrité en cours...' };
      }
      setHistory(prev => [...prev, response]);
    }, 500);
  };

  return (
    <div className="bg-[#0a0b0d] border border-white/5 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="bg-[#151619] px-4 py-2 flex items-center justify-between border-bottom border-white/5">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-[#5b8fff]" />
          <span className="text-xs font-mono text-gray-400">IA122 TERMINAL SÉCURISÉ</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 font-mono text-xs space-y-1.5 overflow-y-auto scrollbar-hide">
        {history.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-gray-600">[{log.time}]</span>
            <span className={cn(
              log.type === 'success' ? "text-[#3dffc0]" : 
              log.type === 'warning' ? "text-[#ff6b6b]" : 
              log.type === 'cmd' ? "text-[#5b8fff]" : "text-gray-300"
            )}>
              {log.msg}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="p-2 bg-white/5 flex items-center gap-2">
        <span className="text-[#5b8fff] font-mono text-xs ml-2">$</span>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Entrez une commande..."
          className="bg-transparent border-none outline-none text-xs font-mono text-white w-full py-1"
        />
      </form>
    </div>
  );
};

const ParkinsonLogic = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startAnalysis = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setIsAnalyzing(true);
      setTimeout(() => {
        setAnalysis({
          score: 42,
          confidence: 0.94,
          detectedSymptoms: ['Microphonie légère', 'Instabilité prosodique', 'Pauses hésitantes'],
          recommendation: 'Suivi clinique recommandé sous 30 jours. Analyse MDS-UPDRS Partie III suggérée.'
        });
        setIsAnalyzing(false);
      }, 2000);
    }, 3000);
  };

  return (
    <div className="bg-[#151619] border border-white/5 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#5b8fff]/20 rounded-lg">
            <Brain className="text-[#5b8fff]" size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">IA Parkinson Logic</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#3dffc0]/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#3dffc0] animate-pulse" />
          <span className="text-[10px] font-bold text-[#3dffc0] uppercase tracking-wider">MDS-UPDRS V4.2</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <motion.div 
            animate={isRecording ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={cn(
              "absolute inset-0 rounded-full blur-2xl",
              isRecording ? "bg-[#ff6b6b]" : "bg-transparent"
            )}
          />
          <button 
            onClick={startAnalysis}
            disabled={isRecording || isAnalyzing}
            className={cn(
              "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
              isRecording ? "bg-[#ff6b6b] scale-95" : "bg-[#5b8fff] hover:bg-[#5b8fff]/80",
              (isRecording || isAnalyzing) && "cursor-not-allowed opacity-50"
            )}
          >
            {isRecording ? <Activity className="text-white animate-pulse" size={32} /> : <Mic className="text-white" size={32} />}
          </button>
        </div>

        <div className="text-center">
          <p className="text-white font-medium">
            {isRecording ? "Enregistrement en cours..." : isAnalyzing ? "Analyse neuronale..." : "Prêt pour l'analyse vocale"}
          </p>
          <p className="text-gray-500 text-xs mt-2 max-w-xs mx-auto">
            Demandez au patient de prononcer "Aaaaah" pendant 5 secondes pour une analyse de stabilité phonatoire.
          </p>
        </div>

        <AnimatePresence>
          {analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-5 space-y-4"
            >
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Score de Risque MDS</p>
                  <p className="text-3xl font-black text-[#ff6b6b]">{analysis.score}<span className="text-sm text-gray-500 ml-1">/199</span></p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Confiance IA</p>
                  <p className="text-lg font-bold text-[#3dffc0]">{(analysis.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Symptômes Détectés</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedSymptoms.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-300 border border-white/5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#5b8fff]/10 border border-[#5b8fff]/20 rounded-lg">
                <div className="flex gap-2 items-start">
                  <AlertCircle size={14} className="text-[#5b8fff] mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[#5b8fff] leading-relaxed italic">
                    {analysis.recommendation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MedicalTracker = () => {
  return (
    <div className="bg-[#151619] border border-white/5 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3dffc0]/20 rounded-lg">
            <Users className="text-[#3dffc0]" size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">MedicalTrackerPro34</h3>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
        {MOCK_PATIENTS.map((p) => (
          <div key={p.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-sm">
                  {p.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#5b8fff] transition-colors">{p.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{p.age} ans • ID: {p.id}</p>
                </div>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                p.status === 'stable' ? "bg-[#3dffc0]/10 text-[#3dffc0]" :
                p.status === 'warning' ? "bg-yellow-500/10 text-yellow-500" :
                "bg-[#ff6b6b]/10 text-[#ff6b6b]"
              )}>
                {p.status}
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Score MDS</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5b8fff]" style={{ width: `${(p.mdsScore / 199) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-white">{p.mdsScore}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Dernière Analyse</p>
                <p className="text-xs font-medium text-gray-300 mt-1">{p.lastAnalysis}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ZCoreStatus = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <StatCard label="Noyau Z-CORE" value="ACTIF" icon={Shield} color="bg-[#5b8fff]" />
    <StatCard label="Patients Suivis" value="1,284" icon={Users} color="bg-[#3dffc0]" />
    <StatCard label="Alertes Critiques" value="03" icon={AlertCircle} color="bg-[#ff6b6b]" />
    <StatCard label="Uptime Système" value="99.99%" icon={Activity} color="bg-purple-500" />
  </div>
);

// --- Main App ---

const ArchitectureDiagram = () => (
  <div className="bg-[#151619] border border-white/5 rounded-xl p-8 h-full overflow-hidden flex flex-col">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2 bg-purple-500/20 rounded-lg">
        <Database className="text-purple-500" size={20} />
      </div>
      <h3 className="text-lg font-bold text-white">Architecture Souveraine Z-CORE</h3>
    </div>
    
    <div className="flex-1 flex items-center justify-center">
      <svg viewBox="0 0 800 500" className="w-full h-full max-w-4xl">
        {/* Definitions for gradients and filters */}
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5b8fff" />
            <stop offset="100%" stopColor="#3dffc0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Connections */}
        <g stroke="#ffffff10" strokeWidth="2" fill="none">
          <path d="M400 100 L400 200" />
          <path d="M400 250 L400 350" />
          <path d="M400 225 L200 225 L200 350" />
          <path d="M400 225 L600 225 L600 350" />
        </g>

        {/* Core Node */}
        <rect x="300" y="50" width="200" height="60" rx="12" fill="#1a1b1e" stroke="#5b8fff" strokeWidth="2" filter="url(#glow)" />
        <text x="400" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Z-CORE KERNEL</text>
        <text x="400" y="100" textAnchor="middle" fill="#5b8fff" fontSize="10" fontFamily="monospace">v4.0.2-STABLE</text>

        {/* Security Layer */}
        <rect x="325" y="180" width="150" height="80" rx="12" fill="#1a1b1e" stroke="#3dffc0" strokeWidth="2" />
        <text x="400" y="215" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">NetSecurePro AI</text>
        <text x="400" y="235" textAnchor="middle" fill="#3dffc0" fontSize="9" fontFamily="monospace">GOUVERNANCE & SÉCURITÉ</text>

        {/* Modules */}
        <g transform="translate(100, 350)">
          <rect x="0" y="0" width="200" height="100" rx="12" fill="#1a1b1e" stroke="#ff6b6b" strokeWidth="1" />
          <text x="100" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">IA Parkinson Logic</text>
          <text x="100" y="55" textAnchor="middle" fill="#ff6b6b" fontSize="9">ANALYSE MDS-UPDRS</text>
          <circle cx="100" cy="75" r="4" fill="#ff6b6b" className="animate-pulse" />
        </g>

        <g transform="translate(300, 350)">
          <rect x="0" y="0" width="200" height="100" rx="12" fill="#1a1b1e" stroke="#5b8fff" strokeWidth="1" />
          <text x="100" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">MedicalTrackerPro34</text>
          <text x="100" y="55" textAnchor="middle" fill="#5b8fff" fontSize="9">SUIVI CLINIQUE RAG</text>
          <rect x="80" y="70" width="40" height="4" rx="2" fill="#5b8fff" />
        </g>

        <g transform="translate(500, 350)">
          <rect x="0" y="0" width="200" height="100" rx="12" fill="#1a1b1e" stroke="#3dffc0" strokeWidth="1" />
          <text x="100" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">IA122 Terminal</text>
          <text x="100" y="55" textAnchor="middle" fill="#3dffc0" fontSize="9">INTERFACE AGENTIQUE</text>
          <text x="100" y="75" textAnchor="middle" fill="#3dffc0" fontSize="10" fontFamily="monospace">{'>_ RUNNING'}</text>
        </g>
      </svg>
    </div>
    
    <div className="mt-8 grid grid-cols-3 gap-4">
      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Isolation</p>
        <p className="text-xs text-gray-300">Conteneurisation souveraine via Z-CORE Sandbox.</p>
      </div>
      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Confidentialité</p>
        <p className="text-xs text-gray-300">Chiffrement AES-256-GCM des données HDS.</p>
      </div>
      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Intelligence</p>
        <p className="text-xs text-gray-300">Inférence locale optimisée Parkinson Logic.</p>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-gray-300 flex font-sans selection:bg-[#5b8fff]/30">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-[#151619] border-r border-white/5 flex flex-col shrink-0 relative z-50"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b8fff] to-[#3dffc0] flex items-center justify-center shadow-lg shadow-[#5b8fff]/20">
            <Shield className="text-white" size={18} />
          </div>
          {isSidebarOpen && <span className="font-black text-white tracking-tighter text-xl">Z-CORE</span>}
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          <SidebarItem icon={Activity} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Users} label="Patients" active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
          <SidebarItem icon={Brain} label="Parkinson Logic" active={activeTab === 'parkinson'} onClick={() => setActiveTab('parkinson')} />
          <SidebarItem icon={Database} label="Architecture" active={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')} />
          <SidebarItem icon={Shield} label="Sécurité NetSecure" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <SidebarItem icon={Settings} label="Configuration" onClick={() => {}} />
          <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#5b8fff] flex items-center justify-center text-white font-bold text-xs">ZH</div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Dr. Z-H202</p>
                <p className="text-[10px] text-gray-500 truncate">gfbleu@e-wardam.net</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-[#151619] border border-white/10 rounded-full p-1 text-gray-500 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <ChevronRight size={14} className="rotate-180" /> : <ChevronRight size={14} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0b0d]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                placeholder="Rechercher un patient, un dossier, une analyse..."
                className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#5b8fff]/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff6b6b] rounded-full border-2 border-[#0a0b0d]" />
            </button>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#3dffc0]/10 rounded-full border border-[#3dffc0]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3dffc0] animate-pulse" />
              <span className="text-[10px] font-bold text-[#3dffc0] uppercase tracking-widest">Souveraineté : 100%</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">✅ Z-H202.ia ACTIVÉ – Mode Haute Performance 2026 ✅</h1>
              <p className="text-gray-500 text-sm mt-1">Bienvenue dans l'écosystème médical souverain Z-CORE.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition-all">
                Exporter Rapport
              </button>
              <button className="px-4 py-2 bg-[#5b8fff] hover:bg-[#5b8fff]/80 text-white rounded-lg text-sm font-bold shadow-lg shadow-[#5b8fff]/20 transition-all">
                Nouvelle Consultation
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'dashboard' && (
                <>
                  <ZCoreStatus />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="flex-1">
                        <ParkinsonLogic />
                      </div>
                      <div className="h-64">
                        <Terminal />
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="flex-1">
                        <MedicalTracker />
                      </div>
                      <div className="bg-[#151619] border border-white/5 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <Activity size={16} className="text-[#5b8fff]" />
                          Activité Réseau NetSecure
                        </h3>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              { name: '00:00', val: 400 },
                              { name: '04:00', val: 300 },
                              { name: '08:00', val: 600 },
                              { name: '12:00', val: 800 },
                              { name: '16:00', val: 500 },
                              { name: '20:00', val: 900 },
                            ]}>
                              <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#5b8fff" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#5b8fff" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="val" stroke="#5b8fff" fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'patients' && (
                <div className="grid grid-cols-1 gap-6">
                  <MedicalTracker />
                </div>
              )}

              {activeTab === 'parkinson' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                  <ParkinsonLogic />
                  <div className="space-y-6">
                    <div className="bg-[#151619] border border-white/5 rounded-xl p-6">
                      <h3 className="text-sm font-bold text-white mb-4">Historique des Analyses</h3>
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#5b8fff]/10 rounded">
                                <Activity size={14} className="text-[#5b8fff]" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Analyse Phonatoire #{i * 124}</p>
                                <p className="text-[10px] text-gray-500">2026-03-{30-i}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#3dffc0]">42/199</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Terminal />
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="h-[700px]">
                  <ArchitectureDiagram />
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Menaces Bloquées" value="142" icon={Shield} color="bg-[#ff6b6b]" />
                    <StatCard label="Intégrité Noyau" value="100%" icon={CheckCircle2} color="bg-[#3dffc0]" />
                    <StatCard label="Chiffrement" value="AES-256" icon={Lock} color="bg-[#5b8fff]" />
                  </div>
                  <div className="bg-[#151619] border border-white/5 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-6">Logs de Sécurité NetSecurePro</h3>
                    <Terminal />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Disclaimer */}
          <footer className="pt-8 border-t border-white/5">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-4 items-start">
              <AlertCircle className="text-yellow-500 shrink-0" size={20} />
              <p className="text-xs text-yellow-500/80 leading-relaxed">
                <strong>CLAUSE DE NON-RESPONSABILITÉ MÉDICALE :</strong> Cet outil est une aide à la décision clinique basée sur l'IA. Les scores MDS-UPDRS et les analyses vocales sont fournis à titre indicatif. Ils ne constituent pas un diagnostic définitif. Toute décision thérapeutique doit être validée par un neurologue ou un professionnel de santé qualifié.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
