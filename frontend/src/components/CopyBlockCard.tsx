import React, { useState } from 'react';
import type { CopyBlock } from '../types';

interface Props {
  block: CopyBlock;
}

export const CopyBlockCard: React.FC<Props> = ({ block }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const currentLength = block.text.length;
  const isOverLimit = currentLength > block.char_limit;

  const handleCopy = () => {
    if (!navigator.clipboard) {
      setCopyError(true);
      return;
    }
    navigator.clipboard.writeText(block.text)
      .then(() => {
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy!", err);
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
      });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4">
      {/* Header Area */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-50 text-blue-700 border border-blue-100/50 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">
              {block.target_form}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {block.target_field}
            </span>
          </div>
          {block.review_required && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              교사 검토 필요
            </span>
          )}
        </div>
        <h3 className="text-[17px] font-bold text-slate-900 leading-snug">
          {block.label}
        </h3>
        <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
          <span>출처: {block.source_form}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>문체: {block.style_profile}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 mt-1">
        <p className="text-slate-700 text-[14px] leading-[1.6] whitespace-pre-wrap">
          {block.text}
        </p>
      </div>

      {/* Footer Area */}
      <div className="flex justify-between items-center mt-2">
        <div className={`text-xs flex items-center gap-1 tabular-nums font-medium ${isOverLimit ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
          <span className={isOverLimit ? 'text-rose-600' : 'text-slate-800'}>{currentLength}</span>
          <span>/ {block.char_limit} 자</span>
          {isOverLimit && <span className="ml-1.5 bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-100">초과</span>}
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 active:scale-95 ${copyError
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : copied
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200'
            }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {copyError ? 'error' : copied ? 'check_circle' : 'content_copy'}
          </span>
          {copyError ? '복사 실패' : copied ? '복사 완료' : '복사하기'}
        </button>
      </div>
    </div>
  );
};