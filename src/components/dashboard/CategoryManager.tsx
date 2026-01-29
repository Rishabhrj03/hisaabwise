import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function CategoryManager() {
    const { categories, addCategory, deleteCategory } = useExpenses();
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#3498DB'); // Default Blue
    const [showAdd, setShowAdd] = useState(false);

    const handleAdd = async () => {
        if (!newCatName.trim()) return;
        await addCategory(newCatName, newCatColor);
        setNewCatName('');
        setShowAdd(false);
    };

    return (
        <Card variant="glass" title="Categories 🏷️" defaultOpen={false}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {categories.map((cat) => (
                    <div
                        key={cat._id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            border: `1px solid ${cat.color}40`
                        }}
                    >
                        <div
                            style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: cat.color,
                                flexShrink: 0
                            }}
                        />
                        <span style={{ fontSize: '0.875rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                        {!cat.name.match(/^Other$/i) && !cat.is_default && (
                            <button
                                onClick={() => deleteCategory(cat._id)}
                                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0 4px' }}
                                title="Delete"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                ))}

                <button
                    onClick={() => setShowAdd(!showAdd)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px dashed #666',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'inherit'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span>
                    <span style={{ fontSize: '0.875rem' }}>Add</span>
                </button>
            </div>

            {showAdd && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>New Category</div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Name</label>
                        <Input
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="e.g. Pet Care"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={newCatColor}
                                onChange={(e) => setNewCatColor(e.target.value)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: 0,
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: 'none'
                                }}
                            />
                            <div style={{ fontSize: '0.875rem', color: '#888' }}>{newCatColor}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button size="sm" onClick={handleAdd} disabled={!newCatName.trim()}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
