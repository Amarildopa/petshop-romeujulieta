# Guia de Implementação Passo a Passo: VPS Docker com n8n + FFmpeg + RTSP

## 🎯 Objetivo
Este guia te levará do zero até ter uma VPS funcionando com n8n, FFmpeg e servidor RTSP em Docker, com SSL e domínio configurado.

## 📋 Pré-requisitos
- VPS Ubuntu 20.04+ ou Debian 11+
- Domínio próprio (ex: meudominio.com)
- Acesso SSH à VPS
- Câmera RTSP funcionando

---

## 🚀 PASSO 1: Configuração Inicial da VPS

### 1.1 Conectar na VPS
```bash
ssh root@SEU_IP_VPS
```

### 1.2 Atualizar Sistema
```bash
apt update && apt upgrade -y
```

### 1.3 Instalar Dependências Básicas
```bash
apt install -y curl wget git nano ufw htop
```

### 1.4 Configurar Firewall
```bash
# Permitir SSH, HTTP e HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

### 1.5 Criar Usuário (Opcional mas Recomendado)
```bash
adduser deploy
usermod -aG sudo deploy
# Copiar chaves SSH se necessário
cp -r /root/.ssh /home/deploy/
chown -R deploy:deploy /home/deploy/.ssh
```

---

## 🐳 PASSO 2: Instalação do Docker

### 2.1 Instalar Docker
```bash
# Remover versões antigas
apt remove -y docker docker-engine docker.io containerd runc

# Instalar dependências
apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Iniciar e habilitar Docker
systemctl start docker
systemctl enable docker

# Adicionar usuário ao grupo docker
usermod -aG docker $USER
```

### 2.2 Instalar Docker Compose
```bash
# Baixar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

---

## 📁 PASSO 3: Estrutura de Diretórios

### 3.1 Criar Estrutura
```bash
# Criar diretório principal
mkdir -p /opt/petshop-streaming
cd /opt/petshop-streaming

# Criar estrutura completa
mkdir -p {\
  nginx/ssl,\
  rtsp-streaming,\
  volumes/{n8n,hls,nginx-logs},\
  scripts,\
  backup\
}

# Definir permissões
chmod 755 volumes/hls
chown -R 1000:1000 volumes/n8n
```

### 3.2 Estrutura Final
```
/opt/petshop-streaming/
├── docker-compose.yml
├── .env
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── rtsp-streaming/
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── volumes/
│   ├── n8n/
│   ├── hls/
│   └── nginx-logs/
├── scripts/
└── backup/
```

---

## ⚙️ PASSO 4: Variáveis de Ambiente

### 4.1 Criar arquivo .env
```bash
nano .env
```

### 4.2 Conteúdo do .env (PERSONALIZE TODOS OS VALORES)
```env
# ===========================================
# CONFIGURAÇÕES GERAIS
# ===========================================
DOMAIN=meudominio.com
TIMEZONE=America/Sao_Paulo

# ===========================================
# CONFIGURAÇÕES N8N
# ===========================================
N8N_USER=admin
N8N_PASSWORD=MinhaSenh@Segur@123
N8N_ENCRYPTION_KEY=minha-chave-de-criptografia-muito-segura-123

# ===========================================
# CONFIGURAÇÕES RTSP
# ===========================================
# Substitua pelo IP/URL da sua câmera
RTSP_URL=rtsp://192.168.0.53:554/stream
# Ou se sua câmera tem usuário/senha:
# RTSP_URL=rtsp://usuario:senha@192.168.0.53:554/stream

# ===========================================
# CONFIGURAÇÕES DE REDE
# ===========================================
# Portas internas (não alterar)
N8N_PORT=5678
RTSP_PORT=3001
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# ===========================================
# CONFIGURAÇÕES SSL
# ===========================================
SSL_EMAIL=seu-email@exemplo.com

# ===========================================
# CONFIGURAÇÕES DE SEGURANÇA
# ===========================================
# Gere uma senha forte para o banco (se usar)
POSTGRES_PASSWORD=SenhaPostgres123!

# ===========================================
# CONFIGURAÇÕES DE BACKUP
# ===========================================
BACKUP_RETENTION_DAYS=7
```

### 4.3 Proteger arquivo .env
```bash
chmod 600 .env
```

---

## 🐳 PASSO 5: Arquivos Docker

