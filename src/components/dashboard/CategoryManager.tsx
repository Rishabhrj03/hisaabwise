import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/context/ExpenseContext';
import { Category } from '@/types';

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const EMOJI_LIST = [
    // Objects
    '🏷️', '📦', '🎁', '🛍️', '🛒', '🎫', '🎟️', '📚', '🎒', '🎓',
    '💼', '📁', '📅', '📝', '📌', '📎', '🔒', '🔑', '🔓', '🔨',
    '🔧', '🔫', '💣', '🔪', '🛡️', '🚬', '⚰️', '🪦', '🏺', '🔮',

    // Food & Drink
    '🍔', '🍕', '🌮', '🌯', '🥗', '🍝', '🍜', '🍲', '🍱', '🥘',
    '🥪', '🍛', '🍣', '🍤', '🥡', '🥟', '🥞', '🧇', '🍖',
    '🍗', '🥩', '🥓', '🍞', '🥐', '🥖', '🥨', '🥯', '🧀', '🥬',
    '🥦', '🍄', '🌽', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇',
    '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
    '🍆', '🥑', '🥜', '🌰', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧',
    '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵',
    '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤',

    // Transport & Places
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
    '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🦼', '🦽', '🛴', '🛹',
    '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋',
    '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉',
    '🚁', '🛩️', '✈️', '🛫', '🛬', '🚀', '🛰️', '🛸', '🛶', '⛵',
    '🛥️', '🚤', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥',
    '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪',
    '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌',
    '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄',

    // Activities & Sports
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
    '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁',
    '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️',
    '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️',
    '🤾', '🧗', '🧘', '🛀', '🛌', '🧖', '💆', '💇', '🚶', '🏃',
    '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸',
    '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩',

    // Tech & Devices
    '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
    '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
    '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
    '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',
    '🔌', '💡', '🔦', '🕯️', '🪔',

    // Health & Body
    '💊', '💉', '🩸', '🦠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
    '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱',

    // Nature & Animals
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

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
    const { categories, addCategory, updateCategory, deleteCategory } = useExpenses();
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', color: '#3498DB', icon: '🏷️' });
    const [loading, setLoading] = useState(false);

    const UNIQUE_EMOJI_LIST = React.useMemo(
        () => [...new Set(EMOJI_LIST)],
        []
    );

    const resetForm = () => {
        setFormData({ name: '', color: '#3498DB', icon: '🏷️' });
        setEditingCategory(null);
        setView('list');
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, color: cat.color, icon: cat.icon || '🏷️' });
        setView('edit');
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({ name: '', color: '#3498DB', icon: '🏷️' });
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
        setLoading(false);
        resetForm();
    };

    const handleDelete = async (id: string, name: string) => {
        if (name === 'Other') return;
        if (confirm(`Delete category "${name}"? This action cannot be undone.`)) {
            await deleteCategory(id);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={view === 'list' ? "Manage Categories" : (editingCategory ? "Edit Category" : "New Category")}>
            <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>

                {view === 'list' ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <Button size="sm" onClick={handleCreate}>+ New Category</Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                            {categories.map(cat => (
                                <div key={cat._id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.75rem', borderRadius: '8px', background: 'var(--color-surface)',
                                    borderLeft: `4px solid ${cat.color}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>{cat.icon || '🏷️'}</span>
                                        <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                        {cat.is_default && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(Default)</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>✎</Button>
                                        {!cat.is_default && cat.name !== 'Other' && (
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(cat._id, cat.name)} style={{ color: 'red' }}>✕</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Name Input */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-main)'
                                }}
                                required
                                placeholder="Category Name"
                            />
                        </div>

                        {/* Icon Picker */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Icon</label>
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
                                gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem',
                                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)'
                            }}>
                                {UNIQUE_EMOJI_LIST.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // Directly update state, simple handler
                                            setFormData(prev => ({ ...prev, icon: emoji }));
                                        }}
                                        className="emoji-btn"
                                        style={{
                                            fontSize: '1.5rem',
                                            padding: '0.5rem',
                                            border: formData.icon === emoji ? '2px solid var(--color-primary)' : '1px solid transparent',
                                            background: formData.icon === emoji ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: formData.icon === emoji ? '0 0 0 2px rgba(var(--color-primary-rgb), 0.2)' : 'none'
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Color</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                                {COLOR_LIST.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFormData({ ...formData, color: color });
                                        }}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: color,
                                            border: formData.color === color ? '3px solid white' : '2px solid transparent',
                                            boxShadow: formData.color === color ? '0 0 0 2px var(--color-text-main)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s'
                                        }}
                                        title={color}
                                    />
                                ))}
                            </div>

                            {/* Custom Color Bar */}
                            <div style={{ position: 'relative', width: '100%', height: '40px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    style={{
                                        border: 'none',
                                        padding: 0,
                                        width: '100%',
                                        height: '100%',
                                        cursor: 'pointer',
                                        background: 'none',
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '20px',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    Custom Color Picker
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                            </Button>
                        </div>

                    </form>
                )}
            </div>
        </Modal>
    );
}
