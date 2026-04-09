'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, Project } from '@/lib/db';
import { Plus, Folder, Trash2, MoreVertical, Search, Zap, Settings, Loader2 } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const allProjects = await db.projects.orderBy('updatedAt').reverse().toArray();
      setProjects(allProjects);
    };
    
    fetchProjects();
    
    // Simple way to keep it in sync, although Dexie-react-hooks would be better
    const interval = setInterval(fetchProjects, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const res = await fetch('/api/system/update');
      const data = await res.json();
      if (data.upToDate) {
        alert(`System is up to date (v${data.version})`);
      } else {
        alert(`Update available! Current version: v${data.version}`);
      }
    } catch (error) {
      alert('Failed to check for updates');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleNewProject = async () => {
    const id = crypto.randomUUID();
    const newProject: Project = {
      id,
      name: `Untitled Project ${projects.length + 1}`,
      colors: { primary: '#0078d4', secondary: '#000000' },
      logoPadding: 0,
      bgMode: 'solid',
      logoVariant: 'original',
      updatedAt: Date.now(),
    };
    
    await db.projects.add(newProject);
    router.push(`/?project=${id}`);
  };

  const handleSelectProject = (id: string) => {
    router.push(`/?project=${id}`);
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      await db.projects.delete(id);
      if (selectedProjectId === id) {
        router.push('/');
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-500">
          <Zap className="w-8 h-8 fill-current" />
          <h2 className="text-xl font-black tracking-tight text-black dark:text-white">BrandingOS</h2>
        </div>
        
        <button
          onClick={handleNewProject}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-md focus:ring-1 focus:ring-blue-500 transition-all text-black dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Projects</h3>
          {filteredProjects.length === 0 ? (
            <p className="px-3 py-4 text-sm text-zinc-400 italic">No projects found</p>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleSelectProject(project.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all ${
                  selectedProjectId === project.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder className={`w-4 h-4 shrink-0 ${selectedProjectId === project.id ? 'text-blue-500' : 'text-zinc-400'}`} />
                  <span className="truncate text-sm">{project.name}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteProject(project.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <button
          onClick={handleCheckUpdate}
          disabled={checkingUpdate}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md transition-all disabled:opacity-50"
        >
          {checkingUpdate ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Settings className="w-4 h-4" />
          )}
          System Settings
        </button>
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Local Storage Ready
        </div>
      </div>
    </aside>
  );
}
