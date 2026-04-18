"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(195,59,42,0.18),_transparent_28%),linear-gradient(180deg,_#f5f1e8_0%,_#ebe4d7_42%,_#ddd4c4_100%)] px-6 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,_rgba(17,32,47,0.97),_rgba(44,66,84,0.96))] p-8 text-white shadow-[0_28px_80px_rgba(17,32,47,0.24)] lg:p-12">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.24em] text-white/80">
            Acesso interno
          </span>
          <h1 className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-balance lg:text-6xl">
            Backoffice institucional para conta vinculada, provisões e conciliação.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
            O MVP opera sem portal externo da contratada. O acesso é restrito a perfis
            internos do órgão com sessão assinada e RBAC por rota.
          </p>

          <div className="mt-10 grid gap-3">
            {[
              "Administrador do órgão: acesso completo ao painel, contratos, auditoria e administração.",
              "Analista: foco em contratos, liberações e auditoria processual.",
              "Financeiro: foco em liberações, conta vinculada e conciliação.",
              "Auditoria interna: leitura ampla com trilha de eventos e reconciliação.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-white/80"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-black/8 bg-[rgba(255,253,248,0.92)] p-8 shadow-[0_24px_60px_rgba(17,32,47,0.12)]">
            <div className="mb-8">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Entrar
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                Autenticação institucional interna
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                Para o ambiente local, use um dos e-mails de seed e a senha padrão de
                desenvolvimento configurada no projeto.
              </p>
            </div>

            <form action={formAction} className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--color-ink)]">
                  E-mail institucional
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="beatriz.campos@jmu.mil.br"
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--color-ink)]">Senha</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-[var(--color-accent)]"
                />
              </label>

              {state.error ? (
                <div className="rounded-2xl border border-[rgba(127,47,29,0.14)] bg-[rgba(127,47,29,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
                  {state.error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-6 font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
              >
                {isPending ? "Autenticando..." : "Entrar no backoffice"}
              </button>
            </form>

            <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-[var(--color-surface)] px-4 py-4 text-sm leading-6 text-[var(--color-muted)]">
              <p className="font-semibold text-[var(--color-ink)]">Usuários de seed</p>
              <ul className="mt-2 space-y-1">
                <li>`beatriz.campos@jmu.mil.br`</li>
                <li>`felipe.costa@jmu.mil.br`</li>
                <li>`rafaela.vasques@jmu.mil.br`</li>
                <li>`henrique.dias@jmu.mil.br`</li>
              </ul>
              <p className="mt-3">
                Senha padrão local: `admin123` ou valor de `AUTH_DEV_PASSWORD`.
              </p>
            </div>

            <p className="mt-6 text-sm text-[var(--color-muted)]">
              <Link href="/" className="font-semibold text-[var(--color-accent)]">
                Voltar para a visão institucional
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
