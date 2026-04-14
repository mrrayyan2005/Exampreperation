import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface Project {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  color: string;
  icon?: React.ReactNode;
  avatarUrl?: string;
}

interface ProjectsTimelineProps {
  projects: Project[];
  className?: string;
}

export const ProjectsTimeline = ({
  projects,
  className,
}: ProjectsTimelineProps) => {
  const maxDuration = Math.max(...projects.map((p) => p.duration), 30);

  return (
    <Card className={cn(
      "bg-card border-border overflow-hidden",
      className
    )}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wider">
            Projects Timeline
          </h3>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {projects.map((project, idx) => {
            const barWidth = (project.duration / maxDuration) * 100;

            return (
              <div key={project.id} className="relative">
                {/* Date Label */}
                <div className="text-xs text-muted-foreground mb-1">
                  {format(parseISO(project.startDate), 'dd.MM')}
                </div>

                {/* Project Bar */}
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 rounded-full flex items-center gap-2 px-1.5"
                    style={{
                      width: `${Math.max(barWidth, 15)}%`,
                      minWidth: '120px',
                      backgroundColor: project.color,
                    }}
                  >
                    {/* Icon/Avatar */}
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {project.avatarUrl ? (
                        <img
                          src={project.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        project.icon || (
                          <span className="text-xs font-medium text-white">
                            {project.name.charAt(0)}
                          </span>
                        )
                      )}
                    </div>

                    {/* Project Name (if bar is wide enough) */}
                    {barWidth > 30 && (
                      <span className="text-xs font-medium text-white/90 truncate">
                        {project.name}
                      </span>
                    )}

                    {/* Duration Badge */}
                    <span className="text-xs font-medium text-white/80 ml-auto">
                      {project.duration}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span>30</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsTimeline;
