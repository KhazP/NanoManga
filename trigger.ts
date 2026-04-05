fetch('http://localhost:3000/api/generate-og').then(r => r.text()).then(console.log).catch(console.error);
