import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { flowchartApi } from '@/api/flowchartApi';
import { FlowchartData } from '@/redux/slices/flowchartSlice';

export const useFlowchartsByPlan = (monthlyPlanId: string | null) => {
  const [flowcharts, setFlowcharts] = useState<FlowchartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!monthlyPlanId) {
      setFlowcharts([]);
      return;
    }

    const fetchFlowcharts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await flowchartApi.getFlowchartsByMonthlyPlan(monthlyPlanId);
        setFlowcharts(response.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch flowcharts');
        setFlowcharts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlowcharts();
  }, [monthlyPlanId]);

  return { flowcharts, isLoading, error };
};