### 5.1 Criar docker-compose.yml
```bash
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: petshop-nginx
    ports:
      - "${NGINX_HTTP_PORT}:80"
      - "${NGINX_HTTPS_PORT}:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./volumes/nginx-logs:/var/log/nginx
      - hls-data:/var/www/hls:ro
    depends_on:
      - n8n
      - rtsp-streaming
    restart: unless-stopped
    networks:
      - petshop-network

  # n8n Automation Platform
  n8n:
    image: n8nio/n8n:latest
    container_name: petshop-n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${DOMAIN}
      - N8N_PORT=${N8N_PORT}
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${DOMAIN}/
      - GENERIC_TIMEZONE=${TIMEZONE}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    volumes:
      - n8n-data:/home/node/.n8n
    restart: unless-stopped
    networks:
      - petshop-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  # RTSP Streaming Service
  rtsp-streaming:
    build:
      context: ./rtsp-streaming
      dockerfile: Dockerfile
    container_name: petshop-rtsp
    environment:
      - NODE_ENV=production
      - RTSP_URL=${RTSP_URL}
      - HLS_PATH=/app/hls
      - SERVER_PORT=${RTSP_PORT}
    volumes:
      - hls-data:/app/hls
    restart: unless-stopped
    networks:
      - petshop-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  n8n-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./volumes/n8n
  hls-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./volumes/hls

networks:
  petshop-network:
    driver: bridge
```

### 5.2 Criar Dockerfile do RTSP
```bash
nano rtsp-streaming/Dockerfile
```

```dockerfile
FROM node:18-alpine

# Instalar FFmpeg e dependências
RUN apk add --no-cache \
    ffmpeg \
    curl \
    bash

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./

# Instalar dependências Node.js
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretório para arquivos HLS
RUN mkdir -p /app/hls && chmod 755 /app/hls

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Comando de inicialização
CMD ["node", "server.js"]
```

### 5.3 Criar package.json do RTSP
```bash
nano rtsp-streaming/package.json
```

```json
{
  "name": "petshop-rtsp-streaming",
  "version": "1.0.0",
  "description": "RTSP to HLS streaming server with FFmpeg for PetShop",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "fs-extra": "^11.1.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 5.4 Criar server.js do RTSP
```bash
nano rtsp-streaming/server.js
```

```javascript
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const RTSP_URL = process.env.RTSP_URL || 'rtsp://192.168.0.53:554/stream';
const HLS_PATH = process.env.HLS_PATH || '/app/hls';

console.log('🚀 Iniciando Servidor RTSP PetShop');
console.log('📺 RTSP URL:', RTSP_URL);
console.log('📁 HLS Path:', HLS_PATH);

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos HLS
app.use('/hls', express.static(HLS_PATH));

let ffmpegProcess = null;
let isStreaming = false;
let streamStartTime = null;

