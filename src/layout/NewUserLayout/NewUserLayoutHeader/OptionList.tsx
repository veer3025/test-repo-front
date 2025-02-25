import { FC } from "react";
import DarkLight from "@/layout/CommonLayout/CommonLayoutHeader/DarkLight";
import UserProfile from "@/layout/CommonLayout/CommonLayoutHeader/UserProfile";

const OptionList: FC = () => {
  return (
    <ul className="option-list">
      <DarkLight />
      <UserProfile />
    </ul>
  );
};

export default OptionList;
