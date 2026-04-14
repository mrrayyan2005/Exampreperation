import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';

// Define the hooks here to avoid circular dependencies
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <TSelected>(selector: (state: RootState) => TSelected): TSelected =>
    useSelector<RootState, TSelected>(selector);
