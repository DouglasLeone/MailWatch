// Tela de Login - Design Premium (MVVM)
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLoginForm } from '@/hooks/useFormViewModels';
import { authViewModel } from '@/viewmodels';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { 
    email, 
    password, 
    showPassword, 
    isLoading, 
    errors,
    handleEmailChange,
    handlePasswordChange,
    toggleShowPassword,
    handleSubmit
  } = useLoginForm();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await handleSubmit();
    if (success) {
      toast({
        title: 'Bem-vindo!',
        description: `Olá, ${authViewModel.getUser()?.nome}! Login realizado com sucesso.`,
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: 'Erro no login',
        description: 'Credenciais inválidas. Use qualquer e-mail válido e senha.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--sidebar-foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--sidebar-foreground)) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-sidebar-foreground tracking-tight">MailWatch</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-sidebar-foreground leading-tight mb-6">
            Gerencie seus<br />
            <span className="">e-mails</span> com<br />
            inteligência
          </h1>
          
          <p className="text-lg text-sidebar-muted max-w-md leading-relaxed mb-10">
            Sistema completo para classificação, organização e acompanhamento de comunicações por e-mail.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              'Classificação inteligente por localização',
              'Dashboard com métricas em tempo real',
              'Exportação de relatórios detalhados',
            ].map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-sidebar-foreground/80 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-[400px] animate-scale-in">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MailWatch</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
              Entrar na sua conta
            </h2>
            <p className="text-muted-foreground">
              Digite suas credenciais para acessar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="h-12 pl-11 text-base bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="h-12 pl-11 pr-11 text-base bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2025 MailWatch. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
