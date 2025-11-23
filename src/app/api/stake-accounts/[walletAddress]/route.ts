import { NextResponse } from 'next/server'

// Mock stake accounts data for demonstration
// In a real application, this would fetch from Solana RPC
export async function GET(
  request: Request,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params

    // Mock data - in production, fetch real stake accounts from Solana RPC
    const mockStakeAccounts = [
      {
        address: 'StakeAccount1234567890abcdefghijklmnopqrs',
        validatorAddress: '7K8DVxtNJGnMtUY1CQJT5jcs8sFGSZTDiG7kowvFpECB',
        validatorName: 'Solana Foundation',
        amount: 100.5,
        status: 'active' as const,
        activationEpoch: 485,
        rewards: 2.347,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      },
      {
        address: 'StakeAccount2345678901bcdefghijklmnopqrst',
        validatorAddress: 'Chorus6bBcLaFQdJwvfLzHVFrfhJqkpmALtcMpwY5n5w',
        validatorName: 'Chorus One',
        amount: 250.0,
        status: 'active' as const,
        activationEpoch: 490,
        rewards: 4.892,
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
      },
    ]

    const mockTransactions = [
      {
        signature: 'tx123456789abcdefghijklmnopqrstuvwxyz',
        type: 'delegate' as const,
        amount: 250.0,
        validatorAddress: 'Chorus6bBcLaFQdJwvfLzHVFrfhJqkpmALtcMpwY5n5w',
        validatorName: 'Chorus One',
        status: 'confirmed' as const,
        timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
        blockTime: 12345678,
      },
      {
        signature: 'tx234567890bcdefghijklmnopqrstuvwxyza',
        type: 'delegate' as const,
        amount: 100.5,
        validatorAddress: '7K8DVxtNJGnMtUY1CQJT5jcs8sFGSZTDiG7kowvFpECB',
        validatorName: 'Solana Foundation',
        status: 'confirmed' as const,
        timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
        blockTime: 12345679,
      },
    ]

    return NextResponse.json({
      stakeAccounts: mockStakeAccounts,
      transactions: mockTransactions,
    })
  } catch (error) {
    console.error('Error fetching stake accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stake accounts' },
      { status: 500 }
    )
  }
}