"use client";

import type { AccountOverview } from "@/lib/solana/accountOverview";
import { formatDistanceToNow } from "date-fns";

function formatTime(blockTime?: number | null) {
  if (!blockTime) return "Unknown";
  try {
    return formatDistanceToNow(new Date(blockTime * 1000), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

function short(s: string, n = 4) {
  if (s.length <= n * 2 + 3) return s;
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

export function AccountOverviewView({ data }: { data: AccountOverview }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Account
            </div>
            <div className="mt-2 font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
              {data.pubkey}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Type: <span className="font-semibold">{data.kind}</span>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              data.found
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
            }`}
          >
            {data.found ? "Found" : "Not found"}
          </span>
        </div>

        {data.found && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Owner program</div>
              <div className="font-mono text-xs text-gray-900 dark:text-white break-all">
                {data.owner}
              </div>
            </div>
            <div>
              <div className="text-gray-500">SOL balance</div>
              <div className="text-gray-900 dark:text-white">
                {typeof data.sol === "number"
                  ? `${data.sol.toLocaleString(undefined, {
                      maximumFractionDigits: 9,
                    })} SOL`
                  : "-"}
              </div>
              <div className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                {typeof data.lamports === "number"
                  ? `${data.lamports.toLocaleString()} lamports`
                  : ""}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Executable</div>
              <div className="text-gray-900 dark:text-white">
                {String(!!data.executable)}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <a
            className="text-sm text-solana-purple hover:underline"
            href={`https://explorer.solana.com/address/${data.pubkey}?cluster=${data.network}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Solana Explorer
          </a>
        </div>
      </div>

      {data.kind === "wallet" && (
        <div className="card">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            SPL Tokens
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 dark:text-gray-400">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 text-left">Token</th>
                  <th className="py-2 text-left">Mint</th>
                  <th className="py-2 text-right">Balance</th>
                  <th className="py-2 text-right">Program</th>
                </tr>
              </thead>
              <tbody>
                {(data.tokenHoldings ?? []).length === 0 ? (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={4}>
                      No token accounts found.
                    </td>
                  </tr>
                ) : (
                  (data.tokenHoldings ?? []).map((t) => (
                    <tr
                      key={t.tokenAccount}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {t.name ? t.name : "Unknown token"}
                          {t.symbol ? (
                            <span className="text-gray-500 font-normal">{` (${t.symbol})`}</span>
                          ) : null}
                        </div>
                        <div className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400 break-all">
                          {short(t.tokenAccount, 6)}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
                        {t.mint}
                      </td>
                      <td className="py-3 text-right text-gray-900 dark:text-white">
                        {t.amount}
                      </td>
                      <td className="py-3 text-right text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200">
                          {t.program}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.kind === "wallet" && (
        <div className="card">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Stake Accounts
          </div>

          <div className="mt-4 space-y-4">
            {(data.stakeAccounts ?? []).length === 0 ? (
              <div className="text-sm text-gray-500">No stake accounts found.</div>
            ) : (
              (data.stakeAccounts ?? []).map((s) => (
                <div
                  key={s.address}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-xs text-gray-800 dark:text-gray-200 break-all">
                        {s.address}
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500">Voter</div>
                          <div className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                            {s.voter ?? "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Delegated</div>
                          <div className="text-gray-900 dark:text-white">
                            {typeof s.delegatedStakeLamports === "number"
                              ? `${(
                                  s.delegatedStakeLamports / 1_000_000_000
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 9,
                                })} SOL`
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {s.state && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {s.state}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Recent transactions (stake account)
                    </div>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 dark:text-gray-400">
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="py-2 text-left">Signature</th>
                            <th className="py-2 text-left">Time</th>
                            <th className="py-2 text-right">Slot</th>
                            <th className="py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(s.signatures ?? []).length === 0 ? (
                            <tr>
                              <td className="py-3 text-gray-500" colSpan={4}>
                                No transactions.
                              </td>
                            </tr>
                          ) : (
                            (s.signatures ?? []).map((tx) => (
                              <tr
                                key={tx.signature}
                                className="border-b border-gray-100 dark:border-gray-800"
                              >
                                <td className="py-3 font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                                  <a
                                    className="hover:underline text-solana-purple"
                                    href={`/tx/${tx.signature}`}
                                  >
                                    {tx.signature}
                                  </a>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  {formatTime(tx.blockTime)}
                                </td>
                                <td className="py-3 text-right font-mono text-xs">
                                  {tx.slot.toLocaleString()}
                                </td>
                                <td className="py-3 text-right">
                                  {tx.err ? (
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                      Failed
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                      Confirmed
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {(data.walletSignatures ?? []).length > 0 && (
        <div className="card">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Transaction History
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 dark:text-gray-400">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 text-left">Signature</th>
                  <th className="py-2 text-left">Time</th>
                  <th className="py-2 text-right">Slot</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.walletSignatures ?? []).map((tx) => (
                  <tr
                    key={tx.signature}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                      <a
                        className="hover:underline text-solana-purple"
                        href={`/tx/${tx.signature}`}
                      >
                        {tx.signature}
                      </a>
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {formatTime(tx.blockTime)}
                    </td>
                    <td className="py-3 text-right font-mono text-xs">
                      {tx.slot.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      {tx.err ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                          Failed
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          Confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">Raw</div>
        <pre className="mt-3 text-xs overflow-auto bg-black/5 dark:bg-white/5 p-3 rounded-lg">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
