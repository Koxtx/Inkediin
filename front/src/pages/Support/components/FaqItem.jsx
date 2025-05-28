import React, { useState } from 'react'

export default function FaqItem({ question, answer }) {
 const [isOpen, setIsOpen] = useState(false);
   
   return (
     <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
       <button 
         className="flex justify-between items-center w-full text-left font-medium text-gray-900 dark:text-white"
         onClick={() => setIsOpen(!isOpen)}
       >
         <span>{question}</span>
         <span className="text-xl">{isOpen ? '−' : '+'}</span>
       </button>
       
       {isOpen && (
         <div className="mt-2 text-gray-600 dark:text-gray-300">
           {answer}
         </div>
       )}
     </div>
   );
}
