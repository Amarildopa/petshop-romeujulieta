#!/usr/bin/env node

/**
 * Script para ativar/desativar página "Em Breve"
 * PetShop Romeo & Julieta
 * 
 * Uso:
 * node scripts/setup-coming-soon.js enable  - Ativa modo "Em Breve"
 * node scripts/setup-coming-soon.js disable - Desativa modo "Em Breve"
 * node scripts/setup-coming-soon.js status  - Verifica status atual
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTACCESS_SOURCE = '.htaccess-coming-soon';
const HTACCESS_TARGET = '.htaccess';
const HTACCESS_BACKUP = '.htaccess-backup';
const COMING_SOON_PAGE = 'public/coming-soon.html';

class ComingSoonManager {
    constructor() {
        this.rootDir = process.cwd();
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m'
        };
    }

    log(message, color = 'reset') {
        console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }

    error(message) {
        this.log(`❌ ERRO: ${message}`, 'red');
    }

    success(message) {
        this.log(`✅ ${message}`, 'green');
    }

    warning(message) {
        this.log(`⚠️  ${message}`, 'yellow');
    }

    info(message) {
        this.log(`ℹ️  ${message}`, 'blue');
    }

    fileExists(filePath) {
        return fs.existsSync(path.join(this.rootDir, filePath));
    }

    copyFile(source, target) {
        const sourcePath = path.join(this.rootDir, source);
        const targetPath = path.join(this.rootDir, target);
        
        try {
            fs.copyFileSync(sourcePath, targetPath);
            return true;
        } catch (err) {
            this.error(`Erro ao copiar ${source} para ${target}: ${err.message}`);
            return false;
        }
    }

    deleteFile(filePath) {
        const fullPath = path.join(this.rootDir, filePath);
        
        try {
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                return true;
            }
            return true;
        } catch (err) {
            this.error(`Erro ao deletar ${filePath}: ${err.message}`);
            return false;
        }
    }

    renameFile(oldPath, newPath) {
        const oldFullPath = path.join(this.rootDir, oldPath);
        const newFullPath = path.join(this.rootDir, newPath);
        
        try {
            if (fs.existsSync(oldFullPath)) {
                fs.renameSync(oldFullPath, newFullPath);
                return true;
            }
            return false;
        } catch (err) {
            this.error(`Erro ao renomear ${oldPath} para ${newPath}: ${err.message}`);
            return false;
        }
    }

    checkPrerequisites() {
        this.log('\n🔍 Verificando pré-requisitos...', 'cyan');
        
        let allGood = true;

        // Verificar se existe o arquivo fonte do .htaccess
        if (!this.fileExists(HTACCESS_SOURCE)) {
            this.error(`Arquivo ${HTACCESS_SOURCE} não encontrado!`);
            allGood = false;
        } else {
            this.success(`Arquivo ${HTACCESS_SOURCE} encontrado`);
        }

        // Verificar se existe a página coming-soon
        if (!this.fileExists(COMING_SOON_PAGE)) {
            this.error(`Arquivo ${COMING_SOON_PAGE} não encontrado!`);
            allGood = false;
        } else {
            this.success(`Arquivo ${COMING_SOON_PAGE} encontrado`);
        }

        return allGood;
    }

    enable() {
        this.log('\n🚀 Ativando modo "Em Breve"...', 'cyan');

        if (!this.checkPrerequisites()) {
            this.error('Pré-requisitos não atendidos. Abortando.');
            return false;
        }

        // Fazer backup do .htaccess atual se existir
        if (this.fileExists(HTACCESS_TARGET)) {
            this.info('Fazendo backup do .htaccess atual...');
            if (!this.copyFile(HTACCESS_TARGET, HTACCESS_BACKUP)) {
                return false;
            }
            this.success('Backup criado como .htaccess-backup');
        }

        // Copiar o .htaccess do coming-soon
        this.info('Ativando redirecionamento...');
        if (!this.copyFile(HTACCESS_SOURCE, HTACCESS_TARGET)) {
            return false;
        }

        this.success('Modo "Em Breve" ativado com sucesso!');
        this.log('\n📋 Próximos passos:', 'yellow');
        this.log('1. Faça upload dos arquivos para a Hostinger:');
        this.log(`   - ${HTACCESS_TARGET} (para a pasta raiz do domínio)`);
        this.log(`   - ${COMING_SOON_PAGE} (manter estrutura de pastas)`);
        this.log('2. Teste acessando seu domínio');
        this.log('3. Para desativar, execute: node scripts/setup-coming-soon.js disable');

        return true;
    }

    disable() {
        this.log('\n🔓 Desativando modo "Em Breve"...', 'cyan');

        // Verificar se existe backup
        if (this.fileExists(HTACCESS_BACKUP)) {
            this.info('Restaurando .htaccess original...');
            if (!this.copyFile(HTACCESS_BACKUP, HTACCESS_TARGET)) {
                return false;
            }
            this.deleteFile(HTACCESS_BACKUP);
            this.success('.htaccess original restaurado');
        } else {
            // Se não tem backup, apenas remove o .htaccess atual
            this.info('Removendo .htaccess do modo "Em Breve"...');
            if (!this.deleteFile(HTACCESS_TARGET)) {
                return false;
            }
            this.success('.htaccess removido');
        }

        this.success('Modo "Em Breve" desativado com sucesso!');
        this.log('\n📋 Próximos passos:', 'yellow');
        this.log('1. Faça upload do .htaccess atualizado para a Hostinger');
        this.log('2. Ou delete o arquivo .htaccess da pasta raiz se não precisar');
        this.log('3. Teste acessando seu domínio');

        return true;
    }

    status() {
        this.log('\n📊 Status atual:', 'cyan');

        const htaccessExists = this.fileExists(HTACCESS_TARGET);
        const backupExists = this.fileExists(HTACCESS_BACKUP);
        const comingSoonExists = this.fileExists(COMING_SOON_PAGE);

        this.log(`📄 .htaccess: ${htaccessExists ? '✅ Existe' : '❌ Não existe'}`);
        this.log(`💾 .htaccess-backup: ${backupExists ? '✅ Existe' : '❌ Não existe'}`);
        this.log(`🌐 coming-soon.html: ${comingSoonExists ? '✅ Existe' : '❌ Não existe'}`);

        if (htaccessExists && backupExists) {
            this.log('\n🟢 Status: Modo "Em Breve" provavelmente ATIVO', 'green');
        } else if (!htaccessExists && !backupExists) {
            this.log('\n🔴 Status: Modo "Em Breve" provavelmente INATIVO', 'red');
        } else {
            this.log('\n🟡 Status: Estado indefinido', 'yellow');
        }

        return true;
    }

    showHelp() {
        this.log('\n🐾 PetShop Romeo & Julieta - Gerenciador "Em Breve"', 'magenta');
        this.log('═'.repeat(50), 'magenta');
        this.log('\nComandos disponíveis:', 'cyan');
        this.log('  enable  - Ativa o modo "Em Breve"');
        this.log('  disable - Desativa o modo "Em Breve"');
        this.log('  status  - Mostra o status atual');
        this.log('  help    - Mostra esta ajuda');
        this.log('\nExemplos:', 'cyan');
        this.log('  node scripts/setup-coming-soon.js enable');
        this.log('  node scripts/setup-coming-soon.js disable');
        this.log('  node scripts/setup-coming-soon.js status');
        this.log('\n💡 Dica: Execute sempre a partir da raiz do projeto!');
    }
}

// Execução principal
function main() {
    const manager = new ComingSoonManager();
    const command = process.argv[2];

    switch (command) {
        case 'enable':
            manager.enable();
            break;
        case 'disable':
            manager.disable();
            break;
        case 'status':
            manager.status();
            break;
        case 'help':
        case '--help':
        case '-h':
            manager.showHelp();
            break;
        default:
            manager.error('Comando inválido!');
            manager.showHelp();
            process.exit(1);
    }
}

// Executar apenas se chamado diretamente
main();

export default ComingSoonManager;