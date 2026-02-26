fetch('http://localhost:3000/api/payment/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: '1d' }) }).then(res => res.json()).then(console.log);
