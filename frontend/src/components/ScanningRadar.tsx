import React from 'react';
import { motion } from 'framer-motion';

const ScanningRadar = ({ status = 'SAFE' }) => {
  const isDanger = status === 'UNDER_ATTACK';
  const color = isDanger ? 'var(--secondary)' : 'var(--primary-container)';

  return (
    <div className="radar-container" style={{
      width: '200px',
      height: '200px',
      position: 'relative',
      borderRadius: '50%',
      border: `1px solid ${color}`,
      background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Sweep */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '50%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${color})`,
          top: '50%',
          left: '50%',
          transformOrigin: 'left center',
          zIndex: 2
        }}
      />
      
      {/* Grid Rings */}
      {[40, 80, 120, 160].map(size => (
        <div key={size} style={{
          position: 'absolute',
          width: size,
          height: size,
          border: `1px solid ${color}33`,
          borderRadius: '50%'
        }} />
      ))}

      {/* Crosshair */}
      <div style={{ position: 'absolute', width: '100%', height: '1px', background: `${color}33` }} />
      <div style={{ position: 'absolute', width: '1px', height: '100%', background: `${color}33` }} />

      <span style={{ 
        color: color, 
        fontSize: '10px', 
        fontWeight: 'bold', 
        zIndex: 3,
        textShadow: `0 0 5px ${color}`
      }}>
        SYSTEM_{status}
      </span>
    </div>
  );
};

export default ScanningRadar;
