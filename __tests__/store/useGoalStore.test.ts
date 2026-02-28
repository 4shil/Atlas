import { act, renderHook } from '@testing-library/react-native';
import { useGoalStore } from '../../src/store/useGoalStore';

// Reset store state before each test
beforeEach(() => {
    useGoalStore.getState().clearGoals();
});

describe('useGoalStore', () => {
    it('starts with empty goals', () => {
        const { result } = renderHook(() => useGoalStore());
        expect(result.current.goals).toHaveLength(0);
    });

    it('addGoal adds a goal and returns an id', () => {
        const { result } = renderHook(() => useGoalStore());
        let id: string;
        act(() => {
            id = result.current.addGoal({
                title: 'Visit Tokyo',
                description: 'Cherry blossoms',
                category: 'Travel',
                image: 'https://example.com/tokyo.jpg',
                timelineDate: new Date('2027-04-01').toISOString(),
                notes: '',
                location: { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan' },
            });
        });
        expect(id!).toBeTruthy();
        expect(result.current.goals).toHaveLength(1);
        expect(result.current.goals[0].title).toBe('Visit Tokyo');
        expect(result.current.goals[0].completed).toBe(false);
        expect(result.current.goals[0].completedAt).toBeNull();
    });

    it('updateGoal updates fields correctly', () => {
        const { result } = renderHook(() => useGoalStore());
        let id: string;
        act(() => {
            id = result.current.addGoal({
                title: 'Visit Tokyo',
                description: '',
                category: 'Travel',
                image: '',
                timelineDate: new Date('2027-04-01').toISOString(),
                notes: '',
                location: { latitude: 0, longitude: 0, city: '', country: '' },
            });
        });
        act(() => {
            result.current.updateGoal(id!, { title: 'Visit Kyoto', notes: 'Bamboo forest' });
        });
        const updated = result.current.goals.find(g => g.id === id);
        expect(updated?.title).toBe('Visit Kyoto');
        expect(updated?.notes).toBe('Bamboo forest');
    });

    it('deleteGoal removes the goal', () => {
        const { result } = renderHook(() => useGoalStore());
        let id: string;
        act(() => {
            id = result.current.addGoal({
                title: 'Surf in Bali',
                description: '',
                category: 'Adventure',
                image: '',
                timelineDate: new Date('2027-06-01').toISOString(),
                notes: '',
                location: { latitude: 0, longitude: 0, city: '', country: '' },
            });
        });
        act(() => { result.current.deleteGoal(id!); });
        expect(result.current.goals).toHaveLength(0);
    });

    it('toggleComplete marks goal as completed with timestamp', () => {
        const { result } = renderHook(() => useGoalStore());
        let id: string;
        act(() => {
            id = result.current.addGoal({
                title: 'See Northern Lights',
                description: '',
                category: 'Travel',
                image: '',
                timelineDate: new Date('2027-01-01').toISOString(),
                notes: '',
                location: { latitude: 0, longitude: 0, city: '', country: '' },
            });
        });
        act(() => { result.current.toggleComplete(id!); });
        const goal = result.current.goals.find(g => g.id === id);
        expect(goal?.completed).toBe(true);
        expect(goal?.completedAt).not.toBeNull();
    });

    it('toggleComplete uncompletes a completed goal', () => {
        const { result } = renderHook(() => useGoalStore());
        let id: string;
        act(() => {
            id = result.current.addGoal({
                title: 'Skydive',
                description: '',
                category: 'Adventure',
                image: '',
                timelineDate: new Date('2027-03-01').toISOString(),
                notes: '',
                location: { latitude: 0, longitude: 0, city: '', country: '' },
            });
        });
        act(() => { result.current.toggleComplete(id!); });
        act(() => { result.current.toggleComplete(id!); });
        const goal = result.current.goals.find(g => g.id === id);
        expect(goal?.completed).toBe(false);
        expect(goal?.completedAt).toBeNull();
    });

    it('getCompletedGoals returns only completed goals', () => {
        const { result } = renderHook(() => useGoalStore());
        let id1: string, id2: string;
        act(() => {
            id1 = result.current.addGoal({ title: 'Goal 1', description: '', category: 'Travel', image: '', timelineDate: new Date('2027-01-01').toISOString(), notes: '', location: { latitude: 0, longitude: 0, city: '', country: '' } });
            id2 = result.current.addGoal({ title: 'Goal 2', description: '', category: 'Travel', image: '', timelineDate: new Date('2027-01-01').toISOString(), notes: '', location: { latitude: 0, longitude: 0, city: '', country: '' } });
        });
        act(() => { result.current.toggleComplete(id1!); });
        expect(result.current.getCompletedGoals()).toHaveLength(1);
        expect(result.current.getPendingGoals()).toHaveLength(1);
    });

    it('clearGoals removes all goals', () => {
        const { result } = renderHook(() => useGoalStore());
        act(() => {
            result.current.addGoal({ title: 'A', description: '', category: 'Travel', image: '', timelineDate: new Date('2027-01-01').toISOString(), notes: '', location: { latitude: 0, longitude: 0, city: '', country: '' } });
            result.current.addGoal({ title: 'B', description: '', category: 'Travel', image: '', timelineDate: new Date('2027-01-01').toISOString(), notes: '', location: { latitude: 0, longitude: 0, city: '', country: '' } });
        });
        act(() => { result.current.clearGoals(); });
        expect(result.current.goals).toHaveLength(0);
    });
});
