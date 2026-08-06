/* ==========================================================================
   AUTH PAGES - REGISTRATION (30-DAY TRIAL), LOGIN & PASSWORD RECOVERY
   ========================================================================== */

export function renderRegisterPage() {
  return `
    <div class="auth-card-wrapper">
      <div class="card auth-card">
        <div class="auth-header">
          <div class="brand-icon" style="margin: 0 auto 12px; width: 50px; height: 50px;">
            <i data-lucide="rocket"></i>
          </div>
          <h2>Criar Conta & Iniciar Teste Grátis</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            Acesso total por <strong>30 dias sem cobrança</strong>. Sem necessidade de cartão.
          </p>
        </div>

        <form id="form-register">
          <div class="form-group">
            <label class="form-label">Seu Nome Completo</label>
            <input type="text" class="form-control" id="reg-fullname" placeholder="Ex: Carlos Eduardo" required>
          </div>

          <div class="form-group">
            <label class="form-label">Nome da Sua Empresa / Prestador de Serviço</label>
            <input type="text" class="form-control" id="reg-company" placeholder="Ex: Alfa Climatização Ltda" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">E-mail Profissional</label>
              <input type="email" class="form-control" id="reg-email" placeholder="carlos@empresa.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Telefone / WhatsApp</label>
              <input type="tel" class="form-control" id="reg-phone" placeholder="(81) 99887-6655" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Senha</label>
              <input type="password" class="form-control" id="reg-password" placeholder="Mínimo 6 caracteres" required>
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar Senha</label>
              <input type="password" class="form-control" id="reg-confirm-password" placeholder="Repita a senha" required>
            </div>
          </div>

          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-muted);">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="reg-accept-terms" required style="width: 16px; height: 16px; accent-color: var(--primary);">
              <span>Li e aceito os <strong>Termos de Uso</strong> e <strong>Política de Privacidade</strong>.</span>
            </label>
          </div>

          <div id="register-error-box" style="display: none; padding: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 14px;"></div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem;">
            <i data-lucide="check-circle-2"></i> Criar Minha Conta & Iniciar 30 Dias Grátis
          </button>
        </form>

        <div style="text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--text-muted);">
          Já tem uma conta? <a href="#" id="link-go-login" style="color: var(--primary); font-weight: 700; text-decoration: none;">Fazer Login</a>
        </div>
      </div>
    </div>
  `;
}

export function renderLoginPage() {
  return `
    <div class="auth-card-wrapper">
      <div class="card auth-card">
        <div class="auth-header">
          <div class="brand-icon" style="margin: 0 auto 12px; width: 50px; height: 50px;">
            <i data-lucide="lock"></i>
          </div>
          <h2>Entrar no OS Cloud</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            Acesse o painel administrativo da sua empresa.
          </p>
        </div>

        <form id="form-login">
          <div class="form-group">
            <label class="form-label">E-mail Cadastrado</label>
            <input type="email" class="form-control" id="login-email" placeholder="seu@email.com" required>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="form-label">Senha</label>
              <a href="#" id="link-forgot-password" style="font-size: 0.75rem; color: var(--primary); text-decoration: none;">Esqueci minha senha</a>
            </div>
            <input type="password" class="form-control" id="login-password" placeholder="Sua senha" required>
          </div>

          <div id="login-error-box" style="display: none; padding: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 14px;"></div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem;">
            <i data-lucide="log-in"></i> Entrar no Sistema
          </button>
        </form>

        <div style="text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--text-muted);">
          Ainda não tem conta? <a href="#" id="link-go-register" style="color: var(--primary); font-weight: 700; text-decoration: none;">Criar conta e testar grátis 30 dias</a>
        </div>
      </div>
    </div>
  `;
}

export function renderForgotPasswordPage() {
  return `
    <div class="auth-card-wrapper">
      <div class="card auth-card">
        <div class="auth-header">
          <div class="brand-icon" style="margin: 0 auto 12px; width: 50px; height: 50px;">
            <i data-lucide="key-round"></i>
          </div>
          <h2>Recuperar Senha de Acesso</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            Digite o e-mail associado à sua conta para receber o link de redefinição.
          </p>
        </div>

        <form id="form-forgot">
          <div class="form-group">
            <label class="form-label">E-mail Cadastrado</label>
            <input type="email" class="form-control" id="forgot-email" placeholder="seu@email.com" required>
          </div>

          <div id="forgot-msg-box" style="display: none; padding: 10px; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 14px;"></div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem;">
            <i data-lucide="send"></i> Enviar Instruções
          </button>
        </form>

        <div style="text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--text-muted);">
          Lembrou a senha? <a href="#" id="link-back-login" style="color: var(--primary); font-weight: 700; text-decoration: none;">Voltar ao Login</a>
        </div>
      </div>
    </div>
  `;
}
