'use client';

import { useState, useMemo, useEffect } from 'react';
import { ReactFlow, Controls, Background, Node, Edge, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getDb, DISTRICTS, isDemoModeActive } from '@/lib/mockDb';
import { Network, Search, ShieldCheck, MapPin, Building, User, Target, Compass, DollarSign, ArrowRight } from 'lucide-react';

// Custom Node Components
const DistrictNode = ({ data }: any) => (
  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-slate-400 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-md text-xs font-bold min-w-[150px] justify-center">
    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
    <span>{data.label}</span>
    <Handle type="source" position={Position.Bottom} style={{ background: '#94a3b8' }} />
  </div>
);

const UniversityNode = ({ data }: any) => (
  <div className="flex flex-col gap-1 p-3 rounded-xl border border-blue-400 bg-white dark:bg-slate-900 shadow-lg text-xs min-w-[180px]">
    <Handle type="target" position={Position.Top} style={{ background: '#3b82f6' }} />
    <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
      <Building className="w-3.5 h-3.5 shrink-0" />
      <span>{data.label}</span>
    </div>
    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-medium">
      <span>Students: {data.students.toLocaleString()}</span>
      <span className="bg-blue-500/10 text-blue-600 px-1 py-0.5 rounded font-bold">{data.score} Score</span>
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6' }} />
  </div>
);

