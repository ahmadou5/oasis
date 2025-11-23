import { ValidatorDetail } from '@/components/ValidatorDetail'

interface ValidatorPageProps {
  params: {
    address: string
  }
}

export default function ValidatorPage({ params }: ValidatorPageProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ValidatorDetail validatorAddress={params.address} />
    </div>
  )
}

export async function generateMetadata({ params }: ValidatorPageProps) {
  return {
    title: `Validator ${params.address.slice(0, 8)}... - Stakeit`,
    description: `View details and performance metrics for Solana validator ${params.address}`,
  }
}