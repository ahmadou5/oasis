import { Hero } from "@/components/Home/Hero";
import { ValidatorList } from "@/components/ValidatorList";
import { StakingStats } from "@/components/StakingStats";

export default function HomePage() {
  return (
    <div className="">
      <Hero />
      {/** <StakingStats />  */}
      <ValidatorList />
    </div>
  );
}
