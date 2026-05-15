export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">
        These terms govern use of BTC Pod Summaries. By creating an account or using the
        service, users agree to these terms.
      </p>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Use of service</h2>
        <p className="text-sm text-muted-foreground">
          The service is provided as-is and may change over time. Users are responsible for
          lawful and appropriate use.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Accounts</h2>
        <p className="text-sm text-muted-foreground">
          Users are responsible for account security and for actions taken under their
          account.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contact</h2>
        <p className="text-sm text-muted-foreground">
          For questions about these terms, contact support through the project owner.
        </p>
      </section>
    </main>
  );
}
