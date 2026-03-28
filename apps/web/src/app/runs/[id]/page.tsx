import Link from 'next/link';
import type { LedgerStateChange, RunStatus } from '../../types';
import RunStatusTimeline from '../../create-run-status-timeline-component-52';

interface RunDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
    const { id } = await params;

    const cpuInstructions = 1_120_000;
    const memoryBytes = 8_200_000;
    const minResourceFee = 3_600;

    const cpuWarn = cpuInstructions >= 900_000;
    const memoryWarn = memoryBytes >= 7_000_000;
    const feeWarn = minResourceFee >= 3_000;

    const ledgerChanges: LedgerStateChange[] = [
        {
            id: 'entry-1',
            entryType: 'ContractData',
            changeType: 'created',
            after: '{"key":"allowance:alice:bob","value":"1000"}',
        },
        {
            id: 'entry-2',
            entryType: 'Account',
            changeType: 'updated',
            before: '{"balance":"10000000","seq":"184"}',
            after: '{"balance":"9800000","seq":"185"}',
        },
        {
            id: 'entry-3',
            entryType: 'TrustLine',
            changeType: 'deleted',
            before: '{"asset":"USDC","limit":"500","balance":"0"}',
        },
    ];

    const changeBadge = {
        created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-900/60',
        updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
        deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900/60',
    };

    return (
        <div className="px-6 md:px-8 max-w-5xl mx-auto w-full py-14">
            <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Run Details</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 py-2 px-3 rounded-lg inline-block">
                            ID: {id}
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="mb-8">
                    <RunStatusTimeline 
                        status="failed" 
                        queuedAt="2024-03-27T10:00:00Z" 
                        startedAt="2024-03-27T10:00:15Z" 
                        finishedAt="2024-03-27T10:15:30Z" 
                    />
                </div>

                <section className="mb-8 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 bg-amber-50/60 dark:bg-amber-950/20">
                    <h2 className="text-lg font-semibold mb-3">Resource Fee Insight</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className={`rounded-lg border p-3 ${cpuWarn ? 'border-amber-300 dark:border-amber-800 bg-amber-100/70 dark:bg-amber-900/20' : 'border-zinc-200 dark:border-zinc-700'}`}>
                            <div className="text-zinc-500 dark:text-zinc-400">CPU</div>
                            <div className="font-semibold">{cpuInstructions.toLocaleString()}</div>
                        </div>
                        <div className={`rounded-lg border p-3 ${memoryWarn ? 'border-amber-300 dark:border-amber-800 bg-amber-100/70 dark:bg-amber-900/20' : 'border-zinc-200 dark:border-zinc-700'}`}>
                            <div className="text-zinc-500 dark:text-zinc-400">Memory</div>
                            <div className="font-semibold">{(memoryBytes / (1024 * 1024)).toFixed(1)} MB</div>
                        </div>
                        <div className={`rounded-lg border p-3 ${feeWarn ? 'border-amber-300 dark:border-amber-800 bg-amber-100/70 dark:bg-amber-900/20' : 'border-zinc-200 dark:border-zinc-700'}`}>
                            <div className="text-zinc-500 dark:text-zinc-400">Min Resource Fee</div>
                            <div className="font-semibold">{minResourceFee.toLocaleString()} stroops</div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-3">Ledger State Change Diff</h2>
                    <div className="space-y-3">
                        {ledgerChanges.map((change) => (
                            <article key={change.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${changeBadge[change.changeType]}`}>
                                        {change.changeType.toUpperCase()}
                                    </span>
                                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-0.5">
                                        {change.entryType}
                                    </span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{change.id}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">Before</div>
                                        <pre className="text-xs rounded-lg bg-zinc-100 dark:bg-zinc-950 p-3 overflow-x-auto whitespace-pre-wrap break-all">
                                            {change.before ?? 'N/A (created)'}
                                        </pre>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">After</div>
                                        <pre className="text-xs rounded-lg bg-zinc-100 dark:bg-zinc-950 p-3 overflow-x-auto whitespace-pre-wrap break-all">
                                            {change.after ?? 'N/A (deleted)'}
                                        </pre>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
