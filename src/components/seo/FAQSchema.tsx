import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqItems: FAQItem[];
}

/**
 * FAQ结构化数据组件
 * 生成符合Schema.org标准的FAQ结构化数据，提升SEO表现
 */
export const FAQSchema: React.FC<FAQSchemaProps> = ({ faqItems }) => {
  // 清理HTML标签，只保留纯文本用于结构化数据
  const cleanText = (text: string): string => {
    return text.replace(/<[^>]*>/g, '').trim();
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: cleanText(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: cleanText(item.answer),
      },
    })),
  };

  React.useEffect(() => {
    // 创建或更新FAQ结构化数据
    const existingScript = document.querySelector('script[data-schema="faq"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'faq');
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    // 清理函数
    return () => {
      const scriptToRemove = document.querySelector('script[data-schema="faq"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [faqItems]);

  return null; // 这个组件不渲染任何可见内容
};

export default FAQSchema;
