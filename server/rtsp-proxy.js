import express from 'express';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Configurar CORS
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (HLS)
app.use('/hls', express.static(path.join(__dirname, 'hls')));

// Armazenar processos FFmpeg ativos
const activeStreams = new Map();

// Criar diretório HLS se não existir
const hlsDir = path.join(__dirname, 'hls');
if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
}

// Endpoint para iniciar stream
app.post('/start-stream', (req, res) => {
    const { rtspUrl, streamId = 'default' } = req.body;
    
    if (!rtspUrl) {
        return res.status(400).json({ error: 'URL RTSP é obrigatória' });
    }
    
    // Verificar se já existe um stream ativo
    if (activeStreams.has(streamId)) {
        return res.status(409).json({ error: 'Stream já está ativo' });
    }
    
    const outputPath = path.join(hlsDir, `${streamId}.m3u8`);
    const segmentPath = path.join(hlsDir, `${streamId}_%03d.ts`);
    
    try {
        const ffmpegProcess = ffmpeg(rtspUrl)
            .inputOptions([
                '-rtsp_transport', 'tcp',
                '-analyzeduration', '1000000',
                '-probesize', '1000000'
            ])
            .outputOptions([
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-tune', 'zerolatency',
                '-c:a', 'aac',
                '-f', 'hls',
                '-hls_time', '2',
                '-hls_list_size', '10',
                '-hls_flags', 'delete_segments+append_list',
                '-hls_segment_filename', segmentPath
            ])
            .output(outputPath)
            .on('start', (commandLine) => {
                console.log(`Stream iniciado: ${streamId}`);
                console.log(`Comando FFmpeg: ${commandLine}`);
            })
            .on('error', (err) => {
                console.error(`Erro no stream ${streamId}:`, err.message);
                activeStreams.delete(streamId);
            })
            .on('end', () => {
                console.log(`Stream finalizado: ${streamId}`);
                activeStreams.delete(streamId);
            });
        
        ffmpegProcess.run();
        activeStreams.set(streamId, ffmpegProcess);
        
        res.json({ 
            success: true, 
            message: 'Stream iniciado com sucesso',
            streamId,
            hlsUrl: `http://localhost:${PORT}/hls/${streamId}.m3u8`
        });
        
    } catch (error) {
        console.error('Erro ao iniciar stream:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint para parar stream (POST)
app.post('/stop-stream', (req, res) => {
    const { streamId = 'default' } = req.body;
    
    const ffmpegProcess = activeStreams.get(streamId);
    if (!ffmpegProcess) {
        return res.status(404).json({ error: 'Stream não encontrado' });
    }
    
    try {
        ffmpegProcess.kill('SIGTERM');
        activeStreams.delete(streamId);
        
        // Limpar arquivos HLS
        const hlsFiles = fs.readdirSync(hlsDir).filter(file => file.startsWith(streamId));
        hlsFiles.forEach(file => {
            fs.unlinkSync(path.join(hlsDir, file));
        });
        
        res.json({ success: true, message: 'Stream parado com sucesso' });
    } catch (error) {
        console.error('Erro ao parar stream:', error);
        res.status(500).json({ error: 'Erro ao parar stream' });
    }
});

// Endpoint para parar stream (DELETE)
app.delete('/stop-stream/:streamId', (req, res) => {
    const streamId = req.params.streamId;
    
    const ffmpegProcess = activeStreams.get(streamId);
    if (!ffmpegProcess) {
        return res.status(404).json({ error: 'Stream não encontrado' });
    }
    
    try {
        ffmpegProcess.kill('SIGTERM');
        activeStreams.delete(streamId);
        
        // Limpar arquivos HLS
        const hlsFiles = fs.readdirSync(hlsDir).filter(file => file.startsWith(streamId));
        hlsFiles.forEach(file => {
            fs.unlinkSync(path.join(hlsDir, file));
        });
        
        res.json({ success: true, message: 'Stream parado com sucesso' });
    } catch (error) {
        console.error('Erro ao parar stream:', error);
        res.status(500).json({ error: 'Erro ao parar stream' });
    }
});

// Endpoint para verificar status do stream
app.get('/stream-status/:streamId', (req, res) => {
    const streamId = req.params.streamId;
    const isActive = activeStreams.has(streamId);
    
    res.json({ 
        streamId,
        active: isActive,
        hlsUrl: isActive ? `http://localhost:${PORT}/hls/${streamId}.m3u8` : null
    });
});

// Endpoint para verificar status sem streamId específico
app.get('/stream-status', (req, res) => {
    const streamId = 'default';
    const isActive = activeStreams.has(streamId);
    
    res.json({ 
        streamId,
        active: isActive,
        hlsUrl: isActive ? `http://localhost:${PORT}/hls/${streamId}.m3u8` : null
    });
});

// Endpoint para listar streams ativos
app.get('/active-streams', (req, res) => {
    const streams = Array.from(activeStreams.keys()).map(streamId => ({
        streamId,
        hlsUrl: `http://localhost:${PORT}/hls/${streamId}.m3u8`
    }));
    
    res.json({ streams });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor proxy RTSP rodando na porta ${PORT}`);
    console.log(`Endpoints disponíveis:`);
    console.log(`  POST /start-stream - Iniciar conversão RTSP para HLS`);
    console.log(`  POST /stop-stream - Parar conversão`);
    console.log(`  GET /stream-status/:streamId - Verificar status`);
    console.log(`  GET /active-streams - Listar streams ativos`);
});

// Limpeza ao encerrar o processo
process.on('SIGINT', () => {
    console.log('\nEncerrando servidor...');
    
    // Parar todos os streams ativos
    activeStreams.forEach((ffmpegProcess, streamId) => {
        console.log(`Parando stream: ${streamId}`);
        ffmpegProcess.kill('SIGTERM');
    });
    
    process.exit(0);
});

export default app;