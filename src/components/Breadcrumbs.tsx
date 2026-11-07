import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: Array<{
    label: string;
    path?: string;
  }>;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-slate-500 mb-6">
      <ol className="flex items-center flex-wrap gap-2">
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-slate-600 font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="hover:text-blue-600 transition-colors text-slate-600 font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
