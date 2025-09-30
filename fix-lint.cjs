const fs = require('fs');
const path = require('path');

// Função para corrigir o arquivo
function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Arquivo não encontrado: ${fullPath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Substituir (req as any).user.id por req.user?.id as string
    content = content.replace(/\(req as any\)\.user\.id/g, 'req.user?.id as string');
    
    // Substituir (req as any).user por req.user
    content = content.replace(/\(req as any\)\.user(?!\.id)/g, 'req.user');
    
    // Substituir req.query as any por req.query as Record<string, string>
    content = content.replace(/req\.query as any/g, 'req.query as Record<string, string>');
    
    // Substituir : any por : unknown
    content = content.replace(/: any(\s*[,;)])/g, ': unknown$1');
    
    // Remover importação de AuthenticatedRequest se não for usada
    if (content.includes('AuthenticatedRequest') && !content.includes('req: AuthenticatedRequest')) {
      content = content.replace(
        /, AuthenticatedRequest/g,
        ''
      );
    }
    
    // Adicionar tipagem para req nas rotas
    content = content.replace(
      /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]\s*,\s*authMiddleware\s*,\s*(?:\[[^\]]+\]\s*,\s*)?async\s*\(\s*req\s*,/g,
      'router.$1(\'$2\', authMiddleware, $3async (req: Request,'
    );
    
    // Adicionar import de Request se necessário
    if (content.includes('req: Request') && !content.includes('import { Request }')) {
      content = content.replace(
        /import express from 'express';/g,
        'import express, { Request } from \'express\';'
      );
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`Arquivo corrigido: ${filePath}`);
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error);
  }
}

// Lista de arquivos para corrigir
const files = [
  'api/mobile/routes/addresses.ts',
  'api/mobile/routes/auth.ts',
  'api/mobile/routes/cart.ts',
  'api/mobile/routes/categories.ts',
  'api/mobile/routes/coupons.ts',
  'api/mobile/routes/notifications.ts',
  'api/mobile/routes/orders.ts',
  'api/mobile/routes/payments.ts',
  'api/mobile/routes/products.ts',
  'api/mobile/routes/reviews.ts',
  'api/mobile/routes/users.ts',
  'api/mobile/types/order.ts'
];

// Corrigir cada arquivo
files.forEach(fixFile);

console.log('Correções concluídas!');