const FounderNode = ({ data }: any) => (
  <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-purple-400 bg-white dark:bg-slate-900 shadow-md text-xs min-w-[200px]">
    <Handle type="target" position={Position.Top} style={{ background: '#a855f7' }} />
    <img src={data.avatar} alt={data.label} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100" />
    <div>
      <p className="font-bold text-slate-900 dark:text-white leading-none">{data.label}</p>
      <p className="text-[9px] text-slate-400 mt-1">{data.title}</p>
      {data.firstGen && (
        <span className="inline-block text-[8px] font-bold text-purple-600 bg-purple-500/10 px-1 py-0.5 rounded mt-1">
          First-Gen Founder
        </span>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#a855f7' }} />
  </div>
);

const StartupNode = ({ data }: any) => (
  <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-emerald-400 bg-white dark:bg-slate-900 shadow-lg text-xs min-w-[200px]">
    <Handle type="target" position={Position.Top} style={{ background: '#10b981' }} />
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
        <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="truncate max-w-[110px]">{data.label}</span>
      </div>
      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-600">
        {data.stage.toUpperCase()}
      </span>
    </div>
    
    {/* Health bar */}
    <div>
      <div className="flex justify-between text-[9px] text-slate-400 font-medium mb-0.5">
        <span>Venture Health</span>
        <span className="font-bold text-slate-700 dark:text-slate-300">{data.health}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${data.health}%` }}></div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#10b981' }} />
  </div>
);

const MentorNode = ({ data }: any) => (
  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-pink-400 bg-white dark:bg-slate-900 shadow-md text-xs min-w-[160px]">
    <Handle type="source" position={Position.Top} style={{ background: '#ec4899' }} />
    <div className="flex items-center justify-center w-7 h-7 rounded bg-pink-500/10 text-pink-500 font-bold shrink-0">
      M
    </div>
    <div>
      <p className="font-bold text-slate-900 dark:text-white leading-none">{data.label}</p>
      <p className="text-[9px] text-slate-400 mt-1">Impact Rating: {data.impact}/100</p>
    </div>
  </div>
);

const InvestorNode = ({ data }: any) => (
  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-400 bg-white dark:bg-slate-900 shadow-md text-xs min-w-[180px]">
    <Handle type="source" position={Position.Top} style={{ background: '#f59e0b' }} />
    <div className="flex items-center justify-center w-7 h-7 rounded bg-amber-500/10 text-amber-500 font-bold shrink-0">
      ₹
    </div>
    <div>
      <p className="font-bold text-slate-900 dark:text-white leading-none">{data.label}</p>
      <p className="text-[9px] text-slate-400 mt-1">Ticket: Max {data.ticket}Cr</p>
    </div>
  </div>
);

// Register Custom Node Types
const nodeTypes = {
  districtNode: DistrictNode,
  universityNode: UniversityNode,
  founderNode: FounderNode,
  startupNode: StartupNode,
  mentorNode: MentorNode,
  investorNode: InvestorNode
};

export default function InnovationGraph() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Visakhapatnam');
  const [activeNode, setActiveNode] = useState<{ label: string; type: string; details: string } | null>(null);
  const [db, setDb] = useState(() => getDb());

  // Listen to global Demo Mode updates
  useEffect(() => {
    setDb(getDb());
    const handleModeChange = () => {
      setDb(getDb());
    };
    window.addEventListener('rtih_mode_change', handleModeChange);
    return () => {
      window.removeEventListener('rtih_mode_change', handleModeChange);
    };
  }, []);

  const graphData = useMemo(() => {
    try {
      const startups = db.getStartups().filter(s => s.district === selectedDistrict).slice(0, 3);
      const universities = db.getUniversities().filter(u => u.district === selectedDistrict).slice(0, 2);
      const mentors = db.getMentors().slice(0, 3);
      const investors = db.getInvestors().slice(0, 2);

      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // 1. Center District Node
      const districtId = `node-dist-${selectedDistrict}`;
      nodes.push({
        id: districtId,
        type: 'districtNode',
        position: { x: 380, y: 20 },
        data: { label: `${selectedDistrict} Region` }
      });

      // 2. Add Universities
      universities.forEach((uni, idx) => {
        const uniId = `node-uni-${uni.id}`;
        nodes.push({
          id: uniId,
          type: 'universityNode',
          position: { x: idx * 320 + 220, y: 120 },
          data: { label: uni.name, students: uni.studentCount, score: uni.innovationScore }
        });

        edges.push({
          id: `edge-dist-uni-${uni.id}`,
          source: districtId,
          target: uniId,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        });
      });

      // 3. Add Startups and Founders
      startups.forEach((startup, idx) => {
        const startupId = `node-start-${startup.id}`;
        nodes.push({
          id: startupId,
          type: 'startupNode',
          position: { x: idx * 240 + 100, y: 240 },
          data: { label: startup.name, stage: startup.stage, health: startup.healthScore }
        });

        // Edge District -> Startup (if no university), or University -> Startup
        if (startup.universityId && universities.some(u => u.id === startup.universityId)) {
          edges.push({
            id: `edge-uni-start-${startup.id}`,
            source: `node-uni-${startup.universityId}`,
            target: startupId,
            style: { stroke: '#3b82f6', strokeWidth: 1.5 }
          });
        } else {
          edges.push({
            id: `edge-dist-start-${startup.id}`,
            source: districtId,
            target: startupId,
            style: { stroke: '#94a3b8', strokeWidth: 1.5 }
          });
        }

        // Add founder node
        const founderId = startup.founders[0];
        if (founderId) {
          const founder = db.getFounder(founderId);
          if (founder) {
            const fNodeId = `node-found-${founder.id}`;
            nodes.push({
              id: fNodeId,
              type: 'founderNode',
              position: { x: idx * 240 + 100, y: 360 },
              data: { label: founder.name, title: founder.title, avatar: founder.avatar, firstGen: founder.firstGen }
            });

            edges.push({
              id: `edge-found-start-${founder.id}`,
              source: startupId,
              target: fNodeId,
              style: { stroke: '#a855f7', strokeWidth: 1.5 }
            });
          }
        }

        // Connect Mentors to Startup
        const assignedMentor = mentors[idx % mentors.length];
        const mentorNodeId = `node-mentor-${assignedMentor.id}`;
        
        if (!nodes.some(n => n.id === mentorNodeId)) {
          nodes.push({
            id: mentorNodeId,
            type: 'mentorNode',
            position: { x: 80, y: 490 },
            data: { label: assignedMentor.name, impact: assignedMentor.impactScore }
          });
        }

        edges.push({
          id: `edge-mentor-start-${assignedMentor.id}-${startup.id}`,
          source: mentorNodeId,
          target: startupId,
          animated: true,
          style: { stroke: '#ec4899', strokeWidth: 1.5 }
        });

        // Connect Investors to Startup
        if (['funding', 'scale', 'revenue'].includes(startup.stage)) {
          const assignedInvestor = investors[idx % investors.length];
          const investorNodeId = `node-investor-${assignedInvestor.id}`;

          if (!nodes.some(n => n.id === investorNodeId)) {
            nodes.push({
              id: investorNodeId,
              type: 'investorNode',
              position: { x: 580, y: 490 },
              data: { label: assignedInvestor.firmName, ticket: (assignedInvestor.maxTicket / 10000000).toFixed(0) }
            });
          }

          edges.push({
            id: `edge-investor-start-${assignedInvestor.id}-${startup.id}`,
            source: investorNodeId,
            target: startupId,
            animated: true,
            style: { stroke: '#f59e0b', strokeWidth: 1.5 }
          });
        }
      });

      return { nodes, edges };
    } catch (e) {
      console.error(e);
      return { nodes: [], edges: [] };
    }
  }, [db, selectedDistrict]);

  const onNodeClick = (_: any, node: Node) => {
    const id = node.id;
    let type = 'Node';
    let label = '';
    let details = 'Active ecosystem participant in Andhra Pradesh.';

    if (id.startsWith('node-dist')) {
      type = 'District';
      label = `${selectedDistrict} District`;
      details = `Regional administrative sector coordinating RTIH activities, programs, and startup support initiatives in ${selectedDistrict}.`;
    } else if (id.startsWith('node-uni')) {
      type = 'University Outpost';
      const uId = id.split('node-uni-')[1];
      const univ = db.getUniversities().find(u => u.id === uId);
      if (univ) {
        label = univ.name;
        details = `Host of the ${univ.innovationCell}. Educating ${univ.studentCount.toLocaleString()} students, incubating ${univ.startupsCount} startups with an Innovation Score of ${univ.innovationScore}/100.`;
      }
    } else if (id.startsWith('node-start')) {
      type = 'Startup';
      const sId = id.split('node-start-')[1];
      const startup = db.getStartup(sId);
      if (startup) {
        label = startup.name;
        details = `Sector: ${startup.sector}. Lifecycle: ${startup.stage.toUpperCase()}. Health Score: ${startup.healthScore}/100. Jobs Created: ${startup.jobsCreated}. Monthly Revenue: ₹${startup.monthlyRevenue.toLocaleString()}.`;
      }
    } else if (id.startsWith('node-found')) {
      type = 'Founder';
      const fId = id.split('node-found-')[1];
      const founder = db.getFounder(fId);
      if (founder) {
        label = founder.name;
        details = `${founder.title}. First-generation founder: ${founder.firstGen ? 'Yes' : 'No'}. Base: ${founder.district}. Bio: ${founder.bio}`;
      }
    } else if (id.startsWith('node-mentor')) {
      type = 'Mentor';
      const mId = id.split('node-mentor-')[1];
      const mentor = db.getMentor(mId);
      if (mentor) {
        label = mentor.name;
        details = `Expertise: ${mentor.expertise.join(', ')}. Impact Rating: ${mentor.impactScore}/100. Bio: ${mentor.bio}`;
      }
    } else if (id.startsWith('node-investor')) {
      type = 'Investor';
      const iId = id.split('node-investor-')[1];
      const investor = db.getInvestor(iId);
      if (investor) {
        label = investor.firmName;
        details = `Investment Firm. Managing Director: ${investor.name}. Stages: ${investor.stageFocus.join(', ')}. Ticket range: ₹${(investor.minTicket / 100000).toFixed(0)}L - ₹${(investor.maxTicket / 10000000).toFixed(1)}Cr.`;
      }
    }

    setActiveNode({ label, type, details });
  };

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-500" />
            Ecosystem Digital Twin Simulation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulate real-time operational relationships between state structures and startups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">District Focus:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setActiveNode(null);
            }}
            className="text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 focus:outline-none"
          >
            {DISTRICTS.slice(0, 8).map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Canvas Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Node Detail sidebar */}
        <div className="md:col-span-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-850/30 border border-slate-200/50 dark:border-slate-800/60 rounded-xl p-4 min-h-[300px]">
          {activeNode ? (
            <div>
              <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {activeNode.type}
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2.5 mb-3">
                {activeNode.label}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeNode.details}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Search className="w-8 h-8 text-slate-350 dark:text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-400">Select any node on the twin canvas</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Click nodes to inspect operational pathways.
              </p>
            </div>
          )}

          <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded-lg text-[9px] text-slate-400 leading-relaxed mt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />
            Digital Twin matches nodes according to registration files in the AP Data Center.
          </div>
        </div>

        {/* Canvas Graph */}
        <div className="md:col-span-3 h-[520px] border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden bg-slate-50 dark:bg-slate-950">
          <ReactFlow
            nodes={graphData.nodes}
            edges={graphData.edges}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background color="#ccc" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