// Função para iniciar FFmpeg
function startFFmpeg() {
    if (ffmpegProcess) {
        console.log('⚠️ FFmpeg já está rodando');
        return;
    }

    // Garantir que o diretório HLS existe
    fs.ensureDirSync(HLS_PATH);
    console.log('📁 Diretório HLS criado/verificado:', HLS_PATH);

    const ffmpegArgs = [
        '-i', RTSP_URL,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '3',
        '-hls_flags', 'delete_segments',
        '-hls_allow_cache', '0',
        '-y',
        path.join(HLS_PATH, 'stream.m3u8')
    ];

    console.log('🎬 Iniciando FFmpeg...');
    console.log('📋 Argumentos:', ffmpegArgs.join(' '));
    
    ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
    isStreaming = true;
    streamStartTime = new Date();

    ffmpegProcess.stdout.on('data', (data) => {
        console.log(`📤 FFmpeg stdout: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('frame=')) {
            // Log de progresso mais limpo
            process.stdout.write('.');
        } else {
            console.log(`📥 FFmpeg: ${message.trim()}`);
        }
    });

    ffmpegProcess.on('close', (code) => {
        console.log(`\n🔚 FFmpeg process exited with code ${code}`);
        ffmpegProcess = null;
        isStreaming = false;
        streamStartTime = null;
        
        // Restart automaticamente em caso de erro
        if (code !== 0) {
            console.log('🔄 Reiniciando FFmpeg em 5 segundos...');
            setTimeout(startFFmpeg, 5000);
        }
    });

    ffmpegProcess.on('error', (error) => {
        console.error('❌ Erro no FFmpeg:', error);
        ffmpegProcess = null;
        isStreaming = false;
        streamStartTime = null;
    });
}

// Função para parar FFmpeg
function stopFFmpeg() {
    if (ffmpegProcess) {
        ffmpegProcess.kill('SIGTERM');
        ffmpegProcess = null;
        isStreaming = false;
        streamStartTime = null;
        console.log('⏹️ FFmpeg parado');
    }
}

// Rotas da API
app.get('/health', (req, res) => {
    const uptime = streamStartTime ? Math.floor((Date.now() - streamStartTime.getTime()) / 1000) : 0;
    res.json({ 
        status: 'ok', 
        streaming: isStreaming,
        uptime: uptime,
        timestamp: new Date().toISOString(),
        rtsp_url: RTSP_URL.replace(/:\/\/.*@/, '://***:***@') // Ocultar credenciais
    });
});

app.get('/stream/status', (req, res) => {
    const manifestPath = path.join(HLS_PATH, 'stream.m3u8');
    const manifestExists = fs.existsSync(manifestPath);
    
    let manifestSize = 0;
    let lastModified = null;
    
    if (manifestExists) {
        const stats = fs.statSync(manifestPath);
        manifestSize = stats.size;
        lastModified = stats.mtime;
    }
    
    res.json({
        streaming: isStreaming,
        manifestExists,
        manifestPath: manifestExists ? '/hls/stream.m3u8' : null,
        manifestSize,
        lastModified,
        uptime: streamStartTime ? Math.floor((Date.now() - streamStartTime.getTime()) / 1000) : 0
    });
});

app.post('/stream/start', (req, res) => {
    if (isStreaming) {
        return res.json({ message: '✅ Stream já está ativo', status: 'already_running' });
    }
    
    startFFmpeg();
    res.json({ message: '🚀 Stream iniciado', status: 'started' });
});

app.post('/stream/stop', (req, res) => {
    stopFFmpeg();
    res.json({ message: '⏹️ Stream parado', status: 'stopped' });
});

app.post('/stream/restart', (req, res) => {
    console.log('🔄 Reiniciando stream...');
    stopFFmpeg();
    setTimeout(() => {
        startFFmpeg();
        res.json({ message: '🔄 Stream reiniciado', status: 'restarted' });
    }, 2000);
});

// Rota para logs
app.get('/logs', (req, res) => {
    res.json({
        streaming: isStreaming,
        uptime: streamStartTime ? Math.floor((Date.now() - streamStartTime.getTime()) / 1000) : 0,
        rtsp_url: RTSP_URL.replace(/:\/\/.*@/, '://***:***@'),
        hls_path: HLS_PATH,
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌐 Servidor RTSP PetShop rodando na porta ${PORT}`);
    console.log(`📁 HLS Path: ${HLS_PATH}`);
    console.log(`📺 RTSP URL: ${RTSP_URL.replace(/:\/\/.*@/, '://***:***@')}`);
    
    // Iniciar streaming automaticamente após 2 segundos
    setTimeout(() => {
        console.log('🎬 Iniciando streaming automático...');
        startFFmpeg();
    }, 2000);
});

// Cleanup ao sair
process.on('SIGTERM', () => {
    console.log('📥 Recebido SIGTERM, parando FFmpeg...');
    stopFFmpeg();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📥 Recebido SIGINT, parando FFmpeg...');
    stopFFmpeg();
    process.exit(0);
});
```

---

## 🌐 PASSO 6: Configuração do Nginx

### 6.1 Criar nginx.conf
```bash
nano nginx/nginx.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # Upstream servers
    upstream n8n_backend {
        server n8n:5678;
    }
    
    upstream rtsp_backend {
        server rtsp-streaming:3001;
    }
    
    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }
    
    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name SEU_DOMINIO_AQUI;
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # n8n proxy
        location / {
            proxy_pass http://n8n_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # RTSP Streaming API
        location /api/rtsp/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://rtsp_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS headers
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";
        }
        
        # HLS streaming files
        location /hls/ {
            alias /var/www/hls/;
            
            # CORS headers for HLS
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";
            
            # Cache control for HLS
            location ~* \.m3u8$ {
                expires -1;
                add_header Cache-Control "no-cache, no-store, must-revalidate";
            }
            
            location ~* \.ts$ {
                expires 1h;
                add_header Cache-Control "public, immutable";
            }
        }
    }
}
```

**⚠️ IMPORTANTE:** Substitua `SEU_DOMINIO_AQUI` pelo seu domínio real!

---

## 🔐 PASSO 7: Configuração de Domínio e DNS

### 7.1 Configurar DNS
No painel do seu provedor de domínio, crie um registro A:

```
Tipo: A
Nome: @ (ou deixe vazio para domínio raiz)
Valor: IP_DA_SUA_VPS
TTL: 300 (ou padrão)
```

Para subdomínio (ex: petshop.meudominio.com):
```
Tipo: A
Nome: petshop
Valor: IP_DA_SUA_VPS
TTL: 300
```

### 7.2 Verificar Propagação DNS
```bash
# Aguarde alguns minutos e teste:
nslookup meudominio.com
dig meudominio.com
```

---

## 🔒 PASSO 8: Configuração SSL com Let's Encrypt

### 8.1 Instalar Certbot
```bash
apt install -y certbot
```

### 8.2 Criar Script SSL
```bash
nano scripts/ssl-setup.sh
```

```bash
#!/bin/bash
set -e

