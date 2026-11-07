import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Files, Scissors, Minimize2, Image, FileImage, RotateCw, Trash2, Lock, Unlock, Stamp } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';

interface RelatedToolsProps {
  currentToolId: string;
  relatedIds: string[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Files,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  Stamp
};

export const RelatedTools: React.FC<RelatedToolsProps> = ({ relatedIds }) => {
  const tools = relatedIds
    .map(id => TOOLS_DATA[id])
    .filter(Boolean);

  if (tools.length === 0) return null;

  return (
    <section className="w-full mt-16 pt-12 border-t border-slate-200">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Explore Related PDF Tools
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Discover more free, in-browser PDF utilities built for security and privacy.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const IconComponent = ICON_MAP[tool.iconName] || Files;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="group p-5 bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors mb-1.5">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Use Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
