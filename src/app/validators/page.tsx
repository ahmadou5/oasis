import { ValidatorList } from "@/components/ValidatorList";
import { ValidatorFilters } from "@/components/ValidatorFilters";

export default function ValidatorsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold white mb-4">Solana Validators</h1>
        <p className="text-white text-lg max-w-2xl mx-auto">
          Choose from a list of high-performing validators to delegate your SOL
          tokens and start earning staking rewards.
        </p>
      </div>

      <ValidatorFilters />
      <ValidatorList showFilters={false} />
    </div>
  );
}
