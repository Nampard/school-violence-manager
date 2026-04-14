import React, { useState } from 'react'
import { CaseDocuments } from './pages/CaseDocuments'
import { CaseIntake } from './pages/CaseIntake'

function App() {
  const [tab, setTab] = useState<'intake' | 'documents'>('intake')

  return (
    // 전체 배경은 아주 연한 회색빛(slate-50)으로 설정하여 중앙 흰색 컨테이너가 돋보이게 함
    <div className="text-slate-800 bg-slate-50 min-h-screen font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">

      {/* Navigation Bar */}
      <nav className="bg-white/85 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo & Title */}
            <div className="flex-shrink-0 flex items-center gap-2.5 group cursor-pointer w-48">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[20px] block">gavel</span>
              </div>
              <span className="font-manrope font-extrabold text-[19px] text-slate-900 tracking-tight">
                Digital Jurist
              </span>
            </div>

            {/* Center: Tabs (중앙 정렬의 핵심) */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex space-x-1 bg-slate-100/70 p-1 rounded-xl">
                <TabButton
                  active={tab === 'intake'}
                  onClick={() => setTab('intake')}
                  label="사안 접수"
                  icon="post_add"
                />
                <TabButton
                  active={tab === 'documents'}
                  onClick={() => setTab('documents')}
                  label="사안 문서 관리"
                  icon="folder_open"
                />
              </div>
            </div>

            {/* Right: Badge */}
            <div className="flex-shrink-0 flex items-center justify-end w-48 hidden sm:flex">
              <span className="inline-flex items-center gap-1.5 bg-blue-50/80 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100/50">
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                2026-1
              </span>
            </div>

          </div>
        </div>

        {/* Mobile Tabs (모바일에서는 스크롤 가능한 하단 탭으로 변경) */}
        <div className="md:hidden flex space-x-1 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <TabButton active={tab === 'intake'} onClick={() => setTab('intake')} label="사안 접수" />
          <TabButton active={tab === 'documents'} onClick={() => setTab('documents')} label="문서 관리" />
        </div>
      </nav>

      {/* Main Content: 중앙 캔버스 디자인 */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div key={tab} className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200/50 min-h-[600px] overflow-hidden animate-fade-in-up">
          {tab === 'intake' ? <CaseIntake /> : <CaseDocuments />}
        </div>
      </main>

    </div>
  )
}

// 탭 버튼 컴포넌트
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
}

function TabButton({ active, onClick, label, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 px-5 py-2 text-[14px] font-semibold rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
        }`}
      aria-current={active ? 'page' : undefined}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {label}
    </button>
  )
}

export default App