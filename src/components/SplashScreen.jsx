import React, { useEffect, useState } from 'react';
import { Plane, Radio } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for exit animation
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'var(--bg-darker)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                >
                    {/* Background decoration */}
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 40%)
            `,
                    }} />

                    {/* Logo Container */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "backOut" }}
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', zIndex: 10 }}
                    >
                        {/* Plane Icon Animation */}
                        <div style={{ position: 'relative' }}>
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{
                                    background: 'var(--accent-cyan)',
                                    padding: '1.5rem',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)'
                                }}
                            >
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                                </svg>
                            </motion.div>
                        </div>

                        {/* Title */}
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{
                                fontSize: '3.5rem',
                                fontWeight: '800',
                                marginBottom: '0.5rem',
                                letterSpacing: '-1px'
                            }}>
                                Astur<span className="text-gradient">Fly</span>
                            </h1>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    justifyContent: 'center',
                                    color: '#94a3b8',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <Radio size={14} className="text-gradient" />
                                CONNECTING TO OVD TOWER...
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '200px' }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        style={{
                            height: '4px',
                            background: 'linear-gradient(90deg, var(--accent-cyan), #3b82f6)',
                            borderRadius: '2px',
                            marginTop: '4rem',
                            boxShadow: '0 0 10px rgba(6,182,212,0.5)',
                            zIndex: 10
                        }}
                    />

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 1, duration: 1 }}
                        style={{
                            position: 'absolute',
                            bottom: '2rem',
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '2px',
                            zIndex: 10
                        }}
                    >
                        OVD REALTIME MONITORING SYSTEM | v1.0 | ASTURFLY By Jose Álvarez Dev
                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
