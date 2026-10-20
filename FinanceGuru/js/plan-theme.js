try { const theme = localStorage.getItem('fg-theme'); if (['light', 'dark'].includes(theme)) document.documentElement.dataset.theme = theme; } catch { /* Use the system preference. */ }
