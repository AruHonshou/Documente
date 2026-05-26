import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
}

/**
 * @component Button
 * @description Renderiza un boton consistente con variantes visuales e icono opcional.
 * @why Existe como componente base para evitar estilos repetidos en formularios y acciones.
 * @props variant define el estilo, icon agrega un simbolo y el resto son props nativas de button.
 */
export function Button({ className = '', icon, children, variant = 'primary', ...props }: ButtonProps): ReactElement {
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-teal-300 text-zinc-950 shadow-lg shadow-teal-950/20 hover:bg-teal-200',
    secondary: 'border border-white/10 bg-white/[0.06] text-zinc-100 hover:bg-white/[0.1]',
    ghost: 'text-zinc-300 hover:bg-white/[0.06] hover:text-white',
  };

  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * Responsabilidades del archivo:
 * - Centralizar apariencia de botones.
 * - Soportar iconos lucide dentro de acciones.
 * - Mantener estados disabled y hover consistentes.
 */
