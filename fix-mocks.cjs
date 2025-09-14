const fs = require('fs');
const path = require('path');

const testFiles = [
  'src/services/__tests__/subscriptionPlansService.test.ts',
  'src/services/__tests__/userSubscriptionsService.test.ts',
  'src/services/__tests__/chatService.test.ts',
  'src/services/__tests__/helpService.test.ts',
  'src/services/__tests__/petsService.simple.test.ts'
];

testFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace mockQueryBuilder with mockSupabase.from()
    content = content.replace(/mockQueryBuilder\./g, 'mockSupabase.from().');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Reverted mocks in ${filePath}`);
  }
});

console.log('All mock reverts completed!');