# Carregar variáveis do .env
source .env

echo "🔒 Configurando SSL para $DOMAIN..."

# Parar Nginx temporariamente
docker-compose stop nginx 2>/dev/null || true

# Obter certificado
echo "📜 Obtendo certificado SSL..."
certbot certonly --standalone \
    --email $SSL_EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Copiar certificados
echo "📋 Copiando certificados..."
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/

# Ajustar permissões
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem

echo "✅ SSL configurado com sucesso!"
echo "🔄 Agora você pode iniciar os containers com: docker-compose up -d"
```

### 8.3 Executar Script SSL
```bash
chmod +x scripts/ssl-setup.sh
./scripts/ssl-setup.sh
```

### 8.4 Configurar Renovação Automática
```bash
# Adicionar ao crontab
crontab -e

# Adicionar esta linha:
0 12 * * * /usr/bin/certbot renew --quiet && cd /opt/petshop-streaming && docker-compose restart nginx
```

---

## 🚀 PASSO 9: Deploy da Aplicação

### 9.1 Criar Script de Deploy
```bash
nano scripts/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando deploy do PetShop Streaming..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Arquivo docker-compose.yml não encontrado!"
    echo "Execute este script no diretório /opt/petshop-streaming"
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Configure o arquivo .env antes de continuar."
    exit 1
fi

# Carregar variáveis
source .env

echo "📋 Configurações carregadas:"
echo "   Domínio: $DOMAIN"
echo "   RTSP URL: $(echo $RTSP_URL | sed 's/:\/\/.*@/://***:***@/')"
echo "   Timezone: $TIMEZONE"

# Verificar certificados SSL
if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
    echo "⚠️ Certificados SSL não encontrados!"
    echo "Execute primeiro: ./scripts/ssl-setup.sh"
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down --remove-orphans 2>/dev/null || true

# Limpar imagens antigas
echo "🧹 Limpando imagens antigas..."
docker system prune -f

# Construir imagens
echo "🔨 Construindo imagens Docker..."
docker-compose build --no-cache

# Iniciar serviços
echo "▶️ Iniciando serviços..."
docker-compose up -d

# Aguardar inicialização
echo "⏳ Aguardando inicialização dos serviços..."
sleep 30

# Verificar status
echo "🔍 Verificando status dos containers..."
docker-compose ps

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🌐 Acesse seus serviços:"
echo "   n8n: https://$DOMAIN"
echo "   RTSP API: https://$DOMAIN/api/rtsp/health"
echo "   HLS Stream: https://$DOMAIN/hls/stream.m3u8"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
```

### 9.2 Executar Deploy
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 🧪 PASSO 10: Testes e Validação

### 10.1 Script de Testes
```bash
nano scripts/test.sh
```

```bash
#!/bin/bash

source .env

echo "🧪 Executando testes do sistema..."
echo ""

# Teste 1: Containers rodando
echo "📦 Verificando containers..."
docker-compose ps
echo ""

# Teste 2: n8n
echo "🔧 Testando n8n..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ --insecure)
if [ $HTTP_CODE -eq 200 ] || [ $HTTP_CODE -eq 401 ]; then
    echo "✅ n8n: OK ($HTTP_CODE)"
