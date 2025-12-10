'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}

export function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  id,
}: AccordionItemProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg text-left
          border border-gray-200/20 dark:border-gray-700/20 hover:border-solana-green/30 transition-all duration-200"
        aria-expanded={isOpen}
        aria-controls={`accordion-${id}`}
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <span className="ml-4 flex-shrink-0 text-solana-green">
          {isOpen ? (
            <Minus className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </span>
      </button>
      <div
        id={`accordion-${id}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-white/50 dark:bg-gray-900/50 rounded-lg mt-2">
          {answer}
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: {
    question: string;
    answer: string;
  }[];
}

export function CustomAccordion({ items }: AccordionProps) {
  const [openItem, setOpenItem] = useState<number>(0);

  const toggleItem = (index: number) => {
    if (openItem === index) {
      setOpenItem(-1);
    } else {
      setOpenItem(index);
    }
  };

  return (
    <div className="w-full">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          id={index.toString()}
          question={item.question}
          answer={item.answer}
          isOpen={index === openItem}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  );
}