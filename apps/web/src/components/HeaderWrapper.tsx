'use client'

import dynamic from "next/dynamic";

// Dynamically import Header to prevent SSR hydration issues
const Header = dynamic(() => import("@/components/Header").then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => (
    <header style={{ 
      background: 'white', 
      borderBottom: '1px solid #e2e8f0', 
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
        TTI Survey Platform
      </div>
      <button disabled style={{ 
        background: '#f3f4f6', 
        border: '1px solid #d1d5db', 
        padding: '8px 16px', 
        borderRadius: '6px', 
        color: '#6b7280' 
      }}>
        Loading...
      </button>
    </header>
  )
});

export function HeaderWrapper() {
  return <Header />
}