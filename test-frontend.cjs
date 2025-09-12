const http = require('http');

function testFrontend() {
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'TestSprite/1.0'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response received:');
      console.log(`Content length: ${data.length}`);
      console.log(`Contains HTML: ${data.includes('<html>')}`);
      console.log(`Contains React root: ${data.includes('id="root"')}`);
      console.log(`Contains Vite: ${data.includes('vite')}`);
      
      if (data.includes('<html>') && data.includes('id="root"')) {
        console.log('✅ Frontend is loading correctly!');
      } else {
        console.log('❌ Frontend is not loading correctly');
        console.log('First 500 chars:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Error:', err.message);
    console.error('Error code:', err.code);
    console.error('Error details:', err);
  });

  req.setTimeout(5000, () => {
    console.log('❌ Request timeout');
    req.destroy();
  });

  req.end();
}

console.log('Testing frontend at http://localhost:5173...');
testFrontend();
