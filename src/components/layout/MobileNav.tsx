import React from 'react';
import { Home, Users, Layers, PieChart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MobileNavProps {
    onShowStats: () => void;
    onShowFriends: () => void;
    onShowGroups: () => void;
    onShowCategories: () => void;
    onShare: () => void;
    currentView?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
    onShowStats,
    onShowFriends,
    onShowGroups,
    onShowCategories,
    onShare
}) => {
    return (
        <div className="glass-panel hide-on-desktop" style={{
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            zIndex: 90,
            padding: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.9)', // More opaque for visibility
            boxShadow: '0 -5px 20px rgba(0,0,0,0.1)'
        }}>
            <Button variant="ghost" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.7rem', padding: '0.5rem' }}>
                <Home size={20} />
                <span>Home</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={onShowStats} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.7rem', padding: '0.5rem' }}>
                <PieChart size={20} />
                <span>Stats</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={onShowFriends} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.7rem', padding: '0.5rem' }}>
                <Users size={20} />
                <span>Friends</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={onShowCategories} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.7rem', padding: '0.5rem' }}>
                <Layers size={20} />
                <span>Cats</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={onShare} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.7rem', padding: '0.5rem' }}>
                <Share2 size={20} />
                <span>Share</span>
            </Button>
        </div>
    );
};