else
    echo "❌ n8n: ERRO ($HTTP_CODE)"
fi

# Teste 3: RTSP API
echo "📺 Testando RTSP API..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/rtsp/health --insecure)
if [ $HTTP_CODE -eq 200 ]; then
    echo "✅ RTSP API: OK ($HTTP_CODE)"
else
    echo "❌ RTSP API: ERRO ($HTTP_CODE)"
fi

# Teste 4: HLS Stream
echo "🎥 Testando HLS Stream..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/hls/stream.m3u8 --insecure)
if [ $HTTP_CODE -eq 200 ]; then
    echo "✅ HLS Stream: OK ($HTTP_CODE)"
else
    echo "⚠️ HLS Stream: Aguardando geração ($HTTP_CODE)"
fi

# Teste 5: SSL
echo "🔒 Testando SSL..."
SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates)
if [ $? -eq 0 ]; then
    echo "✅ SSL: OK"
    echo "   $SSL_INFO"
else
    echo "❌ SSL: ERRO"
fi

echo ""
echo "📊 Uso de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "📋 Logs recentes:"
docker-compose logs --tail=5
```

### 10.2 Executar Testes
```bash
chmod +x scripts/test.sh
./scripts/test.sh
```

---

## 🔧 PASSO 11: Monitoramento e Manutenção

### 11.1 Script de Monitoramento
```bash
nano scripts/monitor.sh
```

```bash
#!/bin/bash

echo "📊 Status do Sistema PetShop Streaming"
echo "======================================"
date
echo ""

# Status dos containers
echo "📦 Status dos Containers:"
docker-compose ps
echo ""

# Uso de recursos
echo "💻 Uso de Recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo ""

# Espaço em disco
echo "💾 Uso de Disco:"
df -h /opt/petshop-streaming
echo ""

# Status do streaming
echo "📺 Status do Streaming:"
source .env
curl -s https://$DOMAIN/api/rtsp/stream/status --insecure | jq . 2>/dev/null || echo "API não disponível"
echo ""

# Logs recentes
echo "📋 Logs Recentes (últimas 10 linhas):"
echo "--- n8n ---"
docker-compose logs --tail=5 n8n
echo "--- RTSP ---"
docker-compose logs --tail=5 rtsp-streaming
echo "--- Nginx ---"
docker-compose logs --tail=5 nginx
```

### 11.2 Script de Backup
```bash
nano scripts/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/opt/petshop-streaming/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "💾 Iniciando backup..."
echo "📁 Destino: $BACKUP_DIR"

# Backup dos dados n8n
echo "🔧 Backup dos dados n8n..."
tar -czf $BACKUP_DIR/n8n-data.tar.gz -C volumes n8n

# Backup das configurações
echo "⚙️ Backup das configurações..."
cp -r nginx $BACKUP_DIR/
cp docker-compose.yml $BACKUP_DIR/
cp .env $BACKUP_DIR/env.backup
cp -r scripts $BACKUP_DIR/

# Backup dos logs
echo "📋 Backup dos logs..."
tar -czf $BACKUP_DIR/logs.tar.gz -C volumes nginx-logs

# Informações do sistema
echo "📊 Salvando informações do sistema..."
docker-compose ps > $BACKUP_DIR/containers-status.txt
docker images > $BACKUP_DIR/images-list.txt
df -h > $BACKUP_DIR/disk-usage.txt

echo "✅ Backup concluído em: $BACKUP_DIR"

# Limpar backups antigos (manter últimos 7 dias)
echo "🧹 Limpando backups antigos..."
find /opt/petshop-streaming/backup -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

echo "📊 Backups disponíveis:"
ls -la /opt/petshop-streaming/backup/
```

### 11.3 Configurar Cron para Monitoramento
```bash
crontab -e

# Adicionar estas linhas:
# Backup diário às 2h da manhã
0 2 * * * cd /opt/petshop-streaming && ./scripts/backup.sh >> /var/log/petshop-backup.log 2>&1

# Monitoramento a cada 30 minutos
*/30 * * * * cd /opt/petshop-streaming && ./scripts/monitor.sh >> /var/log/petshop-monitor.log 2>&1

