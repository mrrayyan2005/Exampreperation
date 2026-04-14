import React, { useState } from 'react';
import { Box, Fab, Tooltip, Zoom, Badge } from '@mui/material';
import { AutoAwesome, Close } from '@mui/icons-material';
import StudyCopilot from './StudyCopilot';

/**
 * CopilotFAB — Floating Action Button that opens/closes the Study Copilot.
 * Drop this into your app layout (e.g. MainLayout.tsx) to add the copilot
 * to every page.
 */
export default function CopilotFAB() {
    const [open, setOpen] = useState(false);

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 2,
            }}
        >
            {/* Chat panel */}
            <Zoom in={open} unmountOnExit>
                <Box>
                    <StudyCopilot onClose={() => setOpen(false)} />
                </Box>
            </Zoom>

            {/* FAB */}
            <Tooltip title={open ? 'Close Study Copilot' : 'Open Study Copilot'} placement="left">
                <Fab
                    onClick={() => setOpen((v) => !v)}
                    sx={{
                        width: 56,
                        height: 56,
                        background: open
                            ? 'rgba(255,255,255,0.1)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: open
                            ? '0 4px 20px rgba(0,0,0,0.3)'
                            : '0 8px 32px rgba(99,102,241,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            background: open
                                ? 'rgba(255,255,255,0.15)'
                                : 'linear-gradient(135deg, #5254cc 0%, #7c3aed 100%)',
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    {open ? (
                        <Close sx={{ color: '#fff', fontSize: 22 }} />
                    ) : (
                        <AutoAwesome sx={{ color: '#fff', fontSize: 22 }} />
                    )}
                </Fab>
            </Tooltip>
        </Box>
    );
}
