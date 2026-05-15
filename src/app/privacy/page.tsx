export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">
        This policy explains what information BTC Pod Summaries collects and how it is used.
      </p>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Data collected</h2>
        <p className="text-sm text-muted-foreground">
          The app stores account information required for authentication and delivery of email
          summaries.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">How data is used</h2>
        <p className="text-sm text-muted-foreground">
          Data is used to authenticate users, send requested content, and improve product
          quality through analytics.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contact</h2>
        <p className="text-sm text-muted-foreground">
          For privacy requests or questions, contact support through the project owner.
        </p>
      </section>
    </main>
  );
}
