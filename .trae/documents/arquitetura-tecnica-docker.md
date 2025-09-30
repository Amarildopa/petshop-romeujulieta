# Documento de Arquitetura Técnica: Sistema Docker com n8n + FFmpeg + RTSP

## 1. Architecture Design

```mermaid
graph TD
    A[User Browser] --> B[Nginx Reverse Proxy]
    B --> C[n8n Container]
    B --> D[RTSP Streaming Container]
    D --> E[FFmpeg Process]
    E --> F[HLS Files]
    B --> F
    D --> G[RTSP Camera]
    
    subgraph "Docker Network"
        C
        D
        E
    end
    
    subgraph "External Services"
        G
        H[Let's Encrypt SSL]
        I[DNS Provider]
    end
    
    subgraph "Persistent Storage"
        J[n8n Data Volume]
        K[HLS Files Volume]
        L[Nginx Logs Volume]
        M[SSL Certificates]
    end
    
    C --> J
    F --> K
    B --> L
    B --> M
    H --> M
```

## 2. Technology Description

- **Frontend**: Nginx Alpine (Reverse Proxy + Static Files)
- **Automation**: n8n:latest (Workflow Automation Platform)
- **Streaming**: Node.js 18 Alpine + FFmpeg (Custom Container)
- **SSL**: Let's Encrypt + Certbot
- **Orchestration**: Docker Compose v3.8
- **Storage**: Docker Volumes + Bind Mounts

## 3. Route Definitions

