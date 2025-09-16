import { weeklyBathsService } from './weeklyBathsService';

/**
 * Serviço para gerenciar atualizações automáticas semanais
 * Responsável por arquivar fotos antigas e processar fotos da semana anterior (segunda a sábado)
 * Executa toda segunda-feira para carregar fotos da semana que passou
 */
export class WeeklyUpdateService {
  private static instance: WeeklyUpdateService;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  static getInstance(): WeeklyUpdateService {
    if (!WeeklyUpdateService.instance) {
      WeeklyUpdateService.instance = new WeeklyUpdateService();
    }
    return WeeklyUpdateService.instance;
  }

  /**
   * Inicia o serviço de atualização automática
   * Verifica a cada hora se é segunda-feira às 2h da manhã
   * Processa fotos da semana anterior (segunda a sábado) para exibição no carrossel
   */
  start(): void {
    if (this.isRunning) {
      console.log('Serviço de atualização semanal já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('Iniciando serviço de atualização semanal...');

    // Verifica imediatamente se precisa executar
    this.checkAndExecuteUpdate();

    // Configura verificação a cada hora
    this.updateInterval = setInterval(() => {
      this.checkAndExecuteUpdate();
    }, 60 * 60 * 1000); // 1 hora
  }

  /**
   * Para o serviço de atualização automática
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Serviço de atualização semanal parado');
  }

  /**
   * Verifica se é o momento de executar a atualização
   * Segunda-feira às 2h da manhã (horário de Brasília)
   * Processa fotos da semana anterior (segunda a sábado) que acabou de terminar
   */
  private checkAndExecuteUpdate(): void {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda
    const hour = now.getHours();

    // Segunda-feira (1) às 2h da manhã
    if (dayOfWeek === 1 && hour === 2) {
      this.executeWeeklyUpdate();
    }
  }

  /**
   * Executa a atualização semanal
   * - Arquiva fotos antigas (mais de 8 semanas)
   * - Processa fotos da semana anterior (segunda a sábado) para exibição
   * - Registra logs da operação
   */
  private async executeWeeklyUpdate(): Promise<void> {
    try {
      console.log('Iniciando atualização semanal automática...');
      
      // Arquiva fotos antigas (mais de 1 semana)
      const archivedCount = await weeklyBathsService.archiveOldWeeks();
      
      console.log(`Atualização semanal concluída. ${archivedCount} registros arquivados.`);
      
      // Registra a execução para evitar execuções duplicadas na mesma hora
      this.logExecution();
      
    } catch (error) {
      console.error('Erro durante atualização semanal:', error);
      
      // Em caso de erro, tenta novamente em 30 minutos
      setTimeout(() => {
        this.executeWeeklyUpdate();
      }, 30 * 60 * 1000);
    }
  }

  /**
   * Execução manual da atualização (para testes ou necessidade administrativa)
   */
  async executeManualUpdate(): Promise<{ success: boolean; message: string; archivedCount?: number }> {
    try {
      console.log('Executando atualização manual...');
      
      const archivedCount = await weeklyBathsService.archiveOldWeeks();
      
      const message = `Atualização manual concluída. ${archivedCount} registros arquivados.`;
      console.log(message);
      
      return {
        success: true,
        message,
        archivedCount
      };
      
    } catch (error) {
      const errorMessage = `Erro durante atualização manual: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Registra a execução da atualização
   */
  private logExecution(): void {
    const timestamp = new Date().toISOString();
    localStorage.setItem('lastWeeklyUpdate', timestamp);
  }

  /**
   * Verifica quando foi a última execução
   */
  getLastExecution(): Date | null {
    const lastUpdate = localStorage.getItem('lastWeeklyUpdate');
    return lastUpdate ? new Date(lastUpdate) : null;
  }

  /**
   * Verifica se o serviço está rodando
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Calcula quando será a próxima execução
   */
  getNextExecution(): Date {
    const now = new Date();
    const nextMonday = new Date(now);
    
    // Calcula próxima segunda-feira
    const daysUntilMonday = (1 - now.getDay() + 7) % 7;
    if (daysUntilMonday === 0 && now.getHours() >= 2) {
      // Se já é segunda e já passou das 2h, próxima segunda
      nextMonday.setDate(now.getDate() + 7);
    } else {
      nextMonday.setDate(now.getDate() + daysUntilMonday);
    }
    
    nextMonday.setHours(2, 0, 0, 0);
    
    return nextMonday;
  }

  /**
   * Obtém estatísticas do serviço
   */
  getServiceStats(): {
    isRunning: boolean;
    lastExecution: Date | null;
    nextExecution: Date;
    hoursUntilNext: number;
  } {
    const lastExecution = this.getLastExecution();
    const nextExecution = this.getNextExecution();
    const hoursUntilNext = Math.ceil((nextExecution.getTime() - Date.now()) / (1000 * 60 * 60));

    return {
      isRunning: this.isRunning,
      lastExecution,
      nextExecution,
      hoursUntilNext
    };
  }
}

// Instância singleton
export const weeklyUpdateService = WeeklyUpdateService.getInstance();

// Auto-inicialização do serviço quando o módulo é carregado
// Apenas em ambiente de produção ou quando explicitamente habilitado
if (typeof window !== 'undefined' && 
    (process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_AUTO_UPDATE === 'true')) {
  weeklyUpdateService.start();
}