# Renovação SSL mensal
0 12 1 * * /usr/bin/certbot renew --quiet && cd /opt/petshop-streaming && docker-compose restart nginx
```

---

## 🚨 PASSO 12: Troubleshooting

### 12.1 Problemas Comuns e Soluções

#### ❌ FFmpeg não inicia
```bash
# Verificar logs
docker-compose logs rtsp-streaming

# Testar conectividade RTSP manualmente
docker exec petshop-rtsp ffmpeg -i $RTSP_URL -t 10 -f null -

# Verificar se a câmera está acessível
ping 192.168.0.53
telnet 192.168.0.53 554
```

#### ❌ n8n não carrega
```bash
# Verificar permissões
sudo chown -R 1000:1000 volumes/n8n

# Reiniciar container
docker-compose restart n8n

# Verificar logs
docker-compose logs n8n
```

#### ❌ SSL não funciona
```bash
# Verificar certificados
ls -la nginx/ssl/

# Testar configuração Nginx
docker exec petshop-nginx nginx -t

# Renovar certificados
certbot renew --force-renewal
```

#### ❌ Containers não iniciam
```bash
# Verificar recursos do sistema
free -h
df -h

# Limpar Docker
docker system prune -a

# Reconstruir imagens
docker-compose build --no-cache
```

### 12.2 Comandos Úteis de Debug

```bash
# Ver logs em tempo real
docker-compose logs -f

# Entrar no container RTSP
docker exec -it petshop-rtsp /bin/sh

# Verificar processos FFmpeg
docker exec petshop-rtsp ps aux | grep ffmpeg

# Testar API RTSP
curl -X POST https://seudominio.com/api/rtsp/stream/restart

# Verificar arquivos HLS
ls -la volumes/hls/

# Monitorar recursos
watch docker stats

# Verificar conectividade de rede
docker network ls
docker network inspect petshop-streaming_petshop-network
```

---

## ✅ CHECKLIST FINAL DE DEPLOY

### Antes do Deploy:
- [ ] VPS configurada com Ubuntu/Debian
- [ ] Docker e Docker Compose instalados
- [ ] Domínio configurado no DNS
- [ ] Firewall configurado (portas 22, 80, 443)
- [ ] Arquivo .env configurado com suas informações
- [ ] Câmera RTSP acessível e testada

### Durante o Deploy:
- [ ] Estrutura de diretórios criada
- [ ] Certificados SSL obtidos
- [ ] Containers construídos sem erro
- [ ] Todos os serviços iniciados
- [ ] Testes de conectividade passaram

### Após o Deploy:
- [ ] n8n acessível via HTTPS
- [ ] API RTSP respondendo
- [ ] Stream HLS sendo gerado
- [ ] SSL funcionando corretamente
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Renovação SSL automática configurada

### URLs para Testar:
- [ ] `https://seudominio.com` - n8n Interface
- [ ] `https://seudominio.com/api/rtsp/health` - API Status
- [ ] `https://seudominio.com/api/rtsp/stream/status` - Stream Status
- [ ] `https://seudominio.com/hls/stream.m3u8` - HLS Manifest

---

## 💰 Custos Estimados

### VPS Recomendada:
- **CPU:** 2-4 vCPUs
- **RAM:** 4-8 GB
- **Storage:** 50-100 GB SSD
- **Bandwidth:** 2-5 TB/mês

### Provedores e Preços (aproximados):
- **DigitalOcean:** $20-40/mês
- **Vultr:** $12-24/mês
- **Linode:** $20-40/mês
- **AWS Lightsail:** $20-40/mês
- **Contabo:** €8-16/mês

### Custos Adicionais:
- **Domínio:** R$ 30-60/ano
- **Backup externo (opcional):** $5-10/mês

---

## 🎉 Conclusão

Parabéns! Você agora tem uma infraestrutura completa rodando:

✅ **n8n** para automações
✅ **FFmpeg** para conversão de vídeo
✅ **Servidor RTSP** para streaming
✅ **Nginx** como proxy reverso
✅ **SSL/HTTPS** para segurança
✅ **Monitoramento** e backup automático

### Próximos Passos:
1. Configure suas automações no n8n
2. Integre o streaming RTSP no seu frontend
3. Configure alertas de monitoramento
4. Documente suas configurações específicas

### Suporte:
Se encontrar problemas, execute:
```bash
./scripts/test.sh
./scripts/monitor.sh
```

E analise os logs para identificar a causa dos problemas.

**Boa sorte com seu projeto PetShop! 🐕🐱**