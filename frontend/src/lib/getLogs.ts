import type { PublicClient } from "viem";

const CHUNK_SIZE = 9_999n;
const MAX_LOOKBACK = 200_000n;

/**
 * Paginated getLogs that respects the 10,000 block range limit
 * imposed by public RPC endpoints like Base Sepolia.
 */
export async function getLogsPaginated(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client: PublicClient | any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Record<string, any>
) {
    const currentBlock = await client.getBlockNumber();
    const startBlock = currentBlock > MAX_LOOKBACK ? currentBlock - MAX_LOOKBACK : 0n;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allLogs: any[] = [];

    for (let from = startBlock; from <= currentBlock; from += CHUNK_SIZE + 1n) {
        const to = from + CHUNK_SIZE > currentBlock ? currentBlock : from + CHUNK_SIZE;
        try {
            const logs = await client.getLogs({
                ...params,
                fromBlock: from,
                toBlock: to,
            });
            allLogs.push(...logs);
        } catch {
            // Skip failed chunks
        }
    }

    return allLogs;
}
