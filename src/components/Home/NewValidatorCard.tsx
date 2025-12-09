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
  X,
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
                  className="lg:w-16 w-12 lg:h-16 h-12 lg:ml-0 ml-2 mr-2 lg:mr-0 rounded-full bg-solana-gray-800"
                  height={12}
                  width={12}
                />
              ) : (
                <div className="lg:w-16 w-12 lg:h-16 h-12 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {validator?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className=" lg:ml-3 lg:mr-3 ml-1 mr-1 lg:py-3 py-1 font-raleway font-bold">
                {validator?.name}
                <div className="bg-green-500/20 rounded-full py-0.5 px-1 flex items-center justify-center lg:py-1 lg:px-1">
                  <div
                    className={clsx(
                      "lg:text-sm text-xs capitalize",
                      getStatusColor(validator?.status)
                    )}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
                    {validator?.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3">
              <div
                onClick={() => setIsGridView(!isGridView)}
                className="border hover:bg-green-500/10 cursor-pointer border-green-400/30 py-2 px-2 rounded-xl"
              >
                <X
                  size={16}
                  className={`${
                    theme === "dark" ? "text-white/80" : "text-black/90"
                  } flex items-center justify-center`}
                />
              </div>
            </div>
          </div>
          <div className="flex items-start justify-start py-1 px-4">
            <p
              className={`font-medium lg:text-base text-sm ${
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
          <div className="flex lg:flex-row flex-col lg:items-center items-start justify-between py-2 px-4">
            <div
              className={`font-medium flex lg:flex-row flex-col items-start  text-base ${
                theme === "dark" ? "text-white/60" : "text-black/60"
              }`}
            >
              <div className="font-medium mb-3 text-base">Total SOL Stake:</div>
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
              <div className="font-medium text-base mt-2">Skip rate:</div>
              <div className="text-base font-semibold ml-2 mt-2 mr-2">
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
              {`Delegate `}
            </button>
            <button
              onClick={() => router.push(`/validator/${validator.address}`)}
              className={`py-3 ${
                theme === "dark" ? "bg-white" : "bg-black/80"
              } ${
                theme === "light" ? "text-white/80" : "text-black/80"
              }  flex text-sm px-6 border border-green-500/70 rounded-2xl`}
            >
              {`Analytics`}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Layout */}
          <div className="flex flex-col sm:hidden w-full p-3 gap-3">
            <div className="flex items-center gap-3">
              {validator?.avatar ? (
                <Image
                  src={validator.avatar}
                  alt={validator.name}
                  className="w-10 h-10 rounded-full bg-solana-gray-800"
                  height={10}
                  width={10}
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-solana-purple to-solana-green">
                  <span className="text-white font-bold text-sm">
                    {validator?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {validator?.name.length > 20
                    ? validator?.name.slice(0, 20) + "..."
                    : validator?.name}
                </p>
                <div
                  className={clsx(
                    "text-xs capitalize",
                    getStatusColor(validator?.status)
                  )}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-1"></span>
                  {validator?.status}
                </div>
              </div>
              <div className="text-sm font-semibold text-solana-green">
                {formatPercent(validator?.apy)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Commission: </span>
                <span className="font-medium">
                  {formatPercent(validator?.commission)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Stake: </span>
                <span className="font-medium">
                  {formatSOL(validator?.stake)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsGridView(!isGridView)}
              className="py-2 flex items-center justify-center text-xs px-4 bg-green-500/70 rounded-lg gap-1"
            >
              View Details
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center w-full">
            <div className="py-2 px-3 flex items-center justify-between w-1/6 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                {validator?.avatar ? (
                  <Image
                    src={validator.avatar}
                    alt={validator.name}
                    className="w-12 h-12 rounded-full bg-solana-gray-800 flex-shrink-0"
                    height={12}
                    width={12}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-solana-purple to-solana-green flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {validator?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-light text-sm lg:text-base truncate">
                    {validator?.name}
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
            <div className="w-1/6 text-sm lg:text-base font-semibold text-solana-green/60 text-center">
              {formatPercent(validator?.apy)}
            </div>
            <div className="w-1/6 text-xs lg:text-sm font-medium text-center">
              {formatPercent(validator?.commission)}
            </div>
            <div className="w-1/6 text-xs lg:text-sm font-medium text-center">
              {formatSOL(validator?.stake)}
            </div>
            <div className="w-1/6 text-sm lg:text-base font-semibold text-solana-green/60 text-center">
              {formatPercent(validator?.skipRate)}
            </div>
            <div className="w-1/6 flex items-end justify-end">
              <button
                onClick={() => setIsGridView(!isGridView)}
                className="py-2 flex items-center text-xs lg:text-sm px-3 lg:px-6 bg-green-500/70 rounded-xl gap-1"
              >
                View more
                {isGridView ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
