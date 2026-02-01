import React, { useState } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/context/ExpenseContext';
import { Category } from '@/types';
import {
    ShoppingBag, Utensils, Car, Plane, GraduationCap,
    HeartPulse, Gamepad2, Smartphone, Shirt, Gift,
    Briefcase, Banknote, Receipt, Zap, Hammer,
    PawPrint, Baby, Coffee, Music, LayoutGrid,
    Home, Wifi, Dumbbell, BookOpen, Crown,
    LucideIcon
} from 'lucide-react';

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- Data Constants ---
const EMOJI_CATEGORIES = [
    {
        name: 'Objects',
        emojis: [
            '🏷️', '📦', '🎁', '🛍️', '🛒', '🎫', '🎟️', '📚', '🎒', '🎓',
            '💼', '📁', '📅', '📝', '📌', '📎', '🔒', '🔑', '🔓', '🔨',
            '🔧', '🔫', '💣', '🔪', '🛡️', '🚬', '⚰️', '🪦', '🏺', '🔮',
        ]
    },
    {
        name: 'Food',
        emojis: [
            '🍔', '🍕', '🌮', '🌯', '🥗', '🍝', '🍜', '🍲', '🍱', '🥘',
            '🥪', '🍛', '🍣', '🍤', '🥡', '🥟', '🥞', '🧇', '🍖',
            '🍗', '🥩', '🥓', '🍞', '🥐', '🥖', '🥨', '🥯', '🧀', '🥬',
            '🥦', '🍄', '🌽', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇',
            '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
            '🍆', '🥑', '🥜', '🌰', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧',
            '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵',
            '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤',
        ]
    },
    {
        name: 'Travel',
        emojis: [
            '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
            '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🦼', '🦽', '🛴', '🛹',
            '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋',
            '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉',
            '🚁', '🛩️', '✈️', '🛫', '🛬', '🚀', '🛰️', '🛸', '🛶', '⛵',
            '🛥️', '🚤', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥',
            '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪',
            '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌',
            '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄',
        ]
    },
    {
        name: 'Activity',
        emojis: [
            '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
            '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁',
            '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️',
            '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️',
            '🤾', '🧗', '🧘', '🛀', '🛌', '🧖', '💆', '💇', '🚶', '🏃',
            '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸',
            '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩',
        ]
    },
    {
        name: 'Tech',
        emojis: [
            '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
            '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
            '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
            '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',
            '🔌', '💡', '🔦', '🕯️', '🪔',
        ]
    },
    {
        name: 'Health',
        emojis: [
            '💊', '💉', '🩸', '🦠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
            '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱',
        ]
    },
    {
        name: 'Nature',
        emojis: [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
            '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
            '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
            '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕',
            '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
            '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘',
            '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄',
            '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮',
            '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️',
            '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'
        ]
    }
];

const COLOR_LIST = [
    // Reds & Pinks
    '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#F87171', '#FCA5A5',
    '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#F472B6', '#FBCFE8',
    '#F43F5E', '#E11D48', '#BE123C', '#9F1239', '#FB7185', '#FDA4AF',

    // Oranges & Yellows
    '#F97316', '#EA580C', '#C2410C', '#9A3412', '#FB923C', '#FDBA74',
    '#F59E0B', '#D97706', '#B45309', '#92400E', '#FBBF24', '#FDE68A',
    '#EAB308', '#CA8A04', '#A16207', '#854D0E', '#FACC15', '#FEF08A',

    // Greens & Teals
    '#84CC16', '#65A30D', '#4D7C0F', '#3F6212', '#A3E635', '#BEF264',
    '#22C55E', '#16A34A', '#15803D', '#166534', '#4ADE80', '#86EFAC',
    '#10B981', '#059669', '#047857', '#065F46', '#34D399', '#6EE7B7',
    '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#2DD4BF', '#5EEAD4',

    // Blues & Cyans
    '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#22D3EE', '#67E8F9',
    '#0EA5E9', '#0284C7', '#0369A1', '#075985', '#38BDF8', '#7DD3FC',
    '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#60A5FA', '#93C5FD',
    '#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#818CF8', '#A5B4FC',

    // Purples & Violets
    '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#A78BFA', '#C4B5FD',
    '#A855F7', '#9333EA', '#7E22CE', '#6B21A8', '#C084FC', '#D8B4FE',
    '#D946EF', '#C026D3', '#A21CAF', '#86198F', '#E879F9', '#F0ABFC',

    // Grayscale / Neutrals
    '#64748B', '#475569', '#334155', '#1E293B', '#94A3B8', '#CBD5E1',
    '#71717A', '#52525B', '#3F3F46', '#27272A', '#A1A1AA', '#D4D4D8',
    '#78716C', '#57534E', '#44403C', '#292524', '#A8A29E', '#D6D3D1',
];

