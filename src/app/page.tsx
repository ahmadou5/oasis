import { Hero } from '@/components/Hero'
import { ValidatorList } from '@/components/ValidatorList'
import { StakingStats } from '@/components/StakingStats'

export default function HomePage() {
  return (
    <div className="space-y-12">
      <Hero />
      <StakingStats />
      <ValidatorList />
    </div>
  )
}