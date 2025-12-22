"use client";
import { Hero } from "@/components/Home/Hero";
import { ValidatorList } from "@/components/ValidatorList";
import { PNodesList } from "../components/Xandeum/PNodesList";
import { useAppModeSwitch } from "../hooks/useAppModeStore";

export default function HomePage() {
  const { isNormalMode, isXendiumMode } = useAppModeSwitch();
  return (
    <div className="">
      <Hero />
      {isNormalMode && <ValidatorList />}
      {isXendiumMode && <PNodesList />}
    </div>
  );
}