const ICON_MAP: Record<string, LucideIcon> = {
    'Home': Home, 'Shopping': ShoppingBag, 'Food': Utensils, 'Transport': Car,
    'Travel': Plane, 'Education': GraduationCap, 'Health': HeartPulse, 'Entertainment': Gamepad2,
    'Tech': Smartphone, 'Clothing': Shirt, 'Gift': Gift, 'Work': Briefcase,
    'Salary': Banknote, 'Bills': Receipt, 'Utilities': Zap, 'Tools': Hammer,
    'Pets': PawPrint, 'Kids': Baby, 'Coffee': Coffee, 'Music': Music,
    'General': LayoutGrid, 'Internet': Wifi, 'Fitness': Dumbbell, 'Books': BookOpen,
    'Premium': Crown
};

// Helper to render icon safely
const CategoryIcon = ({ icon, size = 24, color = 'currentColor' }: { icon: string, size?: number, color?: string }) => {
    const IconComponent = ICON_MAP[icon];
    if (IconComponent) {
        return <IconComponent size={size} color={color} />;
    }
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{icon || '🏷️'}</span>;
};

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
    const { categories, addCategory, updateCategory, deleteCategory } = useExpenses();
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', color: '#3B82F6', icon: 'General' });
    const [loading, setLoading] = useState(false);

    // UI States
    const [iconType, setIconType] = useState<'icons' | 'emojis'>('icons');
    const [activeEmojiTab, setActiveEmojiTab] = useState(EMOJI_CATEGORIES[0].name);

    const resetForm = () => {
        setFormData({ name: '', color: '#3B82F6', icon: 'General' });
        setEditingCategory(null);
        setView('list');
        setIconType('icons');
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, color: cat.color, icon: cat.icon || 'General' });
        setView('edit');
        if (ICON_MAP[cat.icon || '']) {
            setIconType('icons');
        } else {
            setIconType('emojis');
        }
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({ name: '', color: '#3B82F6', icon: 'General' });
        setView('edit');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (editingCategory) {
            await updateCategory(editingCategory._id, formData.name, formData.color, formData.icon);
        } else {
            await addCategory(formData.name, formData.color, formData.icon);
        }

        sendGTMEvent({
            event: 'category_managed',
            value: {
                action: editingCategory ? 'updated' : 'created',
                name: formData.name
            }
        });

        setLoading(false);
        resetForm();
    };

    const handleDelete = async (id: string, name: string) => {
        if (name === 'Other') return;
        if (confirm(`Delete category "${name}"? This action cannot be undone.`)) {
            await deleteCategory(id);
            sendGTMEvent({ event: 'category_deleted', value: { category_id: id } });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={view === 'list' ? "Manage Categories" : (editingCategory ? "Edit Category" : "New Category")}>
            {/* The root container fixes the height so the modal never overflows */}
            <div style={{ maxHeight: '72vh', display: 'flex', flexDirection: 'column' }}>

                {view === 'list' ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <Button size="sm" onClick={handleCreate}>+ New Category</Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.25rem', flex: 1 }}>
                            {categories.map(cat => (
                                <div key={cat._id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.75rem', borderRadius: '10px', background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: `${cat.color}15`, color: cat.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <CategoryIcon icon={cat.icon || 'General'} size={20} color={cat.color} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>✎</Button>
                                        {!cat.is_default && cat.name !== 'Other' && (
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(cat._id, cat.name)} style={{ color: 'var(--hue-danger)' }}>✕</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

                        {/* 1. Header Area: Preview + Input (Fixed at top) */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexShrink: 0 }}>
                            {/* Compact Preview Card */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '60px', height: '60px', borderRadius: '14px',
                                background: formData.color,
                                color: 'white',
                                boxShadow: `0 4px 10px ${formData.color}60`,
                                flexShrink: 0
                            }}>
                                <CategoryIcon icon={formData.icon} size={28} color="white" />
                            </div>

                            {/* Wide Name Input */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>NAME</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-background)',
                                        color: 'var(--color-text-main)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'hsl(var(--color-primary))'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                    required
                                    placeholder="e.g. Shopping"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* 2. Middle Area: Icon Picker (Flexible & Scrollable) */}
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                            borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem'
                        }}>
                            {/* Sticky Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-hover)' }}>
                                <button
                                    type="button"
                                    onClick={() => setIconType('icons')}
                                    style={{
                                        flex: 1, padding: '0.75rem',
                                        fontWeight: iconType === 'icons' ? 600 : 400,
                                        color: iconType === 'icons' ? 'hsl(var(--color-text-main))' : 'var(--color-text-muted)',
                                        background: iconType === 'icons' ? 'var(--color-surface)' : 'none',
                                        border: 'none', cursor: 'pointer',
                                        borderBottom: iconType === 'icons' ? `2px solid ${formData.color}` : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ✨ Icons
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIconType('emojis')}
                                    style={{
                                        flex: 1, padding: '0.75rem',
                                        fontWeight: iconType === 'emojis' ? 600 : 400,
                                        color: iconType === 'emojis' ? 'hsl(var(--color-text-main))' : 'var(--color-text-muted)',
                                        background: iconType === 'emojis' ? 'var(--color-surface)' : 'none',
                                        border: 'none', cursor: 'pointer',
                                        borderBottom: iconType === 'emojis' ? `2px solid ${formData.color}` : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    😀 Emojis
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                                {iconType === 'icons' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: '0.75rem' }}>
                                        {Object.keys(ICON_MAP).map(iconKey => {
                                            const IconComp = ICON_MAP[iconKey];
                                            const isSelected = formData.icon === iconKey;
                                            return (
                                                <button
                                                    key={iconKey}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, icon: iconKey }))}
                                                    style={{
                                                        aspectRatio: '1',
                                                        border: isSelected ? `2px solid ${formData.color}` : '1px solid var(--color-border)',
                                                        background: isSelected ? `${formData.color}15` : 'var(--color-background)',
                                                        color: isSelected ? formData.color : 'var(--color-text-muted)',
                                                        cursor: 'pointer', borderRadius: '10px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.1s'
                                                    }}
                                                >
                                                    <IconComp size={20} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Horizontal Category Scroll */}
                                        <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '0.25rem', gap: '0.5rem', scrollbarWidth: 'none', position: 'sticky', top: '-1rem', background: 'var(--color-surface)', zIndex: 1, padding: '0.5rem 0' }}>
                                            {EMOJI_CATEGORIES.map(cat => (
                                                <button key={cat.name} type="button" onClick={() => setActiveEmojiTab(cat.name)}
                                                    style={{
                                                        whiteSpace: 'nowrap', background: activeEmojiTab === cat.name ? `${formData.color}20` : 'var(--color-border)',
                                                        border: 'none', borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem',
                                                        color: activeEmojiTab === cat.name ? formData.color : 'var(--color-text-muted)',
                                                        fontWeight: activeEmojiTab === cat.name ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s'
                                                    }}>
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))', gap: '0.5rem' }}>
                                            {EMOJI_CATEGORIES.find(c => c.name === activeEmojiTab)?.emojis.map(emoji => (
                                                <button
                                                    key={emoji} type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                                                    style={{
                                                        fontSize: '1.5rem', aspectRatio: '1', borderRadius: '8px', cursor: 'pointer',
                                                        border: formData.icon === emoji ? `2px solid ${formData.color}` : '1px solid transparent',
                                                        background: formData.icon === emoji ? `${formData.color}15` : 'transparent',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Bottom Area: Colors + Actions (Fixed) */}
                        <div style={{ flexShrink: 0 }}>
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(24px, 1fr))', gap: '0.5rem',
                                padding: '0.5rem 0', overflowY: 'auto', maxHeight: '70px', marginBottom: '1rem',
                                scrollbarWidth: 'thin'
                            }}>
                                {COLOR_LIST.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: color })}
                                        style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: color,
                                            border: formData.color === color ? '2px solid white' : 'none',
                                            boxShadow: formData.color === color ? `0 0 0 2px ${color}` : 'none',
                                            cursor: 'pointer', transform: formData.color === color ? 'scale(1.2)' : 'scale(1)',
                                            transition: 'transform 0.1s'
                                        }}
                                        title={color}
                                    />
                                ))}
                                {/* Custom Color Input Hidden in a Circle */}
                                <div style={{ position: 'relative', width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        style={{ border: 'none', padding: 0, width: '150%', height: '150%', cursor: 'pointer', transform: 'translate(-25%, -25%)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                                <Button type="submit" disabled={loading} style={{ background: formData.color, minWidth: '100px' }}>
                                    {loading ? '...' : (editingCategory ? 'Update' : 'Create')}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
