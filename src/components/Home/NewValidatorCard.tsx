import { useTheme } from "@/context/ThemeContext";
import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { formatPercent, formatSOL } from "@/utils/formatters";
import clsx from "clsx";
import {
  ArrowDown,
  ChevronDown,
  ChevronUp,
  LocateIcon,
  LucideGlobe2,
  MapPinIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React from "react";

interface ValidatorCardProps {
  validator: ValidatorInfo;
  onSelect: (validator: ValidatorInfo) => void;
}

export const NewValidatorCard: React.FC<ValidatorCardProps> = ({
  validator,
  onSelect,
}) => {
  const router = useRouter();
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
      //onClick={() => setIsGridView(!isGridView)}
      className={`flex items-center ${
        isGridView ? "h-auto" : "h-auto"
      } justify-between bg-gradient-to-r from-green-600/10 ${
        theme === "dark" ? "to-black/15" : "to-white/5"
      }  border-b  border-green-700/50  ${
        theme === "dark" ? "text-white" : "text-black"
      } px-2  py-1`}
    >
      {isGridView ? (
        <div
          className={`flex flex-col w-full h-full py-3 px-6  justify-between`}
        >
          <div className="flex items-center justify-between">
            <div className="flex justify-around px-3 py-3">
              {validator?.avatar ? (
                <Image
                  src={validator.avatar}
                  alt={validator.name}
                  className="w-16 h-16 rounded-full bg-solana-gray-800"
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
              <div className=" ml-3 mr-3 py-3 font-raleway font-bold">
                {validator?.name}
                <div
                  className={clsx(
                    "text-sm capitalize",
                    getStatusColor(validator?.status)
                  )}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
                  {validator?.status}
                </div>
              </div>
            </div>

            <div className="px-5 py-3">
              <button
                onClick={() => setIsGridView(!isGridView)}
                className={`flex py-2 items-center justify-between ${
                  theme === "dark" ? "bg-red-500" : "bg-red-500"
                } text-white flex text-sm px-7  rounded-xl`}
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex items-start justify-start py-1 px-4">
            <p
              className={`font-medium text-base ${
                theme === "dark" ? "text-white/60" : "text-black/60"
              }`}
            >
              {validator?.description}
            </p>
          </div>
          <div className="flex items-center justify-between py-2 px-4">
            <div
              className={`font-medium flex text-base ${
                theme === "dark" ? "text-white/60" : "text-black/60"
              }`}
            >
              <p className="mr-3 font-medium text-base">APY:</p>
              <div className="text-base font-semibold text-solana-green/80">
                {formatPercent(validator?.apy)}
              </div>
            </div>
            <div
              className={`font-medium flex text-base ${
                theme === "dark" ? "text-white/60" : "text-black/60"
              }`}
            >
              <p className="mr-3 font-medium text-base">Commision:</p>
              <div className="text-base font-semibold ">
                {formatPercent(validator?.commission)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 px-4">
            <div
              className={`font-medium flex text-base ${
                theme === "dark" ? "text-white/60" : "text-black/60"
              }`}
            >
              <div className="font-medium text-base">Total SOL Stake:</div>
              <div className="text-base font-medium ml-2 mr-2">
                {formatSOL(validator?.stake)}
              </div>
              <div>{`~ (${(
                validator?.stake * 132
              ).toLocaleString()} USDC)`}</div>
            </div>
            <div
              className={`font-medium flex text-base ${
                theme === "dark" ? "text-white/60" : "text-black/60"
              }`}
            >
              <div className="font-medium text-base">Skip rate:</div>
              <div className="text-base font-semibold ml-2 mr-2">
                {formatPercent(validator?.skipRate)}
              </div>
            </div>
          </div>
          <div className="flex items-start justify-start py-2 px-4">
            <MapPinIcon />

            <div
              className={`font-medium ml-2 mr-2text-base ${
                theme === "dark" ? "text-white/60" : "text-black/60"
              }`}
            >
              {validator?.country}
            </div>
          </div>
          <div className="flex items-start justify-between py-5 px-4">
            <button
              onClick={() => {
                onSelect(validator);
                setIsGridView(false);
              }}
              className="py-3 flex text-sm px-6 bg-green-500/70 rounded-2xl"
            >
              {`Delegate to ${validator?.name}`}
            </button>
            <button
              onClick={() => router.push(`/validator/${validator.address}`)}
              className={`py-3 ${
                theme === "dark" ? "bg-white" : "bg-black/80"
              } ${
                theme === "light" ? "text-white/80" : "text-black/80"
              }  flex text-sm px-6 border border-green-500/70 rounded-2xl`}
            >
              {`${validator?.name} Analytics`}
            </button>
          </div>
        </div>
      ) : (
        <>
          {" "}
          <div className="py-2 px-3 flex items-center justify-between  w-1/6">
            <div className="flex justify-around items-center gap-3  ">
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
                <p className="font-light text-base">
                  {validator?.name.length > 10
                    ? validator?.name.slice(0, 12)
                    : validator?.name}
                </p>
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
              {" "}
              View more
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
