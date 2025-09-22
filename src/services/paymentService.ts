import { supabase } from '../lib/supabase';

export interface PaymentData {
  method: 'pix' | 'credit_card';
  amount: number;
  planId: string;
  userId: string;
  billingCycle: 'monthly' | 'yearly';
  cardData?: {
    number: string;
    holderName: string;
    expiryDate: string;
    cvv: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  pixCode?: string;
  qrCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
}

class PaymentService {
  // Simular processamento de PIX
  async processPix(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Gerar código PIX simulado
      const pixCode = this.generatePixCode();
      const transactionId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Salvar transação no banco
      const { error } = await supabase
        .from('payment_transactions')
        .insert({
          id: transactionId,
          user_id: paymentData.userId,
          plan_id: paymentData.planId,
          amount: paymentData.amount,
          method: 'pix',
          status: 'pending',
          pix_code: pixCode,
          billing_cycle: paymentData.billingCycle,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error('Erro ao salvar transação PIX');
      }

      return {
        success: true,
        transactionId,
        pixCode,
        qrCode: `data:image/svg+xml;base64,${btoa(this.generateQRCodeSVG())}`,
        status: 'pending',
        message: 'PIX gerado com sucesso. Escaneie o QR Code ou copie o código para pagar.'
      };
    } catch (error) {
      return {
        success: false,
        status: 'rejected',
        message: error instanceof Error ? error.message : 'Erro ao processar PIX'
      };
    }
  }

  // Simular processamento de cartão de crédito
  async processCreditCard(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!paymentData.cardData) {
        throw new Error('Dados do cartão não fornecidos');
      }

      // Validar dados do cartão (simulação)
      if (!this.validateCreditCard(paymentData.cardData)) {
        throw new Error('Dados do cartão inválidos');
      }

      const transactionId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simular aprovação/rejeição (90% de aprovação)
      const isApproved = Math.random() > 0.1;

      // Salvar transação no banco
      const { error } = await supabase
        .from('payment_transactions')
        .insert({
          id: transactionId,
          user_id: paymentData.userId,
          plan_id: paymentData.planId,
          amount: paymentData.amount,
          method: 'credit_card',
          status: isApproved ? 'approved' : 'rejected',
          card_last_digits: paymentData.cardData.number.slice(-4),
          billing_cycle: paymentData.billingCycle,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error('Erro ao salvar transação do cartão');
      }

      if (isApproved) {
        // Se aprovado, criar a assinatura
        await this.createSubscriptionAfterPayment(paymentData, transactionId);
      }

      return {
        success: isApproved,
        transactionId,
        status: isApproved ? 'approved' : 'rejected',
        message: isApproved 
          ? 'Pagamento aprovado! Sua assinatura foi ativada.'
          : 'Pagamento rejeitado. Verifique os dados do cartão e tente novamente.'
      };
    } catch (error) {
      return {
        success: false,
        status: 'rejected',
        message: error instanceof Error ? error.message : 'Erro ao processar cartão'
      };
    }
  }

  // Confirmar pagamento PIX (simulação de webhook)
  async confirmPixPayment(transactionId: string): Promise<boolean> {
    try {
      // Buscar transação
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        throw new Error('Transação não encontrada');
      }

      // Atualizar status para aprovado
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'approved',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        throw new Error('Erro ao confirmar pagamento');
      }

      // Criar assinatura
      await this.createSubscriptionAfterPayment({
        method: 'pix',
        amount: transaction.amount,
        planId: transaction.plan_id,
        userId: transaction.user_id,
        billingCycle: transaction.billing_cycle
      }, transactionId);

      return true;
    } catch (error) {
      console.error('Erro ao confirmar PIX:', error);
      return false;
    }
  }

  // Criar assinatura após pagamento aprovado
  private async createSubscriptionAfterPayment(paymentData: PaymentData, transactionId: string) {
    const { userSubscriptionsService } = await import('./userSubscriptionsService');
    
    await userSubscriptionsService.createSubscription({
      user_id: paymentData.userId,
      plan_id: paymentData.planId,
      billing_cycle: paymentData.billingCycle,
      price: paymentData.amount,
      status: 'active',
      auto_renew: true,
      payment_transaction_id: transactionId
    });
  }

  // Gerar código PIX simulado
  private generatePixCode(): string {
    // Simular geração de código PIX
    return `00020126580014BR.GOV.BCB.PIX013636c4b8c4-4c4c-4c4c-4c4c-4c4c4c4c4c4c5204000053039865802BR5925PETSHOP ROMEO E JULIETA6009SAO PAULO62070503***6304`;
  }

  // Gerar QR Code SVG simulado
  private generateQRCodeSVG(): string {
    return `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="180" height="180" fill="none" stroke="black" stroke-width="2"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">QR Code PIX</text>
        <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">Escaneie para pagar</text>
      </svg>
    `;
  }

  // Validar dados do cartão (simulação básica)
  private validateCreditCard(cardData: PaymentData['cardData']): boolean {
    if (!cardData) return false;

    // Validar número do cartão (Luhn algorithm simplificado)
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) return false;

    // Validar data de expiração
    const [month, year] = cardData.expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiry < new Date()) return false;

    // Validar CVV
    if (cardData.cvv.length < 3 || cardData.cvv.length > 4) return false;

    return true;
  }

  // Buscar transação por ID
  async getTransaction(transactionId: string) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      throw new Error('Transação não encontrada');
    }

    return data;
  }

  // Listar transações do usuário
  async getUserTransactions(userId: string) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Erro ao buscar transações');
    }

    return data;
  }
}

export const paymentService = new PaymentService();