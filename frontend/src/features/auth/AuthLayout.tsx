import type { ReactNode } from 'react'
import { pageIntro, pageTitle } from '../../lib/ui'

type AuthLayoutProps = {
  kicker: string
  title: string
  intro: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthLayout({
  kicker,
  title,
  intro,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1.05fr_1fr]">
        <section className="hidden flex-col justify-between border-r border-line-soft p-10 lg:flex">
          <div>
            <p className="font-display text-3xl font-semibold tracking-[-0.02em]">
              ANGKAT
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              Catatan latihan dan nutrisi
            </p>
          </div>

          <div className="max-w-md">
            <p className="font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.02em]">
              Angka yang tercatat lebih mudah diperbaiki.
            </p>
            <p className="mt-5 text-sm leading-6 text-muted">
              Cut, bulk, maintain. Satu tempat untuk makanan, latihan, berat,
              dan pertanyaan yang muncul di tengah jalan.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line-soft pt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              <span>01 Catat</span>
              <span>02 Latih</span>
              <span>03 Tinjau</span>
            </div>
          </div>

          <p className="text-xs text-muted">
            Dibuat untuk latihan yang konsisten, bukan sempurna.
          </p>
        </section>

        <section className="flex items-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-sm">
            <p className="font-display text-2xl font-semibold tracking-[-0.02em] lg:hidden">
              ANGKAT
            </p>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted lg:mt-0">
              {kicker}
            </p>
            <h1 className={`${pageTitle} mt-2`}>{title}</h1>
            <p className={pageIntro}>{intro}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-6 text-sm text-muted">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  )
}
