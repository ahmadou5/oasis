import { useTheme } from "@/context/ThemeContext";
import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { formatPercent, formatSOL } from "@/utils/formatters";
import clsx from "clsx";
import { ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import React from "react";

interface ValidatorCardProps {
  validator: ValidatorInfo;
  onSelect: () => void;
}

export const NewValidatorCard: React.FC<ValidatorCardProps> = ({
  validator,
  onSelect,
}) => {
  const { theme } = useTheme();
  const [isGridView, setIsGridView] = React.useState<boolean>(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-solana-green";
      case "delinquent":
        return "text-yellow-400";
      case "inactive":
        return "text-red-400";
      default:
        return "text-solana-gray-400";
    }
  };
  return (
    <div
      className={`flex items-center ${
        isGridView ? "h-[260px]" : "h-auto"
      } justify-between bg-transparent ${
        theme === "dark" ? "to-black/15" : "to-white/5"
      }  border-b border-t border-green-700/50  ${
        theme === "dark" ? "text-white" : "text-black"
      } rounded-xl px-2 mt-1 mb-1 py-1`}
    >
      {isGridView ? (
        <div className="">
          <div className="flex items-center mr-2 ml-2">
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="py-2 flex text-sm px-6 bg-green-500/50 rounded-xl"
            >
              View{" "}
              {isGridView ? (
                <ChevronUp className="" size={19} />
              ) : (
                <ChevronDown className="" size={19} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          {" "}
          <div className="py-2 px-3">
            <div className="flex justify-around items-center gap-3">
              {validator?.avatar ? (
                <Image
                  src={validator.avatar}
                  alt={validator.name}
                  className="w-12 h-12 rounded-full bg-solana-gray-800"
                  height={12}
                  width={12}
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {validator?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="ml-2 mr-3">
                <p className="font-light text-base">{validator?.name}</p>
                <div
                  className={clsx(
                    "text-xs capitalize",
                    getStatusColor(validator?.status)
                  )}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
                  {validator?.status}
                </div>
              </div>
            </div>
          </div>
          <div className="text-base font-semibold text-solana-green/60">
            {formatPercent(validator?.apy)}
          </div>
          <div className="text-sm font-medium">
            {formatPercent(validator?.commission)}
          </div>
          <div className="text-sm font-medium">
            {formatSOL(validator?.stake)}
          </div>
          <div className="text-base font-semibold text-solana-green/60">
            {formatPercent(validator?.skipRate)}
          </div>
          <div className="flex items-center mr-2 ml-2">
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="py-2 flex text-sm px-6 bg-green-500/70 rounded-xl"
            >
              {isGridView ? (
                <ChevronUp className="" size={19} />
              ) : (
                <ChevronDown className="" size={19} />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
