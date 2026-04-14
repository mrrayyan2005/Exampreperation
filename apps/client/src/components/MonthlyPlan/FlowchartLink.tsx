import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Plus, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlowchartsByPlan } from '@/hooks/useFlowchartsByPlan';

interface FlowchartLinkProps {
  monthlyPlanId: string;
  monthlyPlanSubject: string;
}

export const FlowchartLink: React.FC<FlowchartLinkProps> = ({ monthlyPlanId, monthlyPlanSubject }) => {
  const navigate = useNavigate();
  const { flowcharts, isLoading } = useFlowchartsByPlan(monthlyPlanId);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreateFlowchart = () => {
    navigate(`/flowcharts/new?linkedTo=${monthlyPlanId}&subject=${encodeURIComponent(monthlyPlanSubject)}`);
  };

  const handleViewFlowchart = (flowchartId: string) => {
    navigate(`/flowcharts/${flowchartId}`);
  };

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <GitBranch className="h-3 w-3 animate-pulse" />
        Loading flowcharts...
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Flowcharts</span>
          {flowcharts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {flowcharts.length}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateFlowchart}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Create
        </Button>
      </div>

      {flowcharts.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between h-7 text-xs"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>{isExpanded ? 'Hide' : 'Show'} {flowcharts.length} flowchart{flowcharts.length > 1 ? 's' : ''}</span>
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          {isExpanded && (
            <div className="space-y-1.5 pl-1">
              {flowcharts.map((flowchart) => (
                <div
                  key={flowchart.id}
                  className="flex items-center justify-between p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{flowchart.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{flowchart.concept}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewFlowchart(flowchart.id)}
                    className="h-6 w-6 p-0 ml-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlowchartLink;
