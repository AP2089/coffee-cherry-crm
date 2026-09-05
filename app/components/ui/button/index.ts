import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-[11px] font-normal transition-[color,background-color,border-color,transform] duration-300 ease-premium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        magnetic: 'magnetic-btn font-display uppercase tracking-[0.04em]',
        'magnetic-filled':
          'magnetic-btn magnetic-btn--filled font-display uppercase tracking-[0.04em]',
        'destructive-outline':
          'magnetic-btn font-display uppercase tracking-[0.04em] text-destructive/90 hover:text-destructive',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10 p-0',
        'icon-sm': 'size-9 p-0',
        'icon-lg': 'size-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
