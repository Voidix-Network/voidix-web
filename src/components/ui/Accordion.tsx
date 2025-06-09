import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/utils';

/**
 * 手风琴项目接口
 */
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * 手风琴组件 - 复现原项目的手风琴展开动画
 */
export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn('border border-gray-700 rounded-xl overflow-hidden bg-gray-800/50', className)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/30 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-white">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </motion.div>
      </button>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.8, 0.25, 1],
        }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 pt-2 border-t border-gray-700">{children}</div>
      </motion.div>
    </div>
  );
};

/**
 * 多项手风琴容器
 */
interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ children, className }) => {
  return <div className={cn('space-y-4', className)}>{children}</div>;
};