| Route | Purpose |
|-------|----------|
| / | n8n web interface (proxied to n8n:5678) |
| /api/rtsp/* | RTSP streaming API endpoints (proxied to rtsp-streaming:3001) |
| /hls/* | HLS streaming files (static files from shared volume) |
| /health | System health check endpoint |
| /.well-known/acme-challenge/* | Let's Encrypt SSL validation |

## 4. API Definitions

### 4.1 Core API

**RTSP Streaming Health Check**
```
GET /api/rtsp/health
```

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| status | string | System status (ok/error) |
| streaming | boolean | FFmpeg streaming status |
| uptime | number | Streaming uptime in seconds |
| timestamp | string | Current timestamp ISO format |

Example:
```json
{
  "status": "ok",
  "streaming": true,
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "rtsp_url": "rtsp://***:***@192.168.0.53:554/stream"
}
```

**Stream Status Check**
```
GET /api/rtsp/stream/status
```

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| streaming | boolean | Current streaming status |
| manifestExists | boolean | HLS manifest file availability |
| manifestPath | string | Path to HLS manifest |
| manifestSize | number | Manifest file size in bytes |
| lastModified | string | Last modification timestamp |
| uptime | number | Stream uptime in seconds |

Example:
```json
{
  "streaming": true,
  "manifestExists": true,
  "manifestPath": "/hls/stream.m3u8",
  "manifestSize": 256,
  "lastModified": "2024-01-15T10:29:45.000Z",
  "uptime": 3600
}
```

**Stream Control**
```
POST /api/rtsp/stream/start
POST /api/rtsp/stream/stop
POST /api/rtsp/stream/restart
```

Request: Empty body

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| message | string | Operation result message |
| status | string | Operation status (started/stopped/restarted) |

Example:
```json
{
  "message": "🚀 Stream iniciado",
  "status": "started"
}
```

**System Logs**
```
GET /api/rtsp/logs
```

Response:
| Param Name | Param Type | Description |
|------------|------------|-------------|
| streaming | boolean | Current streaming status |
| uptime | number | System uptime in seconds |
| rtsp_url | string | Masked RTSP URL |
| hls_path | string | HLS files directory path |
| timestamp | string | Current timestamp |

### 4.2 n8n API Integration

**Webhook Endpoints**
```
POST /webhook/{webhook-id}
```

Custom webhooks created in n8n workflows for:
- Camera status notifications
- Streaming alerts
- System monitoring triggers
- External API integrations

## 5. Server Architecture Diagram

```mermaid
graph TD
    A[Client Request] --> B[Nginx Load Balancer]
    B --> C[SSL Termination]
    C --> D[Routing Layer]
    
    D --> E[n8n Service]
    D --> F[RTSP Service]
    D --> G[Static Files Service]
    
    E --> H[n8n Workflow Engine]
    F --> I[Express.js API]
    I --> J[FFmpeg Process Manager]
    J --> K[RTSP Stream Handler]
    K --> L[HLS Converter]
    
    subgraph "Container Layer"
        E
        F
        I
        J
    end
    
    subgraph "Process Layer"
        H
        K
        L
    end
    
    subgraph "Storage Layer"
        M[n8n Workflows]
        N[HLS Segments]
        O[System Logs]
        P[SSL Certificates]
    end
    
    H --> M
    L --> N
    B --> O
    C --> P
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    SYSTEM_CONFIG {
        string domain PK
        string rtsp_url
        string timezone
        string ssl_email
        datetime created_at
        datetime updated_at
    }
    
    STREAM_SESSION {
        uuid id PK
        string rtsp_url
        datetime start_time
        datetime end_time
        string status
        json ffmpeg_config
        int uptime_seconds
    }
    
    HLS_SEGMENT {
        uuid id PK
        uuid session_id FK
        string filename
        int duration_seconds
        int file_size_bytes
        datetime created_at
    }
    
    SYSTEM_LOG {
        uuid id PK
        string service_name
        string log_level
        string message
        json metadata
        datetime timestamp
    }
    
    N8N_WORKFLOW {
        uuid id PK
        string name
        string trigger_type
        json workflow_data
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    STREAM_SESSION ||--o{ HLS_SEGMENT : generates
    SYSTEM_CONFIG ||--o{ STREAM_SESSION : configures
    N8N_WORKFLOW ||--o{ SYSTEM_LOG : triggers
```

### 6.2 Data Definition Language

**Docker Volumes Configuration**
```yaml
# n8n persistent data
volumes:
  n8n-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./volumes/n8n

# HLS streaming files
  hls-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./volumes/hls

# Nginx logs
  nginx-logs:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./volumes/nginx-logs
```

**Environment Variables Schema**
```bash
# System Configuration
DOMAIN=string                    # Primary domain for SSL and routing
TIMEZONE=string                 # System timezone (America/Sao_Paulo)

# n8n Configuration
N8N_USER=string                 # Basic auth username
N8N_PASSWORD=string             # Basic auth password (min 12 chars)
N8N_ENCRYPTION_KEY=string       # Encryption key for sensitive data

# RTSP Configuration
RTSP_URL=string                 # Full RTSP URL with credentials

# Network Configuration
N8N_PORT=number                 # Internal n8n port (default: 5678)
RTSP_PORT=number                # Internal RTSP API port (default: 3001)
NGINX_HTTP_PORT=number          # External HTTP port (default: 80)
NGINX_HTTPS_PORT=number         # External HTTPS port (default: 443)

# SSL Configuration
SSL_EMAIL=string                # Email for Let's Encrypt registration

# Backup Configuration
BACKUP_RETENTION_DAYS=number    # Days to retain backups (default: 7)
```

**Directory Structure**
```
/opt/petshop-streaming/
├── docker-compose.yml          # Main orchestration file
├── .env                        # Environment variables (secured)
├── nginx/
│   ├── nginx.conf             # Nginx configuration
│   └── ssl/                   # SSL certificates directory
│       ├── fullchain.pem      # SSL certificate chain
│       └── privkey.pem        # SSL private key
├── rtsp-streaming/
│   ├── Dockerfile             # Custom RTSP container build
│   ├── server.js              # Node.js streaming server
│   └── package.json           # Node.js dependencies
├── volumes/                   # Persistent data storage
│   ├── n8n/                   # n8n workflows and data
│   ├── hls/                   # Generated HLS streaming files
│   └── nginx-logs/            # Nginx access and error logs
├── scripts/                   # Automation and maintenance scripts
│   ├── deploy.sh              # Full deployment script
│   ├── ssl-setup.sh           # SSL certificate setup
│   ├── backup.sh              # Automated backup script
│   ├── monitor.sh             # System monitoring script
│   └── test.sh                # System validation tests
└── backup/                    # Backup storage directory
    └── YYYYMMDD_HHMMSS/       # Timestamped backup folders
```

**FFmpeg Process Configuration**
```javascript
// FFmpeg arguments for RTSP to HLS conversion
const ffmpegArgs = [
    '-i', RTSP_URL,              // Input RTSP stream
    '-c:v', 'libx264',           // Video codec
    '-c:a', 'aac',               // Audio codec
    '-preset', 'ultrafast',       // Encoding speed preset
    '-tune', 'zerolatency',      // Low latency tuning
    '-f', 'hls',                 // Output format (HLS)
    '-hls_time', '2',            // Segment duration (seconds)
    '-hls_list_size', '3',       // Number of segments in playlist
    '-hls_flags', 'delete_segments', // Auto-delete old segments
    '-hls_allow_cache', '0',     // Disable caching
    '-y',                        // Overwrite output files
    path.join(HLS_PATH, 'stream.m3u8') // Output manifest file
];
```

**Health Check Configuration**
```yaml
# Container health checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 5s
```

**Network Security Configuration**
```nginx
# Nginx security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;

# CORS headers for HLS streaming
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";
```